/**
 * Delete all vehicle records from the database (fast drop)
 * and reset Branch.records counts to 0.
 *
 * Branches and Head Offices are NOT touched.
 *
 * Usage (from any directory):
 *   node "c:\...\test-apis\delete-all-vehicles-fast.js"
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_DB, {
    serverSelectionTimeoutMS: 45000,
    socketTimeoutMS: 300000,
    connectTimeoutMS: 45000,
  });
  console.log("Connected.");

  const db = mongoose.connection.db;
  const branches = mongoose.connection.collection("branches");

  // Quick count (O(1), no full scan)
  const vehicleCount = await mongoose.connection.collection("vehicles").estimatedDocumentCount();
  const branchCount = await branches.estimatedDocumentCount();
  console.log("Vehicles found: " + vehicleCount);
  console.log("Branches found: " + branchCount);

  if (vehicleCount > 0) {
    // Drop the entire collection — instant regardless of size
    // Indexes are defined in the Mongoose model and will be recreated on next server start
    console.log("Dropping vehicles collection...");
    await db.dropCollection("vehicles");
    console.log("Vehicles collection dropped.");
  } else {
    console.log("Vehicles collection already empty.");
  }

  // Reset all branch records counts to 0
  console.log("Resetting Branch.records to 0 for all branches...");
  const updateResult = await branches.updateMany({}, { $set: { records: 0 } });
  console.log("Updated " + updateResult.modifiedCount + " branch(es).");

  // Verify
  const cols = await db.listCollections({ name: "vehicles" }).toArray();
  console.log("Vehicles collection still exists: " + (cols.length > 0));
  console.log("Branches count: " + (await branches.estimatedDocumentCount()));
  console.log("Done. Branches and Head Offices are untouched.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
