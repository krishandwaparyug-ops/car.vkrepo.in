const responseError = require("../errors/responseError");

const rolePermission = (role = []) => {
  return (req, res, next) => {
    if (req.tokenData.authority?.length < 1) {
      return next(responseError(401, "You are not authenticated"));
    }
    if (role.includes(req.tokenData.authority[0])) return next();
    else return next(responseError(403, `You don't have permission`));
  };
};

module.exports = rolePermission;
