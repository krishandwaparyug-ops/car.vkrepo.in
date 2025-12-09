const responseError = require("../../../../../errors/responseError");
const bcrypt = require("bcryptjs");
const verifyPassword = async (req, res, next) => {
  try {
    const { password, type = "password" } = req.body;
    if (type === "password") {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        req?.user?.password
      );
      if (!isPasswordCorrect) {
        return next(responseError(401, "Invalid Credentials"));
      }
      return next();
    }
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};


const verifyPasswordForAndroidAdmin = async (req, res, next) => {
  try {
    const { password } = req.body;
      const isPasswordCorrect = await bcrypt.compare(
        password,
        req?.user?.password
      );
      if (!isPasswordCorrect) {
        return res.status(200).json({success: false, message: 'Invalid Credentials'});
      }
      return res.status(200).json({success: true, message: 'Password Matched'});
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { verifyPassword, verifyPasswordForAndroidAdmin };
