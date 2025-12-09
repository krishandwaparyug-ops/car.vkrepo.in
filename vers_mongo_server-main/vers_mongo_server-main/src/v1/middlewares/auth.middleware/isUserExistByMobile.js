const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const isUserORAdminExistByMobileNumber = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const isUserExist = await User.findOne({ mobile });
    if (!isUserExist) {
      return next(responseError(404, "Mobile number not exits"));
    }
    req.user = isUserExist._doc;
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserORAdminExistByMobileNumber };
