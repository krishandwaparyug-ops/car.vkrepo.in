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
      } else if (key === "is_released") {
        const v = String(val).trim().toLowerCase();
        newRow[key] = (v === "true" || v === "yes" || v === "1" || v === "y");
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
    if (!req.file || !filePath) return next(responseError(406, "File not uploaded"));

    const { branchId } = req.body;
    if (!branchId || !checkObjectId(branchId)) {
      safeUnlink(filePath);
      return next(responseError(406, "Invalid branch Id"));
    }

    const uploadDateObj = new Date();
    const branchIdObj = new mongoose.Types.ObjectId(branchId);
    const originalFilename = req.file.originalname;
    const mappedHeaders = req.body.mappedHeaders ? JSON.parse(req.body.mappedHeaders) : [];

    console.log(`[Reg] Job started synchronously for branch ${branchId}: ${originalFilename}`);
    
    const fileExtRaw = path.extname(originalFilename).toLowerCase();
    let fileExt = fileExtRaw;
    let isCompressed = (fileExtRaw === ".gz");
    let fileBuffer;

    if (isCompressed) {
      const compressedBuffer = await fs.promises.readFile(filePath);
      fileBuffer = await gunzip(compressedBuffer);
      fileExt = path.extname(originalFilename.replace(".gz", "")).toLowerCase();
    }

    // 1. CLEANUP PHASE (Chunked)
    console.log(`[Reg] Branch ${branchId}: Cleanup...`);
    let docsToDelete;
    const DELETE_BATCH_SIZE = 20000;
    do {
      docsToDelete = await Vehicle.find({ branch_id: branchIdObj }).limit(DELETE_BATCH_SIZE).select('_id').lean();
      if (docsToDelete.length > 0) {
        await Vehicle.deleteMany({ _id: { $in: docsToDelete.map(d => d._id) } });
      }
    } while (docsToDelete.length > 0);

    // 2. INSERTION PHASE
    let recordsProcessedCount = 0;
    const BATCH_SIZE = 10000;
    const CONCURRENCY = 10;
    let currentBatch = [];
    let insertPromises = [];
    
    const insertBatch = async (batch, retryCount = 0) => {
      if (!batch || batch.length === 0) return;
      try {
        await Vehicle.collection.insertMany(batch, { ordered: false });
      } catch (err) {
         const isNetworkError = err.message.includes('ECONNRESET') || err.message.includes('timeout') || err.message.includes('connection');
         if (isNetworkError && retryCount < 3) {
            await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
            return insertBatch(batch, retryCount + 1);
         }
      }
    };

    if (fileExt === ".csv") {
       await new Promise((resolve, reject) => {
          CSVToJSON({ noheader: true })
            .fromFile(filePath)
            .subscribe(async (row) => {
               const processed = processRow(row, uploadDateObj, branchIdObj);
               currentBatch.push(processed); 
               recordsProcessedCount++;

               if (currentBatch.length >= BATCH_SIZE) {
                  const toInsert = [...currentBatch];
                  currentBatch = [];
                  const promise = insertBatch(toInsert);
                  insertPromises.push(promise);
                  if (insertPromises.length >= CONCURRENCY) {
                     await Promise.all(insertPromises);
                     insertPromises = [];
                  }
               }
            }, reject, resolve);
       });
    } else {
       const workbook = isCompressed ? XLSX.read(fileBuffer, { type: 'buffer' }) : XLSX.readFile(filePath);
       const sheet = workbook.Sheets[workbook.SheetNames[0]];
       const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
       
       for (let r = 1; r < rawData.length; r++) {
          const row = rawData[r];
          if (!row) continue;
          const processed = processRow(row, uploadDateObj, branchIdObj);
          currentBatch.push(processed); recordsProcessedCount++;

          if (currentBatch.length >= BATCH_SIZE) {
             const toInsert = [...currentBatch];
             currentBatch = [];
             const promise = insertBatch(toInsert);
             insertPromises.push(promise);
             if (insertPromises.length >= CONCURRENCY) {
                await Promise.all(insertPromises);
                insertPromises = [];
             }
          }
       }
    }

    // Final chunks
    const promiseFinal = insertBatch(currentBatch);
    insertPromises.push(promiseFinal);
    await Promise.all(insertPromises);

    await Branch.findByIdAndUpdate(branchId, { records: recordsProcessedCount });
    console.log(`[Reg] ✨ SUCCESS for ${branchId}: ${originalFilename}. Count: ${recordsProcessedCount}`);
    
    safeUnlink(filePath);
    return res.status(200).json({ success: true, message: "Upload Successfully", count: recordsProcessedCount });

  } catch (error) {
    if (filePath) safeUnlink(filePath);
    console.error("Bulk Registration Error:", error.message || error);
    return next(responseError(500, "Processing failed: " + (error.message || "")));
  }
};

const registerVehicleChunk = async (req, res, next) => {
  try {
    const { branchId, data, isFirstChunk, isLastChunk, totalRows } = req.body;
    if (!branchId || !checkObjectId(branchId)) return next(responseError(400, "Invalid branch Id"));
    if (!Array.isArray(data)) return next(responseError(400, "Invalid data chunk"));

    const branchIdObj = new mongoose.Types.ObjectId(branchId);
    const hasFinalChunkSignal = typeof isLastChunk === "boolean";
    const parsedTotalRows = Number(totalRows);
    const normalizedTotalRows = Number.isFinite(parsedTotalRows) && parsedTotalRows >= 0
      ? Math.trunc(parsedTotalRows)
      : null;
    
    // [OPTIMIZATION] FIRST CHUNK: Clear the branch data instantly
    if (isFirstChunk) {
       console.log(`[Reg-Fast] Clearing branch ${branchId} for new upload...`);
       await Vehicle.deleteMany({ branch_id: branchIdObj });
       if (hasFinalChunkSignal) {
         await Branch.findByIdAndUpdate(branchId, { records: 0 });
       }
    }

    // [OPTIMIZATION] Direct Collection Insertion (bypassing Mongoose complexity)
    if (data.length > 0) {
       // Ensure branch_id is stored as ObjectId, not string (native driver skips Mongoose casting)
       const docsToInsert = data.map(doc => ({
         ...doc,
         branch_id: doc.branch_id ? new mongoose.Types.ObjectId(doc.branch_id) : branchIdObj,
       }));
       await Vehicle.collection.insertMany(docsToInsert, { ordered: false });
       // Legacy clients do not send isLastChunk, so keep incremental count for them.
       if (!hasFinalChunkSignal) {
         await Branch.findByIdAndUpdate(branchId, { $inc: { records: data.length } });
       }
    }

    if (hasFinalChunkSignal && isLastChunk) {
      if (normalizedTotalRows !== null) {
        await Branch.findByIdAndUpdate(branchId, { records: normalizedTotalRows });
      } else {
        const branchCount = await Vehicle.countDocuments({ branch_id: branchIdObj });
        await Branch.findByIdAndUpdate(branchId, { records: branchCount });
      }
    }

    return res.status(200).json({ success: true, count: data.length });
  } catch (error) {
    console.error("Fast Chunk Insertion Error:", error.message);
    return next(responseError(500, "Fast chunk failed: " + error.message));
  }
};

module.exports = { newBulkVehicleRegistration, registerVehicleChunk };
