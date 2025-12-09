const responseError = require("../../../../errors/responseError");
const Details = require("../../../../models/details.model");

const registerNewDetailsWhenUserSearch = async (req, res, next) => {
  try {
    const { rc_no, chassis_no, engine_no, mek_and_model } = req?.vehicle;
    const { location, latitude, longitude } = req.body;
    const value = {
      rc_no,
      chassis_no,
      engine_no,
      mek_and_model,
      location,
      latitude,
      longitude,
      user_id: req.tokenData.user._id,
      vehicle_status: !req.vehicle ? "NOT FOUND" : "FOUND",
    };
    await Details.create(value);
    return res.status(200).json({ data: req.vehicle });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { registerNewDetailsWhenUserSearch };
