const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileHeaderSchema = new Schema(
  {
    area: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    bkt: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    branch: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    chassis_no: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    contract_no: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    customer_name: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    engine_no: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    ex_name: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    financer: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    gv: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level1: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level1con: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level2: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level2con: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level3: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level3con: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level4: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    level4con: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    mek_and_model: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    od: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    poss: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    rc_no: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    region: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    ses17: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    ses9: {
      type: [String],
      lowercase: true,
      trim: true,
    },
    tbr: {
      type: [String],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "headers",
  }
);

const Header = mongoose.model("Header", fileHeaderSchema);

module.exports = Header;
