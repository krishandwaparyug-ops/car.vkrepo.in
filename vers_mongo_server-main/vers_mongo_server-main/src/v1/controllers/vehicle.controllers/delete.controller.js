const responseError = require("../../../../errors/responseError");
const Vehicle = require("../../../../models/vehicle.model");
const checkObjectId = require("../../utils/checkObjectId");

const deleteBulkVehiclesByBranchId = async (req, res, next) => {
  try {
    const { branchId, _id } = req.body;
    if (!checkObjectId(branchId || _id)) {
      return next(responseError(406, "Invalid branch Id"));
    }
    await Vehicle.deleteMany({ branch_id: branchId || _id });
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const deleteBulkVehiclesByBranchIds = async (req, res, next) => {
  try {
    await Vehicle.deleteMany({ branch_id: { $in: req.branchIds } });
    return res
      .status(200)
      .json({ message: "Head Office Successfully deleted" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};
const deleteVehiclesByVehicleId = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    await Vehicle.deleteOne({ _id: _id });
    return res.status(200).json({ message: "Vehicle successfully deleted" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};
module.exports = {
  deleteBulkVehiclesByBranchId,
  deleteBulkVehiclesByBranchIds,
  deleteVehiclesByVehicleId,
};
