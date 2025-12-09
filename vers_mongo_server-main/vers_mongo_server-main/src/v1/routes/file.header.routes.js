const express = require("express");
const {
  registerNewHeader,
} = require("../controllers/vehicle.controllers/file.header.controller.js/register.controller");
const {
  updateHeader,
} = require("../controllers/vehicle.controllers/file.header.controller.js/update.controller");
const {
  getAllHeader,
} = require("../controllers/vehicle.controllers/file.header.controller.js/get.controller");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const { ADMIN } = require("../../../global/constants/role.constant");
const rolePermission = require("../../../permissions/role.permission");

const router = express.Router();

router.post(
  "/registration",
  tokenVerifier,
  rolePermission([ADMIN]),
  registerNewHeader
);
router.put("/update", tokenVerifier, rolePermission([ADMIN]), updateHeader);
router.get("/", tokenVerifier, rolePermission([ADMIN]), getAllHeader);

module.exports = router;
