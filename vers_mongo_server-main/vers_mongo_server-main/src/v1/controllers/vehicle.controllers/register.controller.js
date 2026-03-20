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
const zlib = require("zlib");
const { promisify } = require("util");
const gunzip = promisify(zlib.gunzip);

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
    const originalFilename = req.file.originalname;
    const mappedHeaders = req.body.mappedHeaders ? JSON.parse(req.body.mappedHeaders) : [];

    // RETURN INSTANTLY to provide a 100% user-friendly experience
    res.status(200).json({
      message: "File received successfully. Processing 80k+ rows in the background...",
      filename: originalFilename,
    });

    // Deep background processing
    (async () => {
      let processedData = [];
      try {
        console.log(`[Reg] Deep background job started for branch ${branchId}: ${originalFilename}`);

        const fileExtRaw = path.extname(originalFilename).toLowerCase();
        let fileExt = fileExtRaw;
        let isCompressed = (fileExtRaw === ".gz");
        let fileBuffer;

        if (isCompressed) {
          const compressedBuffer = await fs.promises.readFile(filePath);
          fileBuffer = await gunzip(compressedBuffer);
          fileExt = path.extname(originalFilename.replace(".gz", "")).toLowerCase();
        }

        if (fileExt === ".json") {
          const fileContent = isCompressed ? fileBuffer.toString("utf8") : await fs.promises.readFile(filePath, "utf8");
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
          let rawData = [];
          if (fileExt === ".csv") {
            const csvContent = isCompressed ? fileBuffer.toString("utf8") : await fs.promises.readFile(filePath, "utf8");
            rawData = await CSVToJSON({ noheader: true }).fromString(csvContent);
          } else {
            const workbook = isCompressed ? XLSX.read(fileBuffer, { type: 'buffer' }) : XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          }

          if (rawData.length > 0) {
            const indices = keyOfDocuments.map((key) => ({ key, idx: mappedHeaders.indexOf(key) })).filter((item) => item.idx !== -1);
            const startRow = (fileExt === ".csv") ? 0 : 1; 
            
            // Ultra-optimized transformation loop
            const totalRows = rawData.length;
            const numIndices = indices.length;

            processedData = new Array(); // Pre-allocate if possible, or just build efficiently
            
            for (let r = startRow; r < totalRows; r++) {
              const row = rawData[r];
              if (!row) continue;
              
              const newRow = { 
                branch_id: branchIdObj, 
                is_released: false, 
                createdAt: uploadDateObj, 
                updatedAt: uploadDateObj, 
                __v: 0 
              };
              
              let hasData = false;
              for (let i = 0; i < numIndices; i++) {
                const { key, idx } = indices[i];
                const val = Array.isArray(row) ? row[idx] : row[`field${idx+1}`];
                
                if (val !== undefined && val !== null && val !== "") {
                  hasData = true;
                  if (key === "rc_no" || key === "chassis_no") {
                    const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
                    newRow[key] = clean;
                    newRow[key === "rc_no" ? "last_four_digit_rc" : "last_four_digit_chassis"] = getLastFourChar(clean);
                  } else {
                    newRow[key] = val;
                  }
                }
              }
              if (hasData) processedData.push(newRow);
            }
          }
        }


        if (processedData.length > 0) {
          console.log(`[Reg] Transformation finished. ${processedData.length} records. Cleaning old data...`);
          
          // Delete in batches or use a more efficient way if needed, but deleteMany is usually fine
          await Vehicle.deleteMany({ branch_id: branchIdObj });
          
          const BATCH_SIZE = 4000; // Slightly smaller batches for better stability
          const CONCURRENCY = 4; // Process 4 batches in parallel for 'lightning speed'
          const MAX_RETRIES = 3;

          const totalBatches = Math.ceil(processedData.length / BATCH_SIZE);
          const batches = [];
          for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
            batches.push(processedData.slice(i, i + BATCH_SIZE));
          }

          console.log(`[Reg] Starting parallel insertion of ${totalBatches} batches (Concurrency: ${CONCURRENCY})...`);

          const executeBatchWithRetry = async (batch, batchNum, retryCount = 0) => {
            try {
              await Vehicle.collection.insertMany(batch, { ordered: false });
            } catch (err) {
              const isNetworkError = err.message.includes('ECONNRESET') || err.message.includes('timeout') || err.message.includes('connection');
              
              if (isNetworkError && retryCount < MAX_RETRIES) {
                console.warn(`[Reg] Batch ${batchNum} failed (${err.message}). Retrying ${retryCount + 1}/${MAX_RETRIES}...`);
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return executeBatchWithRetry(batch, batchNum, retryCount + 1);
              }

              // Ignore bulk write errors (duplicates), but log others
              if (err.name !== "BulkWriteError" && err.code !== 11000) {
                console.error(`[Reg] Batch ${batchNum} fatal error:`, err.message);
              }
            }
          };

          // Simple parallel batch processor with concurrency limit
          for (let i = 0; i < batches.length; i += CONCURRENCY) {
            const currentGroup = batches.slice(i, i + CONCURRENCY);
            await Promise.all(currentGroup.map((batch, idx) => {
                const batchNum = i + idx + 1;
                return executeBatchWithRetry(batch, batchNum);
            }));
            
            console.log(`[Reg] Branch ${branchId}: Progress ${Math.min(i + CONCURRENCY, totalBatches)}/${totalBatches} batches...`);
          }

          await Branch.findByIdAndUpdate(branchId, { records: processedData.length });
        }
        console.log(`[Reg] ✨ Background SUCCESS for branch ${branchId}: ${originalFilename}`);

      } catch (bgError) {
        console.error(`[Reg] Background FAILURE for branch ${branchId}:`, bgError.message || bgError);
      } finally {
        safeUnlink(filePath);
      }
    })();
    return;
  } catch (error) {
    if (filePath) safeUnlink(filePath);
    console.error("Bulk Registration Initial Error:", error.message || error);
    return next(responseError(500, "Initial processing error: " + (error.message || "")));
  }
};

module.exports = { newBulkVehicleRegistration };
