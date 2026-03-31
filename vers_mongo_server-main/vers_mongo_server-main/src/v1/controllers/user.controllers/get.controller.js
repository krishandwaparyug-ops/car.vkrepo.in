const User = require("../../../../models/user.model");
const responseError = require("../../../../errors/responseError");
const checkObjectId = require("../../utils/checkObjectId");

// GET ALL USER LIST BY ADMIN
const getAllUsersByAdmin = async (req, res, next) => {
  try {
    const currentUserId = req.tokenData.user._id;
    const users = await User.find({ _id: { $ne: currentUserId } }).sort({
      name: 1,
    });
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

// GET USER DETAILS BY ADMIN BY USER ID
const getUserDetailsByAdminFromUserId = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const currentUserId = req.tokenData.user._id;
    if (!checkObjectId(_id)) return next(responseError(406, "Invalid ID"));
    const users = await User.findById(_id);
    if (!users) {
      return res.status(200).json({ message: "User not found", data: {} });
    }
    if (users._id.toString() === currentUserId) {
      return res.status(200).json({ data: {}, message: "User not found" });
    }
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

// GET CURRENT USER DETAILS (LOGIN USER)
const getCurrentUserDetails = async (req, res, next) => {
  try {
    const currentUserId = req.tokenData.user._id;
    const users = await User.findById(currentUserId);
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const getUserDeviceChangeList = async (req, res, next) => {
  try {
    const users = await User.find({
      $or: [
        { requestDeviceId: { $exists: true, $nin: [null, ""] } },
        { deviceId: { $exists: true, $nin: [null, ""] } },
      ],
    })
      .select("_id mobile name requestDeviceId deviceId")
      .sort({ name: 1 });
    return res.status(200).json({ data: users, success: true });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = {
  getAllUsersByAdmin,
  getUserDetailsByAdminFromUserId,
  getCurrentUserDetails,
  getUserDeviceChangeList,
};
