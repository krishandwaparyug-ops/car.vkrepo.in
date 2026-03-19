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
const XLSX = require("xlsx");

// Helper to safely delete a file without throwing
const safeUnlink = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Could not delete temp file:", filePath, e.message);
  }
};

const getLastFourChar = (value = "") => {
  if (!value) return "0";
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "0";
  return String(parseInt(digits.slice(-4), 10) || 0);
};

const processRow = (row, dateObj, branchIdObj) => {
  let newRow = {
    branch_id: branchIdObj,
    is_released: false,
    createdAt: dateObj,
    updatedAt: dateObj,
    __v: 0
  };
  for (let i = 0; i < keyOfDocuments.length; i++) {
    const key = keyOfDocuments[i];
    const val = row[key];
    if (val) {
      if (key === "rc_no") {
        const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
        newRow[key] = clean;
        newRow["last_four_digit_rc"] = getLastFourChar(clean);
      } else if (key === "chassis_no") {
        const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
        newRow[key] = clean;
        newRow["last_four_digit_chassis"] = getLastFourChar(clean);
      } else {
        newRow[key] = val;
      }
    }
  }
  return newRow;
};

const newBulkVehicleRegistration = async (req, res, next) => {
  // Resolve file path once — multer already saves relative to cwd
  const filePath = req.file ? path.resolve(req.file.path) : null;

  try {
    if (!req.file || !filePath) {
      return next(responseError(406, "File not uploaded"));
    }

    const { branchId } = req.body;

    if (!branchId || !checkObjectId(branchId)) {
      safeUnlink(filePath);
      return next(responseError(406, "Invalid branch Id"));
    }

    const uploadDateObj = new Date();
    const branchIdObj = new mongoose.Types.ObjectId(branchId);
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let processedData = [];

    // DATA TRANSFORMATION START
    console.log(`[Reg] Transforming file: ${req.file.originalname} (${fileExt})`);

    if (fileExt === ".json") {
      // HANDLE LEGACY JSON FORMAT
      const fileContent = await fs.promises.readFile(filePath, "utf8");
      const parsedContent = JSON.parse(fileContent);

      if (Array.isArray(parsedContent)) {
        processedData = parsedContent.map((row) => processRow(row, uploadDateObj, branchIdObj));
      } else if (parsedContent.headers && parsedContent.data) {
        const headers = parsedContent.headers;
        const indices = keyOfDocuments.map((key) => ({ key, idx: headers.indexOf(key) })).filter((item) => item.idx !== -1);
        processedData = parsedContent.data.map((rowArr) => {
          let newRow = { branch_id: branchIdObj, is_released: false, createdAt: uploadDateObj, updatedAt: uploadDateObj, __v: 0 };
          indices.forEach(({ key, idx }) => {
            const val = rowArr[idx];
            if (val) {
              if (key === "rc_no" || key === "chassis_no") {
                 const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
                 newRow[key] = clean;
                 newRow[key === "rc_no" ? "last_four_digit_rc" : "last_four_digit_chassis"] = getLastFourChar(clean);
              } else newRow[key] = val;
            }
          });
          return newRow;
        });
      }
    } else if (fileExt === ".csv" || fileExt === ".xlsx" || fileExt === ".xlsb") {
      // HANDLE RAW FILE FORMATS (MUCH FASTER!)
      const mappedHeaders = req.body.mappedHeaders ? JSON.parse(req.body.mappedHeaders) : [];
      let rawData = [];
      
      if (fileExt === ".csv") {
        rawData = await CSVToJSON({ noheader: true }).fromFile(filePath);
      } else {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      }

      if (rawData.length > 0) {
        const indices = keyOfDocuments.map((key) => ({ key, idx: mappedHeaders.indexOf(key) })).filter((item) => item.idx !== -1);
        
        // Skip header row if it's there (assuming 1st row is header in Excel)
        const startRow = (fileExt === ".csv") ? 0 : 1; 
        
        for (let r = startRow; r < rawData.length; r++) {
          const row = rawData[r];
          if (!row) continue;
          
          let newRow = { branch_id: branchIdObj, is_released: false, createdAt: uploadDateObj, updatedAt: uploadDateObj, __v: 0 };
          let hasData = false;
          
          indices.forEach(({ key, idx }) => {
            const val = Array.isArray(row) ? row[idx] : row[`field${idx+1}`];
            if (val) {
              hasData = true;
              if (key === "rc_no" || key === "chassis_no") {
                 const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
                 newRow[key] = clean;
                 newRow[key === "rc_no" ? "last_four_digit_rc" : "last_four_digit_chassis"] = getLastFourChar(clean);
              } else newRow[key] = val;
            }
          });
          if (hasData) processedData.push(newRow);
        }
      }
    }

    console.log(`[Reg] Data transformation complete. count: ${processedData.length}`);

    console.log(`[Reg] Data transformation complete. Final count: ${processedData.length}`);

    // Always clean up the uploaded file after reading
    safeUnlink(filePath);

    // Respond immediately to the frontend so the user experience is "fraction of a second"
    res.status(200).json({
      message: "Processing started in background",
      numDocumentsDetected: processedData.length,
    });

    // Run the heavy database work in the background (NON-BLOCKING)
    (async () => {
      try {
        console.log(`[Reg] Background job started for branch: ${branchId} (${processedData.length} records)`);
        
        // 1. Delete existing records for this branch (fast thanks to index)
        await Vehicle.deleteMany({ branch_id: branchIdObj });
        console.log(`[Reg] Old records deleted for branch ${branchId}`);

        // 2. Batch insert new records (Optimized with high concurrency and large batches)
        const BATCH_SIZE = 25000;
        const CHUNK_SIZE = 4;
        const batches = [];

        for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
          batches.push(processedData.slice(i, i + BATCH_SIZE));
        }

        console.log(`[Reg] Inserting ${batches.length} batches of up to ${BATCH_SIZE} rows each...`);

        for (let i = 0; i < batches.length; i += CHUNK_SIZE) {
          const chunk = batches.slice(i, i + CHUNK_SIZE);
          await Promise.all(
            chunk.map((batch) =>
              Vehicle.collection.insertMany(batch, { ordered: false }).catch((err) => {
                // Ignore duplicate keys but log other critical errors
                if (err.name !== "BulkWriteError" && err.code !== 11000) {
                  throw err;
                }
              })
            )
          );
        }

        // 3. Finalize branch stats
        await Branch.findByIdAndUpdate(branchId, {
          records: processedData.length,
        });

        console.log(`[Reg] Background job successfully finished for branch ${branchId}.`);
      } catch (bgError) {
        console.error(`[Reg] FATAL error in background processing for branch ${branchId}:`, bgError.message || bgError);
      }
    })();
    
    return; // Already responded
  } catch (error) {
    if (filePath) safeUnlink(filePath);
    console.error("Bulk Registration Error:", error.message || error);
    return next(responseError(500, "Internal server error: " + (error.message || "")));
  }
};

module.exports = { newBulkVehicleRegistration };
