const responseError = require("../../../../errors/responseError");
const HeadOffice = require("../../../../models/head_office.model");

const newHeadOfficeRegistration = async (req, res, next) => {
  try {
    const { name } = req.body;
    const value = {
      name,
    };
    const newHeadOffice = await HeadOffice.create(value);
    if (!newHeadOffice) {
      next(responseError(406, "Head Office not created"));
    }
    await newHeadOffice.save();
    res.status(200).json({
      message: "Head Office Successfully Registered",
      data: newHeadOffice,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(406).json({
        message: `This ${Object.keys(
          error.keyPattern
        )[0].toString()} is already exists`,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { newHeadOfficeRegistration };
