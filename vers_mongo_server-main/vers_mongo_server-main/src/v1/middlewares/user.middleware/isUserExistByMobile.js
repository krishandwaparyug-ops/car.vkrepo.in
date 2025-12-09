const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const isUserORAdminExistByMobileNumber = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const isUserExist = await User.findOne({ mobile });
    if (!isUserExist) {
      return next();
    }
    return next(responseError(406, "User mobile number already exists"));
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserORAdminExistByMobileNumber };
