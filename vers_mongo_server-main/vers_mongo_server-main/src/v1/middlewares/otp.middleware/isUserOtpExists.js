const responseError = require("../../../../errors/responseError");
const OTP = require("../../../../models/OTP.model");

const isUserOTPExists = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { otp } = req.body;
    const isOTPExist = await OTP.findOne({ user_id: _id }).sort({
      createdAt: -1,
    });
    if (!isOTPExist) {
      return next(responseError(404, "Code not found"));
    }
    if (isOTPExist?.otp === parseInt(otp)) {
      return next();
    } else {
      return next(responseError(406, "Code Mismatched"));
    }
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserOTPExists };
