const responseError = require("../../../../errors/responseError");
const Branch = require("../../../../models/branch.model");
const checkObjectId = require("../../utils/checkObjectId");

const updateBranchDetails = async (req, res, next) => {
  try {
    const {
      name,
      _id,
      contact_one = {
        name: "",
        mobile: "",
      },
      contact_two = {
        name: "",
        mobile: "",
      },
      contact_three = {
        name: "",
        mobile: "",
      },
    } = req.body;
    const value = {
      name,
      contact_one,
      contact_two,
      contact_three,
    };
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    const newBranch = await Branch.findByIdAndUpdate(
      { _id },
      { ...value },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Branch Successfully Updated", data: newBranch });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(406).json({
        message: `This ${Object.keys(
          error.keyPattern
        )[0].toString()} is already exists`,
      });
    }
    return next(responseError(500, "Internal server error"));
  }
};

const updateBranchRecords = async (req, res, next) => {
  try {
    const { _id } = req.body;
    await Branch.findByIdAndUpdate({ _id }, { records: 0 }, { new: true });
    return res.status(200).json({ message: "Record Successfully Deleted" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { updateBranchDetails, updateBranchRecords };
