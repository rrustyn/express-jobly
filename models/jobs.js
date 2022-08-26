"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFiltered } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
  *
  * data should be {title, salary, equity, company_handle }
  *
  * Returns { id, title, salary, equity, company_handle }
  *
  * Throws BadRequestError if company already in database.
  * */

  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
      `SELECT id
           FROM jobs
           WHERE title = $1 AND company_handle = $2`,
      [title, companyHandle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title} ${companyHandle}`);

    const result = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES  ($1, $2, $3, $4)
    RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];
    // job.equity = parseFloat(job.equity);

    return job;

  }

  /** Find  jobs, if no object is included, will return all jobs,
   *  if a filter is included  {title, minSalary, minEquity, companyHandle }
   * results will be filtered

 * Returns [{ id, title, salary, equity, company_handle }, ...]
 * */

  static async findAll(searchTerms = {}) {
    let jobResults;
    if (!Object.keys(searchTerms).length) {
      jobResults = await db.query(
        `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
               FROM jobs
               ORDER BY title`);
    }
    else {
      const { whereStatement, values } = Job.sqlForFiltered(searchTerms);
      jobResults = await db.query(
        `SELECT id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
                 FROM companies
                 WHERE ${whereStatement}
                 ORDER BY name`, values);
    }
    return jobResults.rows;
  }

  /** Create a WHERE statement based on input data
 *
 * {title, minSalary, minEquity, companyHandle } =>
 * {
 * whereStatement: title ILIKE $1 AND num_employees >= $2 AND num_employees <= $3
 * values: ['c3', 2, 5]
 * }
 *
 * @param {obj} search terms
 * @return {obj} SQL parameterized terms
 */
  static sqlForFiltered(data) {
    const keys = Object.keys(data);

    const searchTerms = {
      minSalary: 'salary >=',
      minEquity: 'equity >=',
      title: 'title ILIKE'
    };

    // {min = 2, max = 3} => ['num_employees >= $1', "num_employees <= $2" ]
    const whereTerms = keys.map((key, idx) => {
      return `${searchTerms[key]} $${idx + 1}`;
    });

    if (data.title) {
      data.title = `%${data.title}%`;
    }

    return {
      whereStatement: whereTerms.join(" AND "),
      values: Object.values(data),
    };
  }

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job at id: ${id}`);

    return job;
  }
  
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }
};


module.exports = Job;