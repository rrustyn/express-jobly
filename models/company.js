"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFiltered } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find companies, if no filters are included it will show all companies
   * if a filter object id provided { nameLike: 'c3', minEmployees: 2, maxEmployees: 5 }
   *  the results will be filtered
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(searchTerms = {}) {
    let companiesRes;
    if (!Object.keys(searchTerms).length) {
      companiesRes = await db.query(
        `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
             FROM companies
             ORDER BY name`);

    }
    else {
      const { whereStatement, values } = Company.sqlForFiltered(searchTerms);
      companiesRes = await db.query(
        `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
               FROM companies
               WHERE ${whereStatement}
               ORDER BY name`, values);


    }
    return companiesRes.rows;
  }


  /** Create a WHERE statement based on input data
 *
 * { nameLike: 'c3', minEmployees: 2, maxEmployees: 5 } =>
 * {
 * whereStatement: name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3
 * values: ['c3', 2, 5]
 * }
 *
 * @param {obj} search terms
 * @return {obj} SQL parameterized terms
 */
  static sqlForFiltered(data) {
    const keys = Object.keys(data);

    const searchTerms = {
      minEmployees: 'num_employees >=',
      maxEmployees: 'num_employees <=',
      nameLike: 'name ILIKE'
    };

    // {min = 2, max = 3} => ['num_employees >= $1', "num_employees <= $2" ]
    const whereTerms = keys.map((key, idx) => {
      return `${searchTerms[key]} $${idx + 1}`;
    });

    if (data.nameLike) {
      data.nameLike = `%${data.nameLike}%`;
    }

    return {
      whereStatement: whereTerms.join(" AND "),
      values: Object.values(data),
    };
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT c.handle,
              c.name,
              c.description,
              c.num_employees AS "numEmployees",
              c.logo_url AS "logoUrl",
              j.id,
              j.title,
              j.salary,
              j.equity,
              j.company_handle AS "companyHandle"
           FROM companies AS c
           JOIN jobs AS j 
           ON c.handle = j.company_handle
           WHERE c.handle = $1`,
          [handle]);

    const company = companyRes.rows[0];
    const jobs = companyRes.rows.map(row => {
      const job = {
      id: row.id, 
      title: row.title, 
      salary: row.salary, 
      equity: row.equity, 
      companyHandle: row.companyHandle
      }
      return job;
    });

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return {
      handle: company.handle,
      name: company.name,
      description: company.description,
      numEmployees: company.numEmployees,
      logoUrl: company.logoUrl,
      jobs: jobs
    };
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
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

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
