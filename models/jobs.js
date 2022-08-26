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
    // else {
    //   const { whereStatement, values } = Job.sqlForFiltered(searchTerms);
    //   jobResults = await db.query(
    //     `SELECT id,
    //                   title,
    //                   salary,
    //                   equity,
    //                   company_handle AS "companyHandle"
    //              FROM companies
    //              WHERE ${whereStatement}
    //              ORDER BY name`, values);
    // }
    return jobResults.rows;
  }

  /** Create a WHERE statement based on input data
 *
 * {title, minSalary, hasEquity } =>
 * whereStatement: title ILIKE $1 AND minSalary >= $2 AND equity > 0
 * values: ['j1', 1000000, 0.004]
 *
 * }
 *
 * @param {obj} search terms
 * @return {obj} SQL parameterized terms
 */
  static sqlForFiltered(data) {
    const keys = Object.keys(data);
    let whereTerms = [];
    let values = [];
    // loop data

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'title') {
        whereTerms.push(`title ILIKE $${i + 1}`);
        values.push(`%${data[key]}%`);
      }
      if (key === 'minSalary') {
        whereTerms.push(`salary >= $${i + 1}`);
        values.push(data[key]);
      }
      if (key === 'hasEquity' && data[key] === true) {
        whereTerms.push(`equity > 0`);
      }

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
  /** updates {title, salary, equity}
   * => {id, title, salary, equity, company_handle }*/
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});
    const idVarIndex = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIndex}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job for id: ${id}`);

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}






module.exports = Job;