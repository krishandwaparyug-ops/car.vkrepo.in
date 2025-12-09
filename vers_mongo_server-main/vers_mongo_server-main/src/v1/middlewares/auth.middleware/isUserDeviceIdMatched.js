const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const isUserDeviceIdMatched = async (req, res, next) => {
  try {
    const user = req.user;
    const { device_id } = req.body;

    if (!device_id) {
      return next(responseError(406, "Device Id required"));
    }

    if (!user.deviceId) {
      await User.findByIdAndUpdate(user._id, { deviceId: device_id });
      return next();
    }

    if (user.deviceId !== device_id) {
      return next(
        responseError(401, "You mobile number not matched with this device id")
      );
    }
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { isUserDeviceIdMatched };
