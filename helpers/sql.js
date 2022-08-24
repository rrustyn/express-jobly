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




function sqlForFiltered(data) {
  const keys = Object.keys(data);
  // if (keys.length === 0) throw new BadRequestError("No data");
  let x = { min: 'num_employees >=' };
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => {
    if (key === 'name') {
      return `"${jsToSql[colName] || colName}"=$${idx + 1}`;
    }
    ,
  }

  );

const data = { name: 'c3', minEmployees: 2, maxEmployees: 5 };
return {
  whereStatement: cols.join(" AND "),
  values: Object.values(dataToUpdate),
};
}

module.exports = { sqlForPartialUpdate, sqlForFiltered };

  // {name: 'bob', maxEmployees: 3, minEmployees: 1}
/** where based on dynamic input
  * name ILIKE
  * min -- num_employees >= min
  * max -- num_employees <= max
  *
  *  WHERE name ILIKE $1 AND num_employees >= $2 AND  num_employees <= $3
  *
  */