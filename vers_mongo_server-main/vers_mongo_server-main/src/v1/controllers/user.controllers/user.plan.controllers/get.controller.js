const UserPlan = require("../../../../../models/user_plan.model");
const responseError = require("../../../../../errors/responseError");

const getAllUserPlanByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const userPlans = await UserPlan.find({ user_id }).sort({ createdAt: -1 });
    return res.status(200).json({ data: userPlans });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const getUserPlanByUser = async (req, res, next) => {
  try {
    const { _id } = req.tokenData.user;
    const userPlan = await UserPlan.find({ user_id: _id })
      .sort({ createdAt: -1 })
      .limit(1);
    if (userPlan.length === 0) {
      return next(responseError(404, "You have not any plan"));
    }
    return res.status(200).json({ data: userPlan?.[0] });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getAllUserPlanByAdmin, getUserPlanByUser };
