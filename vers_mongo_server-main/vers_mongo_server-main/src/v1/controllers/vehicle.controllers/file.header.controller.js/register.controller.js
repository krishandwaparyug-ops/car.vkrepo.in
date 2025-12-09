const responseError = require("../../../../../errors/responseError");
const Header = require("../../../../../models/file.header.model");

const registerNewHeader = async (req, res, next) => {
  try {
    const { header = {} } = req.body;
    await Header.create(header);
    return res.status(200).json({ message: "Header registered" });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { registerNewHeader };
