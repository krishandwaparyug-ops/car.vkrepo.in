const responseError = require("../../../../errors/responseError");
const OTP = require("../../../../models/OTP.model");

const newUserOTPRegistration = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const value = {
      user_id: req.user?._id || req.body?.user_id,
      otp: otp || Math.floor(100000 + Math.random() * 900000),
    };
    const newOTP = await OTP.create(value);
    await newOTP.save();
    req.otp = newOTP;
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { newUserOTPRegistration };
