const axios = require("axios");
const responseError = require("../../../../../errors/responseError");

const sendOTP = async (req, res, next) => {
  try {
    const { mobile = "" } = req.body;
    if (mobile.length === 10) {
      const response = await axios.get(
        `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/AUTOGEN/${process.env.OTP_TEMPLATE}`
      );
      return res
        .status(200)
        .json({ success: true, data: response?.data, message: "OTP send" });
    }
    return next(responseError(406, "Invalid mobile number"));
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error?.response?.data,
      message: "OTP not send",
    });
  }
};

module.exports = { sendOTP };
