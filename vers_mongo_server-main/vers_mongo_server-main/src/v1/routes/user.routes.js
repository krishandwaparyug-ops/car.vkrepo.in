const express = require("express");
const {
  newUserRegistration,
  newUserDeviceRegistration,
  newUserKycImageRegistration,
  newUserKycRegistration,
} = require("../controllers/user.controllers/register.controller");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const {
  getAllUsersByAdmin,
  getUserDetailsByAdminFromUserId,
  getCurrentUserDetails,
  getUserDeviceChangeList,
} = require("../controllers/user.controllers/get.controller");
const rolePermission = require("../../../permissions/role.permission");
const { ADMIN, USER } = require("../../../global/constants/role.constant");
const {
  isUserORAdminExistByMobileNumber,
} = require("../middlewares/user.middleware/isUserExistByMobile");
const {
  updateUserDetails,
  updateUserRequest,
  updateUserBranchAccess,
  updateUserPassword,
  updateUserDeviceId,
} = require("../controllers/user.controllers/update.controller");
const { sendOTP } = require("../controllers/auth.controllers/otp/sendOTP");
const { verifyOTP } = require("../controllers/auth.controllers/otp/verifyOTP");
const {
  newUserOTPRegistration,
} = require("../controllers/OTP.controllers/register.controller");
const kycUpload = require("../middlewares/upload.middleware/kyc.upload.middleware");
const router = express.Router();

// ADMIN APIs
// ************************
router.get("/", tokenVerifier, rolePermission([ADMIN]), getAllUsersByAdmin);

router.post(
  "/details/id",
  tokenVerifier,
  rolePermission([ADMIN]),
  getUserDetailsByAdminFromUserId
);

router.put(
  "/details",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateUserDetails
);

router.put(
  "/request",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateUserRequest
);
router.put(
  "/branch/access",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateUserBranchAccess
);
router.put(
  "/password",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateUserPassword
);

router.post(
  "/kyc/upload",
  tokenVerifier,
  rolePermission([ADMIN]),
  kycUpload.single("kyc_file"),
  newUserKycImageRegistration
);

router.put(
  "/kyc/update",
  tokenVerifier,
  rolePermission([ADMIN]),
  newUserKycRegistration
);
// ************************

// COMMON APIs
// ************************
router.get(
  "/details",
  tokenVerifier,
  rolePermission([USER, ADMIN]),
  getCurrentUserDetails
);

router.post("/device/id/register", newUserDeviceRegistration);

router.post(
  "/registration",
  isUserORAdminExistByMobileNumber,
  verifyOTP,
  newUserRegistration,
  newUserOTPRegistration,
  (req, res, next) => {
    return res.status(200).json({ message: "User successfully register" });
  }
);

router.post("/send/otp", isUserORAdminExistByMobileNumber, sendOTP);
// ************************

// COMMON APIs
// ************************
router.put(
  "/device/id/update",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateUserDeviceId
);
router.get(
  "/device/id/get",
  tokenVerifier,
  rolePermission([ADMIN]),
  getUserDeviceChangeList
);
// ************************

module.exports = router;
