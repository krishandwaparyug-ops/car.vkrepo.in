const express = require("express");
const {
  newHeadOfficeRegistration,
} = require("../controllers/headOffice.controllers/register.controller");
const {
  getHeadOfficesByAdmin,
} = require("../controllers/headOffice.controllers/get.controller");
const {
  updateHeadOfficeDetails,
} = require("../controllers/headOffice.controllers/update.controller");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const rolePermission = require("../../../permissions/role.permission");
const { ADMIN } = require("../../../global/constants/role.constant");
const {
  deleteHeadOfficeDetails,
} = require("../controllers/headOffice.controllers/delete.controller");
const {
  deleteBranchesByHeadOfficeId,
} = require("../controllers/branch.controllers/delete.controller");
const {
  deleteBulkVehiclesByBranchIds,
} = require("../controllers/vehicle.controllers/delete.controller");
const router = express.Router();

router.post(
  "/registration",
  tokenVerifier,
  rolePermission([ADMIN]),
  newHeadOfficeRegistration
);
router.post(
  "/all",
  tokenVerifier,
  rolePermission([ADMIN]),
  getHeadOfficesByAdmin
);
router.put(
  "/update",
  tokenVerifier,
  rolePermission([ADMIN]),
  updateHeadOfficeDetails
);
router.delete(
  "/delete",
  tokenVerifier,
  rolePermission([ADMIN]),
  deleteHeadOfficeDetails,
  deleteBranchesByHeadOfficeId,
  deleteBulkVehiclesByBranchIds
);

module.exports = router;
