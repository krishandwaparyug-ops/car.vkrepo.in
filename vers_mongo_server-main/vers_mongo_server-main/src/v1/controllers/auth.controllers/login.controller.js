const responseError = require("../../../../errors/responseError");
const jwt = require("jsonwebtoken");

const AuthLogin = (req, res, next) => {
  try {
    const { branch_id, password, ...otherData } = req.user;
    const token = jwt.sign(
      { user: { ...otherData }, authority: [req.user.role] },
      process.env.PRIVATEKEY
    );
    return res.status(200).json({ token: token, data: otherData });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = AuthLogin;
