const responseError = require("../../../../errors/responseError");
const checkObjectId = require("../../utils/checkObjectId");
const path = require("path");
const CSVToJSON = require("csvtojson");
const fs = require("fs");
const dayjs = require("dayjs");
const mongoose = require("mongoose");
const keyOfDocuments = require("./constants/keyOfDocuments");
const Branch = require("../../../../models/branch.model");
const Vehicle = require("../../../../models/vehicle.model");

const getLastFourChar = (value = "") => {
  if (!value) return 0;
  const strValue = String(value);
  const digits = strValue.match(/\d+/g)?.join("");
  if (!digits) return 0;
  if (digits.length > 3) return parseInt(digits.substring(digits.length - 4));
  return parseInt(digits) || 0;
};

const processRow = (row, date, branch_id) => {
  let newRow = {};
  newRow["branch_id"] = branch_id;
  for (const key of keyOfDocuments) {
    if (row?.hasOwnProperty(key)) {
      if (!row[key]) {
      } else if (key === "rc_no" || key === "chassis_no") {
        newRow[key] = row[key]?.toString()?.trim()?.replace(/[^a-zA-Z0-9]/g, "");
        if (key === "rc_no") {
          newRow["last_four_digit_rc"] = getLastFourChar(
            row[key]?.toString()?.trim()?.replace(/[^a-zA-Z0-9]/g, "")
          );
        } else {
          newRow["last_four_digit_chassis"] = getLastFourChar(
            row[key]?.toString()?.trim()?.replace(/[^a-zA-Z0-9]/g, "")
          );
        }
      } else newRow[key] = row[key];
    }
  }
  newRow["is_released"] = false;
  newRow["createdAt"] = dayjs(date).toDate();
  newRow["updatedAt"] = dayjs(date).toDate();
  newRow["__v"] = 0;
  return newRow;
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

    const readablePath = path.join(process.cwd(), req.file.path);

    // Using .fromFile() which returns a promise in csvtojson v2
    const jsonArray = await CSVToJSON().fromFile(readablePath);

    if (!jsonArray || jsonArray.length === 0) {
      return res.status(200).json({
        message: "Data successfully inserted",
        numDocumentsInserted: 0,
      });
    }

    const processedData = jsonArray.map((row) => processRow(row, uploadDate, branchId));

    // Mongoose insertMany is much more reliable than mongoimport in this environment
    // and correctly handles the data types
    await Vehicle.insertMany(processedData);

    // Updating branch details
    await Branch.findByIdAndUpdate(branchId, {
      records: processedData.length,
    });

    // Clean up uploaded file
    if (fs.existsSync(readablePath)) {
      fs.unlinkSync(readablePath);
    }

    return res.status(200).json({
      message: "Data successfully inserted",
      numDocumentsInserted: processedData.length,
    });
  } catch (error) {
    console.error("Bulk Registration Error:", error);
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { newBulkVehicleRegistration };
