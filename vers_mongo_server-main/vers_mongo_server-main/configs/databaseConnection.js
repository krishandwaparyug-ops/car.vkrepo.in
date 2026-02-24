const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("Mongo Error:", err));

module.exports = mongoose.connection;