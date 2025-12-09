const responseError = require("../../../../errors/responseError");
const Branch = require("../../../../models/branch.model");

const getBranchesByAdmin = async (req, res, next) => {
  try {
    const branches = await Branch.find();
    return res.status(200).json({ length: branches.length, data: branches });
  } catch (error) {
    return next(responseError(500, "internal server error"));
  }
};

module.exports = { getBranchesByAdmin };
