const mongoose = require("mongoose");
const URL =
  process.env.MONGO_URL +
  process.env.MONGO_HOST +
  "/" +
  process.env.MONGO_DB_NAME;

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

module.exports = db;
