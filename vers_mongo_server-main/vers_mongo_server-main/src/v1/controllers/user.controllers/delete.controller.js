const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");
const OTP = require("../../../../models/OTP.model");
const Details = require("../../../../models/details.model");
const UserPlan = require("../../../../models/user_plan.model");
const checkObjectId = require("../../utils/checkObjectId");

const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.tokenData.user._id;

    if (!checkObjectId(user_id)) {
      return next(responseError(406, "Invalid Id"));
    }

    if (currentUserId?.toString() === user_id?.toString()) {
      return next(responseError(406, "You cannot delete your own account"));
    }

    const deletedUser = await User.findByIdAndDelete(user_id);

    if (!deletedUser) {
      return next(responseError(404, "User not found"));
    }

    await Promise.all([
      OTP.deleteMany({ user_id }),
      Details.deleteMany({ user_id }),
      UserPlan.deleteMany({ user_id }),
    ]);

    return res.status(200).json({
      success: true,
      message: "User successfully deleted",
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const deleteUserDeviceIdByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!checkObjectId(user_id)) {
      return next(responseError(406, "Invalid Id"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        deviceId: null,
        requestDeviceId: null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(responseError(404, "User not found"));
    }

    return res.status(200).json({
      success: true,
      message: "User device id successfully deleted",
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = {
  deleteUserByAdmin,
  deleteUserDeviceIdByAdmin,
};
