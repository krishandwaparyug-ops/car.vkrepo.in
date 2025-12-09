const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z ]+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid name.`,
      },
    },
    mobile: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(\+91[\-\s]?)?[6789]\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      required: [true, "Phone number required"],
    },
    address: {
      type: String,
      required: [true, "Address required"],
      trim: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "IN-ACTIVE", "PENDING", "REJECTED", "ACCEPTED"],
      default: "PENDING",
    },
    branchId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches",
      },
    ],
    password: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      trim: true,
    },
    deviceId: {
      type: String,
      trim: true,
      default: null,
    },
    requestDeviceId: {
      type: String,
      trim: true,
      default: null,
    },
    aadharFront: {
      type: String,
      trim: true,
      default: null,
    },
    aadharBack: {
      type: String,
      trim: true,
      default: null,
    },
    panCard: {
      type: String,
      trim: true,
      default: null,
    },
    draCertificate: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.pre("save", function (next) {
  this.name = this.name.replace(/\s+/g, " ");
  this.address = this.address.replace(/\s+/g, " ");
  this.mobile = this.mobile.replace(/\s+/g, "");
  if (this.image) {
    this.image = this.image.replace(/\s+/g, "") || "";
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
