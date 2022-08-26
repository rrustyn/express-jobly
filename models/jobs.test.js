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
  test("creates a statement with valid data", function () {

    const data = { title: 'j1', minSalary: 500000, hasEquity: true };

    const whereStatement = 'title ILIKE $1 AND salary >= $2 AND equity > 0';
    const values = ['j1', 1000000];

    expect(Job.sqlForFiltered(data)).toEqual({ whereStatement, values });
  });

  test("creates a statement when only one input", function () {


    const data = { hasEquity: true };
    const whereStatement = 'equity > 0';
    const values = [];

    expect(Job.sqlForFiltered(data)).toEqual({ whereStatement, values });
  });

  test("creates a statement when hasEquity is not there", function () {

    const data = { title: 'j1', minSalary: 500000 };
    const whereStatement = 'title ILIKE $1 AND salary >= $2';
    const values = ['j1', 500000];

    expect(Job.sqlForFiltered(data)).toEqual({ whereStatement, values });
  });

  test("creates a statement when hasEquity is false", function () {

    const data = { title: 'j1', minSalary: 500000, hasEquity: false };
    const whereStatement = 'title ILIKE $1 AND salary >= $2';
    const values = ['j1', 500000];

    expect(Job.sqlForFiltered(data)).toEqual({ whereStatement, values });
  });


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
  const updateData = {
    title: "New",
    salary: 5000,
    equity: 0.999,

  };

  test("works", async function () {

    let job = await Job.update(jobIds[0], updateData);

    expect(job).toEqual({
      id: jobIds[0],
      title: "New",
      salary: 5000,
      equity: "0.999",
      companyHandle: "c1"
    });


    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "New",
      salary: 5000,
      equity: "0.999",
      companyHandle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let company = await Job.update(jobIds[0], updateDataSetNulls);
    expect(company).toEqual({
      id: jobIds[0],
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1"
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id=${jobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
