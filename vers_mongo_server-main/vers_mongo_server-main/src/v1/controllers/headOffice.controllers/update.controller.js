const responseError = require("../../../../errors/responseError");
const HeadOffice = require("../../../../models/head_office.model");
const checkObjectId = require("../../utils/checkObjectId");

const updateHeadOfficeDetails = async (req, res, next) => {
  try {
    const { name, _id } = req.body;
    const value = {
      name,
    };
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    const updatedHeadOffice = await HeadOffice.findByIdAndUpdate(
      { _id },
      { ...value }
    );
    if (!updatedHeadOffice) {
      next(responseError(406, "Head Office not updated"));
    }
    res
      .status(200)
      .json({
        message: "Head Office Successfully Updated",
        data: updatedHeadOffice,
      });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(406).json({
        message: `This ${Object.keys(
          error.keyPattern
        )[0].toString()} is already exists`,
      });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

module.exports = { updateHeadOfficeDetails };
