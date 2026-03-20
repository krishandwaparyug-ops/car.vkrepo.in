const express = require("express");
const {
  getAllFileInfoByAdmin,
} = require("../controllers/fileInfo.controller/get.controller");
const {
  downloadFileInfo,
} = require("../controllers/fileInfo.controller/download.controller");

const router = express.Router();

router.get("/all", getAllFileInfoByAdmin);
router.get("/download/:_id", downloadFileInfo);

module.exports = router;
