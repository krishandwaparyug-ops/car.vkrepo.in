const responseError = require("../../../../errors/responseError");
const Branch = require("../../../../models/branch.model");
const HeadOffice = require("../../../../models/head_office.model");
const checkObjectId = require("../../utils/checkObjectId");

const deleteBranchesByHeadOfficeId = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    const branches = await Branch.find({ head_office_id: _id }).select("_id");
    if (branches.length > 0) {
      await Branch.deleteMany({ head_office_id: _id });
      req.branchIds = branches.map((ids) => ids._id);
      return next();
    }
    res.status(200).json({ message: "Head Office successfully deleted" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const deleteBranchByBranchId = async (req, res, next) => {
  try {
    const { _id, head_office_id } = req.body;
    await Branch.findByIdAndDelete(_id);
    await HeadOffice.findByIdAndUpdate(head_office_id, {
      $inc: { branches: -1 },
    });
    return res.status(200).json({ message: "Branch successfully deleted" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { deleteBranchesByHeadOfficeId, deleteBranchByBranchId };
