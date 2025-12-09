const express = require("express");
const { tokenVerifier } = require("../../../global/middlewares/tokenVerifier");
const rolePermission = require("../../../permissions/role.permission");
const { ADMIN, USER } = require("../../../global/constants/role.constant");
const {
  getVehiclesByUserOnSearch,
  getVehicleDetailsByUserFromVehicleId,
  getVehiclesByAdminOnSearch,
  getDuplicateRecordsByRcNumberOrChassisNo,
  downloadVehicleByBranchId,
} = require("../controllers/vehicle.controllers/get.controller");
const csvUpload = require("../middlewares/upload.middleware/csv.upload.middleware");
const {
  deleteBulkVehiclesByBranchId,
  deleteVehiclesByVehicleId,
} = require("../controllers/vehicle.controllers/delete.controller");
const {
  newBulkVehicleRegistration,
} = require("../controllers/vehicle.controllers/register.controller");
const {
  registerNewDetailsWhenUserSearch,
} = require("../controllers/details.controllers/register.controller");
const {
  getUserDetailsByUserId,
} = require("../middlewares/user.middleware/getUserDetailsByUserId");
const { isUserAccess } = require("../middlewares/auth.middleware/isUserAccess");
const {
  isUserDeviceIdMatched,
} = require("../middlewares/auth.middleware/isUserDeviceIdMatched");

const router = express.Router();

// ADMIN APIs
// ************************

router.post(
  "/admin/insert",
  csvUpload.single("csv_file"),
  deleteBulkVehiclesByBranchId,
  newBulkVehicleRegistration
);

router.post(
  "/admin/pagination",
  tokenVerifier,
  rolePermission([ADMIN]),
  getVehiclesByAdminOnSearch
);

router.post(
  "/admin/details/duplicate",
  tokenVerifier,
  rolePermission([ADMIN]),
  getDuplicateRecordsByRcNumberOrChassisNo
);
router.post(
  "/admin/records/download/:branchId",
  // tokenVerifier,
  // rolePermission([ADMIN]),
  downloadVehicleByBranchId
);
router.delete(
  "/admin/records/delete",
  tokenVerifier,
  rolePermission([ADMIN]),
  deleteVehiclesByVehicleId
);
// ************************

// USER APIs
// ************************
router.post(
  "/user/pagination",
  tokenVerifier,
  getUserDetailsByUserId,
  isUserDeviceIdMatched,
  isUserAccess,
  rolePermission([USER]),
  getVehiclesByUserOnSearch
);

router.post(
  "/user/details/id",
  tokenVerifier,
  getUserDetailsByUserId,
  isUserDeviceIdMatched,
  rolePermission([USER]),
  getVehicleDetailsByUserFromVehicleId,
  registerNewDetailsWhenUserSearch
);
// ************************

module.exports = router;
