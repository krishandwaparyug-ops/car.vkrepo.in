const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");
const checkObjectId = require("../../utils/checkObjectId");
const bcrypt = require("bcryptjs");

const updateUserDetails = async (req, res, next) => {
  try {
    const {
      _id,
      name,
      status = "IN-ACTIVE",
      mobile,
      address,
      role = "USER",
    } = req.body;
    const value = {
      name,
      mobile,
      address,
      status,
      role,
    };
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    const updatedUser = await User.findByIdAndUpdate(_id, value, { new: true });
    return res.status(200).json({
      message: "User successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const updateUserRequest = async (req, res, next) => {
  try {
    const { _id, status = "REJECTED" } = req.body;
    const value = {
      status,
    };
    const updatedUser = await User.findByIdAndUpdate(_id, value, { new: true });
    return res.status(200).json({
      message: `User request successfully ${status.toLowerCase()}`,
      data: updatedUser,
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const updateUserBranchAccess = async (req, res, next) => {
  try {
    let updatedUser = "";
    const { _id, branch_id } = req.body;
    const findUser = await User.findById(_id);
    if (findUser) {
      if (findUser.branchId.includes(branch_id)) {
        updatedUser = await User.findByIdAndUpdate(
          _id,
          { $pull: { branchId: branch_id } },
          { new: true }
        );
      } else {
        updatedUser = await User.findByIdAndUpdate(
          _id,
          { $push: { branchId: branch_id } },
          { new: true }
        );
      }
    }

    res.status(200).json({
      message: `Branch access successfully updated`,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return next(responseError(500, "Internal server error"));
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const { _id, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      { new: true }
    );
    if (!updatedUser) {
      return next(responseError(406, "Password not updated"));
    }
    return res.status(200).json({
      message: `Password successfully updated`,
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const updateUserDeviceId = async (req, res, next) => {
  try {
    const { user_id, status } = req.body;

    const isUserExist = await User.findById(user_id);

    if (!isUserExist) {
      return next(responseError(404, "User not exists"));
    }
    if (status === "ACCEPTED") {
      const value = {
        requestDeviceId: null,
        deviceId: isUserExist.requestDeviceId,
      };
      await User.findByIdAndUpdate(user_id, value);
    }
    return res.status(200).json({
      message: `User device successfully updated`,
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = {
  updateUserDetails,
  updateUserRequest,
  updateUserBranchAccess,
  updateUserPassword,
  updateUserDeviceId,
};
