const express = require("express");
const {
  getAllFileInfoByAdmin,
} = require("../controllers/fileInfo.controller/get.controller");

const router = express.Router();

router.get("/all", getAllFileInfoByAdmin);

module.exports = router;
