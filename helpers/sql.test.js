"use strict";

const { sqlForPartialUpdate, sqlForFiltered } = require("./sql");
const { BadRequestError } = require("../expressError");

/** Tests sqlForPartialUpdate function */
describe("creates parameterized SQL", function () {
  test("creates a statement with valid data", function () {
    const data = { firstName: 'Aliya', age: 32 };

    expect(sqlForPartialUpdate(data, {})).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test("creates a statement with valid data and formatting", function () {
    const data = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name" };

    expect(sqlForPartialUpdate(data, jsToSql)).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test("throws error with invalid data", function () {
    const data = {};

    expect(() => { sqlForPartialUpdate(data, {}); })
      .toThrowError(BadRequestError);
  });
});


/** Tests sqlForFiltered function */
describe("creates parameterized SQL for filtered search", function () {
  test("creates a statement with valid data", function () {
    const data = { name: 'c3', minEmployees: 2, maxEmployees: 5 };

    const whereStatement = 'name ILIKE $1 AND num_employees >= $2 AND  num_employees <= $3';
    const values = ['c3', 2, 5];

    expect(sqlForFiltered(data)).toEqual({ whereStatement, values });
  });


});