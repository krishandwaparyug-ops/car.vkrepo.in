const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPlanSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "user_plan",
  }
);

const UserPlan = mongoose.model("UserPlan", userPlanSchema);

module.exports = UserPlan;
