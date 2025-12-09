const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webhookBankSchema = new Schema(
  {
    bank_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
    collection: "webhook_banks",
  }
);

const WebhookBank = mongoose.model("WebhookBank", webhookBankSchema);

module.exports = WebhookBank;
