// TODO: use ensured logged in is inside admin
"use strict";

const { UnauthorizedError } = require("../expressError");

/** Middleware to use to check if user is an admin or user for the route.
 *
 * If not, raises Unauthorized.
 */

function ensureIsAdminOrCurrentUser(req, res, next) {
  try {
    if (!res.locals.user ||
      (res.locals.user.username !== req.params.username
        && res.locals.user.isAdmin !== true)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { ensureIsAdminOrCurrentUser }