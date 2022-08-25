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
  test("isAdmin can change", function () {

    // mocking
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });

  test("is current user but not admin", function () {
    expect.assertions(1);
    const req = { params: { username: 'u1' } };
    const res = { locals: { user: { username: "u1" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });


  test("is not admin or current user can't change", function () {
    expect.assertions(1);
    const req = { params: { username: 'u1' } };
    const res = { locals: { user: { username: "u2" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureIsAdminOrCurrentUser(req, res, next);
  });
});