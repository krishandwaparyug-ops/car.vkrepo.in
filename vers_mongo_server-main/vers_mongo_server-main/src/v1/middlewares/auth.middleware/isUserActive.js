const responseError = require("../../../../errors/responseError");

const isUserActive = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.status !== "ACTIVE") {
      return next(responseError(406, "You have been deactivated by an admin"));
    }
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserActive };
