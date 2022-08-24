"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


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