const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const headOfficeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    branches: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "head_offices",
  }
);

headOfficeSchema.pre("save", function (next) {
  this.name = this.name.replace(/\s+/g, " ");
  next();
});

const HeadOffice = mongoose.model("HeadOffice", headOfficeSchema);

module.exports = HeadOffice;
