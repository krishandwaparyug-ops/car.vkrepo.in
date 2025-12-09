const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileInfoSchema = new Schema(
  {
    bankId: {
      type: Schema.Types.ObjectId,
      ref: "WebhookBank",
      required: true,
    },
    file_name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    file_path: {
      type: String,
      trim: true,
    },
    vehicle_type: {
      type: String,
      trim: true,
    },
    uploaded_by: {
      type: String,
      trim: true,
      uppercase: true,
    },
    uploaded_date: {
      type: String,
    },
    file_GUID: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "file_info",
  }
);

fileInfoSchema.pre("save", function (next) {
  this.uploaded_by = this.uploaded_by.replace(/\s+/g, " ");
  this.file_name = this.file_name.replace(/\s+/g, " ");
  next();
});

const FileInfo = mongoose.model("FileInfo", fileInfoSchema);

module.exports = FileInfo;
