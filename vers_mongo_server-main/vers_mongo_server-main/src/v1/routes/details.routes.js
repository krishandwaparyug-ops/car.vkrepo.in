const express = require("express");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const { getAllDetailsByAdmin, getAllUserLastLocation } = require("../controllers/details.controllers/get.controller");
const { ADMIN } = require("../../../global/constants/role.constant");
const rolePermission = require("../../../permissions/role.permission");

const router = express.Router();

router.post(
  "/all",
  tokenVerifier,
  rolePermission([ADMIN]),
  getAllDetailsByAdmin
);

router.post(
  "/last/location",
  tokenVerifier,
  rolePermission([ADMIN]),
  getAllUserLastLocation
);

module.exports = router;
