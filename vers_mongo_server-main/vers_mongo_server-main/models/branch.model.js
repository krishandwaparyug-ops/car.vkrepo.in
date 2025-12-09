const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    head_office_id: {
      type: Schema.Types.ObjectId,
      ref: "HeadOffice",
      required: true,
    },
    contact_one: {
      name: {
        type: String,
      },
      mobile: {
        type: String,
      },
    },
    contact_two: {
      name: {
        type: String,
      },
      mobile: {
        type: String,
      },
    },
    contact_three: {
      name: {
        type: String,
      },
      mobile: {
        type: String,
      },
    },
    records: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "branches",
  }
);

branchSchema.pre("save", function (next) {
  this.name = this.name.replace(/\s+/g, " ");
  this.contact_one.name = this.contact_one.name.replace(/\s+/g, " ");
  this.contact_two.name = this.contact_two.name.replace(/\s+/g, " ");
  next();
});

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
