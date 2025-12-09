const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailsSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rc_no: {
      type: String,
    },
    chassis_no: {
      type: String,
    },
    engine_no: {
      type: String,
    },
    mek_and_model: {
      type: String,
    },
    location: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    vehicle_status: {
      type: String,
      enum: ["FOUND", "NOT FOUND"],
      default: "NOT FOUND",
    }
  },
  {
    timestamps: true,
    collection: "details",
  }
);

const Details = mongoose.model("Details", detailsSchema);

module.exports = Details;
