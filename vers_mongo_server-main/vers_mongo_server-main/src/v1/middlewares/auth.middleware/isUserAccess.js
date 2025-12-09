const responseError = require("../../../../errors/responseError");

const isUserAccess = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.status === "PENDING") {
      return next(responseError(406, "Your request is in pending state"));
    }
    if (user.status === "IN-ACTIVE") {
      return next(responseError(406, "You are inactivated by admin"));
    }
    if (user.status === "REJECTED") {
      return next(responseError(406, "You request has been rejected"));
    }
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserAccess };
