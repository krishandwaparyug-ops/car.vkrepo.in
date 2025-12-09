const axios = require("axios");
const responseError = require("../../../../../errors/responseError");

const verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp, type = "password" } = req.body;
    if (type === "password") {
      return next();
    }
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY3/${mobile}/${otp}`
    );
    if (response.data.Details === "OTP Matched") {
      return next();
    } else {
      return next(responseError(406, "OTP Mismatched"));
    }
  } catch (error) {
    return res.status(400).json({
      response: error?.response?.data || error?.message || error.toString(),
    });
  }
};

module.exports = { verifyOTP };
