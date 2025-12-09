const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const getUserDetailsByUserId = async (req, res, next) => {
  try {
    const { _id } = req.tokenData.user;
    const isUserExist = await User.findById(_id);
    if (!isUserExist) {
      return next(responseError(404, "User not found"));
    }
    req.user = isUserExist;
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getUserDetailsByUserId };
