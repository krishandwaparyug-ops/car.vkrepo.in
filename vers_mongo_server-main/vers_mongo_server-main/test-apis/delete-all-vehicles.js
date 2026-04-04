/**
 * Delete all vehicle records from the database
 * and reset Branch.records counts to 0.
 *
 * Branches and Head Offices are NOT touched.
 *
 * Usage:
 *   node test-apis/delete-all-vehicles.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

const BATCH_SIZE = 20000;

async function main() {
  console.log("\n Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_DB, {
    serverSelectionTimeoutMS: 45000,
    socketTimeoutMS: 1200000,
    connectTimeoutMS: 45000,
  });
  console.log("Connected.\n");

  const vehicles = mongoose.connection.collection("vehicles");
  const branches = mongoose.connection.collection("branches");

  // Count before
  const vehicleCount = await vehicles.countDocuments();
  const branchCount = await branches.countDocuments();
  console.log(`Vehicles found : ${vehicleCount}`);
  console.log(`Branches found : ${branchCount}\n`);

  if (vehicleCount === 0) {
    console.log("No vehicles to delete. Exiting.");
    await mongoose.disconnect();
    return;
  }

  // Delete in batches to avoid timeout on large collections
  console.log(`Deleting all vehicles in batches of ${BATCH_SIZE}...`);
  let totalDeleted = 0;
  while (true) {
    // Get a batch of _ids and delete them
    const batch = await vehicles.find({}, { projection: { _id: 1 } }).limit(BATCH_SIZE).toArray();
    if (batch.length === 0) break;
    const ids = batch.map((d) => d._id);
    const res = await vehicles.deleteMany({ _id: { $in: ids } });
    totalDeleted += res.deletedCount;
    console.log(`  Deleted ${totalDeleted} so far...`);
  }
  console.log(`Done deleting. Total removed: ${totalDeleted}\n`);

  // Reset all branch records counts to 0
  console.log("Resetting Branch.records to 0 for all branches...");
  const updateResult = await branches.updateMany({}, { $set: { records: 0 } });
  console.log(`Updated ${updateResult.modifiedCount} branch(es).\n`);

  // Verify
  const remaining = await vehicles.countDocuments();
  console.log(`Vehicles remaining : ${remaining}`);
  console.log(`Branches intact    : ${await branches.countDocuments()}\n`);

  console.log("Done. Branches and Head Offices are untouched.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Error:", err);
  process.exit(1);
});
