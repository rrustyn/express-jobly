"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const { BadRequestError, ForbiddenError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/


router.post("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/


router.get("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: logged in as current user or admin
 **/

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  // TODO: use middleware
  if (res.locals.user.username !== req.params.username
    && res.locals.user.isAdmin !== true) {
    throw new ForbiddenError();
  }

  const user = await User.get(req.params.username);

  return res.json({ user });
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: logged in as current user or admin
 **/


router.patch("/:username", ensureLoggedIn, async function (req, res, next) {

  if (res.locals.user.username !== req.params.username
    && res.locals.user.isAdmin !== true) {
    throw new ForbiddenError();
  }

  const validator = jsonschema.validate(
    req.body,
    userUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.update(req.params.username, req.body);
  return res.json({ user });
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: logged in as current user or admin
 **/
// TODO :admin OR that user
router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
  if (res.locals.user.username !== req.params.username
    && res.locals.user.isAdmin !== true) {
    throw new ForbiddenError();
  }
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});


module.exports = router;
