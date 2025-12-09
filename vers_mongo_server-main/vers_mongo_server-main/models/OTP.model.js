const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OTPSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "otp",
  }
);

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
