const responseError = require("../../../../errors/responseError");
const HeadOffice = require("../../../../models/head_office.model");

const getHeadOfficesByAdmin = async (req, res, next) => {
  try {
    const headOffices = await HeadOffice.find()
    return res.status(200).json({ length: headOffices.length, data: headOffices });
  } catch (error) {
    return next(responseError(500, 'internal server error'))
  }
};

module.exports = { getHeadOfficesByAdmin };
