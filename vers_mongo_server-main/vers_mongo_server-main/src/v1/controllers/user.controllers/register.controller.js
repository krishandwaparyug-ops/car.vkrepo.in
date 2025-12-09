const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const newUserRegistration = async (req, res, next) => {
  try {
    const { name, mobile, address, role = "USER", device_id } = req.body;
    const value = {
      name,
      mobile,
      address,
      status: "PENDING",
      role,
      deviceId: device_id,
    };
    const newUser = await User.create(value);
    if (!newUser) {
      next(responseError(406, "User not created"));
    }
    await newUser.save();
    req.user = newUser;
    return next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

const newUserDeviceRegistration = async (req, res, next) => {
  try {
    const { device_id, mobile } = req.body;
    const value = {
      requestDeviceId: device_id,
    };
    const newUser = await User.findOneAndUpdate({ mobile }, value, {
      new: true,
    });
    if (!newUser) {
      next(responseError(406, "Something went wrong"));
    }
    return res.status(200).json({
      message: "User device successfully registered",
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const newUserKycRegistration = async (req, res, next) => {
  try {
    const { aadharFront, aadharBack, panCard, id, draCertificate } = req.body;
    const value = {
      aadharFront: aadharFront ? aadharFront : null,
      aadharBack: aadharBack ? aadharBack : null,
      panCard: panCard ? panCard : null,
      draCertificate: draCertificate ? draCertificate : null,
    };
    await User.findByIdAndUpdate(id, value, { new: true });
    return res.status(200).json({ message: "User KYC successfully created" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};
const newUserKycImageRegistration = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(responseError(406, "File not uploaded"));
    }
    return res.status(200).json({ message: "File successfully uploaded", data: {
      path: req.file.path
    } });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = {
  newUserRegistration,
  newUserDeviceRegistration,
  newUserKycRegistration,
  newUserKycImageRegistration,
};
