const express = require("express");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const rolePermission = require("../../../permissions/role.permission");
const { ADMIN, USER } = require("../../../global/constants/role.constant");
const {
  getAllUserPlanByAdmin,
  getUserPlanByUser,
} = require("../controllers/user.controllers/user.plan.controllers/get.controller");
const { newUserPlanRegistration } = require("../controllers/user.controllers/user.plan.controllers/register.controller");
const router = express.Router();

// ADMIN APIs
// ************************
router.post("/all", tokenVerifier, rolePermission([ADMIN]), getAllUserPlanByAdmin);
router.post("/registration", tokenVerifier, rolePermission([ADMIN]), newUserPlanRegistration);
// ************************
// USER APIs
// ************************
router.get("/plan", tokenVerifier,  rolePermission([USER]), getUserPlanByUser);
// ************************
module.exports = router;
