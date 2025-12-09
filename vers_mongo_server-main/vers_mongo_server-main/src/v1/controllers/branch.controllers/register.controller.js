const responseError = require("../../../../errors/responseError");
const Branch = require("../../../../models/branch.model");
const HeadOffice = require("../../../../models/head_office.model");

const newBranchRegistration = async (req, res, next) => {
  const {
    name,
    head_office_id,
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
    head_office_id,
    contact_one,
    contact_two,
    contact_three,
  };
  try {
    const newBranch = await Branch.create(value);
    if (!newBranch) {
      return next(responseError(406, "Branch not created"));
    }
    await newBranch.save();
    await HeadOffice.findByIdAndUpdate(head_office_id, {
      $inc: { branches: 1 },
    });
    res
      .status(200)
      .json({ message: "Branch Successfully Registered", data: newBranch });
  } catch (error) {
    if (error?.code === 11000) {
      return next(
        responseError(
          406,
          `This ${Object.keys(
            error.keyPattern
          )[0].toString()} is already exists`
        )
      );
    }
    return next(responseError(500, "Internal server"));
  }
};

module.exports = { newBranchRegistration };
