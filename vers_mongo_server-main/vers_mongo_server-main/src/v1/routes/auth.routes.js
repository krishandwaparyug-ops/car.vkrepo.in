const express = require("express");
const {
  isUserORAdminExistByMobileNumber,
} = require("../middlewares/auth.middleware/isUserExistByMobile");
const { verifyOTP } = require("../controllers/auth.controllers/otp/verifyOTP");
const AuthLogin = require("../controllers/auth.controllers/login.controller");
const { sendOTP } = require("../controllers/auth.controllers/otp/sendOTP");
const { isUserAccess } = require("../middlewares/auth.middleware/isUserAccess");
const {
  isUserOTPExists,
} = require("../middlewares/otp.middleware/isUserOtpExists");
const { isUserAdmin } = require("../middlewares/auth.middleware/isUserAdmin");
const { isUserActive } = require("../middlewares/auth.middleware/isUserActive");
const {
  verifyPassword,
  verifyPasswordForAndroidAdmin,
} = require("../controllers/auth.controllers/otp/verifyPassword");
const {
  isUserDeviceIdMatched,
} = require("../middlewares/auth.middleware/isUserDeviceIdMatched");
const router = express.Router();

// Web Admin Login
router.post(
  "/login",
  isUserORAdminExistByMobileNumber,
  isUserActive,
  isUserAdmin,
  verifyPassword,
  verifyOTP,
  AuthLogin
);

// Android User & Web Login
router.post(
  "/android/login",
  isUserORAdminExistByMobileNumber,
  isUserDeviceIdMatched,
  isUserAccess,
  isUserOTPExists,
  AuthLogin
);

router.post(
  "/android/login/password",
  isUserORAdminExistByMobileNumber,
  isUserDeviceIdMatched,
  isUserAdmin,
  verifyPasswordForAndroidAdmin,
);

router.post("/send", isUserORAdminExistByMobileNumber, isUserAccess, sendOTP);

module.exports = router;
