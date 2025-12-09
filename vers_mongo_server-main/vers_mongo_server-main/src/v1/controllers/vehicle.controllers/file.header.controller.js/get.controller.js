const responseError = require("../../../../../errors/responseError");
const Header = require("../../../../../models/file.header.model");

const getAllHeader = async (req, res, next) => {
  try {
    const header = await Header.find();
    return res.status(200).json({ data: header });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getAllHeader };
