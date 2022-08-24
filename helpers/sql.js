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


//make a static function on the class
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
function sqlForFiltered(data) {
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

module.exports = { sqlForPartialUpdate, sqlForFiltered };