"use strict";

/**JOB MODELS TEST */

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
// const Company = require("./company.js");
const Job = require('./jobs');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a job", function () {
  const newJob = {
    title: "new",
    salary: 1000000,
    equity: '0.001',
    companyHandle: "c3",
  };

  test("create job", async function () {

    let job = await Job.create(newJob);

    expect(job).toEqual({
      id: expect.any(Number),
      title: "new",
      salary: 1000000,
      equity: '0.001',
      companyHandle: "c3",
    });

    let result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE company_handle = 'c3'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 1000000,
        equity: "0.001",
        companyHandle: "c3",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {

    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j1',
        salary: 1000000,
        equity: '0.004',
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 2000000,
        equity: '0.004',
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: 'j3',
        salary: 3000000,
        equity: '0.004',
        companyHandle: 'c1'
      },
    ]);
  });
});



/** Tests sqlForFiltered function */
describe("creates parameterized SQL for filtered search", function () {
  // test("creates a statement with valid data", function () {
  //   const data = { nameLike: 'c3', minEmployees: 2, maxEmployees: 5 };

  //   const whereStatement = 'name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3';
  //   const values = ['%c3%', 2, 5];

  //   expect(Company.sqlForFiltered(data)).toEqual({ whereStatement, values });
  // });

  // test("creates a statement when only one input", function () {
  //   const data = { nameLike: 'c3' };

  //   const whereStatement = 'name ILIKE $1';
  //   const values = ['%c3%'];

  //   expect(Company.sqlForFiltered(data)).toEqual({ whereStatement, values });
  // });
});

/**************************************  findFiltered */
describe("findFiltered", function () {

  // test("works: partial name search", async function () {
  //   const data = { nameLike: "3" };

  //   let companies = await Company.findAll(data);

  //   expect(companies).toEqual([{
  //     handle: "c3",
  //     name: "C3",
  //     description: "Desc3",
  //     numEmployees: 3,
  //     logoUrl: "http://c3.img",
  //   }]);

  // });

  // test("works: case insensitive search", async function () {
  //   const data = { nameLike: "c" };

  //   let companies = await Company.findAll(data);

  //   expect(companies).toEqual([
  //     {
  //       handle: "c1",
  //       name: "C1",
  //       description: "Desc1",
  //       numEmployees: 1,
  //       logoUrl: "http://c1.img",
  //     },
  //     {
  //       handle: "c2",
  //       name: "C2",
  //       description: "Desc2",
  //       numEmployees: 2,
  //       logoUrl: "http://c2.img",
  //     },
  //     {
  //       handle: "c3",
  //       name: "C3",
  //       description: "Desc3",
  //       numEmployees: 3,
  //       logoUrl: "http://c3.img",
  //     },
  //   ]);

  // });

  // test("works: all terms", async function () {
  //   const data = { nameLike: "c", minEmployees: 2, maxEmployees: 2 };

  //   let companies = await Company.findAll(data);

  //   expect(companies).toEqual(
  //     [{
  //       handle: "c2",
  //       name: "C2",
  //       description: "Desc2",
  //       numEmployees: 2,
  //       logoUrl: "http://c2.img",
  //     }]);

  // });

  // test("works: no results", async function () {
  //   const data = { minEmployees: 20 };

  //   let companies = await Company.findAll(data);

  //   expect(companies).toEqual([]);

  // });

  // test("works: max employees", async function () {
  //   const data = { maxEmployees: 2 };

  //   let companies = await Company.findAll(data);

  //   expect(companies).toEqual([{
  //     handle: "c1",
  //     name: "C1",
  //     description: "Desc1",
  //     numEmployees: 1,
  //     logoUrl: "http://c1.img",
  //   },
  //   {
  //     handle: "c2",
  //     name: "C2",
  //     description: "Desc2",
  //     numEmployees: 2,
  //     logoUrl: "http://c2.img",
  //   }]);

  // });
});

/************************************** get */

describe("get", function () {

  test("works", async function () {
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
        id: jobIds[0],
        title: 'j1',
        salary: 1000000,
        equity: '0.004',
        companyHandle: 'c1'
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  // const updateData = {
  //   name: "New",
  //   description: "New Description",
  //   numEmployees: 10,
  //   logoUrl: "http://new.img",
  // };

  // test("works", async function () {
  //   let company = await Company.update("c1", updateData);
  //   expect(company).toEqual({
  //     handle: "c1",
  //     ...updateData,
  //   });

  //   const result = await db.query(
  //     `SELECT handle, name, description, num_employees, logo_url
  //          FROM companies
  //          WHERE handle = 'c1'`);
  //   expect(result.rows).toEqual([{
  //     handle: "c1",
  //     name: "New",
  //     description: "New Description",
  //     num_employees: 10,
  //     logo_url: "http://new.img",
  //   }]);
  // });

  // test("works: null fields", async function () {
  //   const updateDataSetNulls = {
  //     name: "New",
  //     description: "New Description",
  //     numEmployees: null,
  //     logoUrl: null,
  //   };

  //   let company = await Company.update("c1", updateDataSetNulls);
  //   expect(company).toEqual({
  //     handle: "c1",
  //     ...updateDataSetNulls,
  //   });

  //   const result = await db.query(
  //     `SELECT handle, name, description, num_employees, logo_url
  //          FROM companies
  //          WHERE handle = 'c1'`);
  //   expect(result.rows).toEqual([{
  //     handle: "c1",
  //     name: "New",
  //     description: "New Description",
  //     num_employees: null,
  //     logo_url: null,
  //   }]);
  // });

  // test("not found if no such company", async function () {
  //   try {
  //     await Company.update("nope", updateData);
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof NotFoundError).toBeTruthy();
  //   }
  // });

  // test("bad request with no data", async function () {
  //   try {
  //     await Company.update("c1", {});
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

/************************************** remove */

describe("remove", function () {
  // test("works", async function () {
  //   await Company.remove("c1");
  //   const res = await db.query(
  //     "SELECT handle FROM companies WHERE handle='c1'");
  //   expect(res.rows.length).toEqual(0);
  // });

  // test("not found if no such company", async function () {
  //   try {
  //     await Company.remove("nope");
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof NotFoundError).toBeTruthy();
  //   }
  // });
});
