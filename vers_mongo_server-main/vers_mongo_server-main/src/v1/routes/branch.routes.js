const express = require("express");
const {
  newBranchRegistration,
} = require("../controllers/branch.controllers/register.controller");
const {
  getBranchesByAdmin,
} = require("../controllers/branch.controllers/get.controller");
const {
  updateBranchDetails,
  updateBranchRecords,
} = require("../controllers/branch.controllers/update.controller");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const { ADMIN } = require("../../../global/constants/role.constant");
const rolePermission = require("../../../permissions/role.permission");
const { deleteBulkVehiclesByBranchId } = require("../controllers/vehicle.controllers/delete.controller");
const { deleteBranchByBranchId } = require("../controllers/branch.controllers/delete.controller");
const router = express.Router();

router.post(
  "/registration",
  tokenVerifier,
  rolePermission([ADMIN]),
  newBranchRegistration
);
router.post("/all", tokenVerifier, rolePermission([ADMIN]), getBranchesByAdmin);

router.put(
  "/update",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateBranchDetails
);
router.delete(
  "/delete",
  tokenVerifier,
  rolePermission([ADMIN]),
  deleteBulkVehiclesByBranchId,
  deleteBranchByBranchId
);
router.delete(
  "/delete/records",
  tokenVerifier,
  rolePermission([ADMIN]),
  deleteBulkVehiclesByBranchId,
  updateBranchRecords
);

module.exports = router;
