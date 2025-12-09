const responseError = require("../../../../errors/responseError");
const checkObjectId = require("../../utils/checkObjectId");
const path = require("path");
const CSVToJSON = require("csvtojson");
const { exec } = require("child_process");
const fs = require("fs");
const dayjs = require("dayjs");
const mongoose = require("mongoose");
const keyOfDocuments = require("./constants/keyOfDocuments");
const Branch = require("../../../../models/branch.model");

const getLastFourChar = (value = "") => {
  if (!value) return 0;
  const digits = value?.match(/\d+/g)?.join("");
  if (!digits) return 0;
  if (digits.length > 3) return parseInt(digits.substring(digits.length - 4));
  return parseInt(digits) || 0;
};

const processRow = (row, date, branch_id, writeStream) => {
  let newRow = {};
  // ADDING NEW KEY IN NEW ROW OBJECT
  newRow["branch_id"] = { $oid: new mongoose.Types.ObjectId(branch_id) };
  // VALIDATING ROW KEY IS EXIST IN KEYOFDOCUMENTS
  for (const key of keyOfDocuments) {
    if (row?.hasOwnProperty(key)) {
      // CHECKING ROW IS EXISTS OR NOT
      if (!row[key]) {
      } else if (key === "rc_no" || key === "chassis_no") {
        newRow[key] = row[key]?.trim()?.replace(/[^a-zA-Z0-9]/g, "");
        if (key === "rc_no") {
          newRow["last_four_digit_rc"] = getLastFourChar(
            row[key]?.trim()?.replace(/[^a-zA-Z0-9]/g, ""),
            key
          );
        } else {
          newRow["last_four_digit_chassis"] = getLastFourChar(
            row[key]?.trim()?.replace(/[^a-zA-Z0-9]/g, ""),
            key
          );
        }
      } else newRow[key] = row[key];
    }
  }
  // ADDING NEW KEY IN NEW ROW OBJECT
  newRow["is_released"] = false;
  newRow["createdAt"] = { $date: dayjs(date).toISOString() };
  newRow["updatedAt"] = { $date: dayjs(date).toISOString() };
  newRow["__v"] = 0;
  writeStream.write(JSON.stringify(newRow) + "\n");
};

const insertFileDataInDataBase = async (writeablePath, req, res, next) => {
  try {
    // MONGODB IMPORT COMMAND
    const importCommand = `mongoimport --db ${process.env.MONGO_DB_NAME} --collection vehicles --file "${writeablePath}"`;

    // EXECUTING THIS COMMAND
    exec(importCommand, async (error, stdout, stderr) => {
      if (error) {
        return next(responseError(500, "Unsuccessfully inserted"));
      }
      if (stderr) {
        // MATCHING INSERTED DOCUMENTS
        const match = stderr.match(/(\d+) document\(s\) imported successfully/);
        const numDocumentsInserted = match ? parseInt(match[1]) : 0;
        if (numDocumentsInserted > 0) {
          // UPDATING BRANCH DETAILS
          await Branch.findByIdAndUpdate(req.body.branchId, {
            records: numDocumentsInserted,
          });
        }
        return res.status(200).json({
          message: "Data successfully inserted",
          numDocumentsInserted,
        });
      }
      return res.status(200).json({
        message: "Data successfully inserted",
      });
    });
  } catch (err) {
    return res.status(406).json({ message: "File not Acceptable" });
  }
};

const newBulkVehicleRegistration = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(responseError(406, "File not uploaded"));
    }
    const { branchId } = req.body;
    const uploadDate = Date.now();

    if (!checkObjectId(branchId)) {
      return next(responseError(406, "Invalid branch Id"));
    }

    // READABLE FILE PATH
    const readablePath = path.join(process.cwd() + "/" + req.file.path);
    // WRITEABLE FILE PATH
    const writeablePath = path.join(
      process.cwd() +
        "/public/writeableExcelFile/" +
        path.basename(req.file.filename, ".csv") +
        ".json"
    );
    // CREATING READ STREAM USING FILE SYSTEM
    const readStream = fs.createReadStream(readablePath);
    // CREATING WRITE STREAM USING FILE SYSTEM
    const writeStream = fs.createWriteStream(writeablePath);

    const CSVToJSONParser = CSVToJSON();

    // LISTENING EVENTS (data)
    CSVToJSONParser.on("data", (data) => {
      // CALL PROCESS ROW FUNCTION TO ADD AND VALIDATE KEY AND VALUES THEN WRITE IN FILE
      processRow(
        JSON.parse(data.toString("utf-8")),
        uploadDate,
        branchId,
        writeStream
      );
    });

    // LISTENING EVENTS (end)
    CSVToJSONParser.on("done", async () => {
      // CALLING WRITEABLE FILE FUNCTION TO INSERT DATA IN DB
      insertFileDataInDataBase(writeablePath, req, res, next);
    });
    // LISTENING EVENTS (error)
    CSVToJSONParser.on("error", (error) => {
      return next(responseError(500, "Internal server error"));
    });

    // CREATING PIPE SYSTEM
    readStream.pipe(CSVToJSONParser);
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { newBulkVehicleRegistration };
