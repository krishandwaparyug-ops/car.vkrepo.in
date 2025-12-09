const responseError = require("../../../../errors/responseError");
const HeadOffice = require("../../../../models/head_office.model");
const checkObjectId = require("../../utils/checkObjectId");

const deleteHeadOfficeDetails = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (!checkObjectId(_id)) {
      return next(responseError(406, "Invalid Id"));
    }
    await HeadOffice.findByIdAndDelete(_id);
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { deleteHeadOfficeDetails };
