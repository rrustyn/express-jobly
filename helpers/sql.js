const { BadRequestError } = require("../expressError");

/** Takes an object of columns and data to update and returns a parameterized
 * version to use in an SQL statement
 * 
 * @param {obj} dataToUpdate 
 * @param {obj} jsToSql an object relating camelCase columns to snake_case
 * i.e {firstName: "first_name"}
 * @returns {obj} 
 * {
 *  setCols: a string that is a parameterized statement, 
 *  values: an array of values for statement in setCols
 * }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };