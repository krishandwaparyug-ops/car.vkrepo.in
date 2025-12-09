const responseError = require("../../../../../errors/responseError");
const Header = require("../../../../../models/file.header.model");

const updateHeader = async (req, res, next) => {
  try {
    const { header = {} } = req.body;
    await Header.updateMany({}, { $addToSet: header });
    return res.status(200).json({ message: "Header registered" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { updateHeader };
