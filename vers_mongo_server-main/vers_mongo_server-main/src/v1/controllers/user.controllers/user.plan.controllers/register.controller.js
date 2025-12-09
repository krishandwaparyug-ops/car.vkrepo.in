const UserPlan = require("../../../../../models/user_plan.model");
const responseError = require("../../../../../errors/responseError");

const newUserPlanRegistration = async (req, res, next) => {
  try {
    const { user_id, endDate, startDate } = req.body;
    const value = {
      user_id,
      endDate,
      startDate,
    };
    const newUserPlan = await UserPlan.create(value);
    if (!newUserPlan) {
      next(responseError(406, "User Plan not created"));
    }
    await newUserPlan.save();
    res.status(200).json({ data: newUserPlan });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { newUserPlanRegistration };
