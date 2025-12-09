const responseError = require("../../../../errors/responseError");

const isUserAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "ADMIN") {
      return next(responseError(406, "You are not an admin"));
    }
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserAdmin };
