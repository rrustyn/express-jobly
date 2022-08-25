"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const {

  ensureIsAdminOrCurrentUser
} = require("./user");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const adminJwt = jwt.sign({ username: "admin", isAdmin: true }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("ensureIsAdmin and current user", function () {
  test("isAdmin no error", function () {

    // mocking
    expect.assertions(1);
    const req = { params: { username: 'u1' } };
    const res = { locals: { user: { isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });

  test("current user no error", function () {
    expect.assertions(1);
    const req = { params: { username: 'u1' } };
    const res = { locals: { user: { username: "u1" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });


  test("not admin or user unauth", function () {
    expect.assertions(1);
    const req = { params: { username: 'u1' } };
    const res = { locals: { user: { username: "u2" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });
});