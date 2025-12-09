const express = require("express");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const rolePermission = require("../../../permissions/role.permission");
const { ADMIN } = require("../../../global/constants/role.constant");
const { getAllOTPs } = require("../controllers/OTP.controllers/get.controller");
const {
  newUserOTPRegistration,
} = require("../controllers/OTP.controllers/register.controller");

const router = express.Router();

// ADMIN APIs
// ************************

router.get("/", tokenVerifier, rolePermission([ADMIN]), getAllOTPs);
router.post("/generate", tokenVerifier, newUserOTPRegistration, (req, res) => {
  return res.status(200).json({ success: true, data: req?.otp });
});

module.exports = router;
