/**
 * Create compound indexes on the production MongoDB
 * to fix the timeout on vehicle search endpoints.
 *
 * This does NOT require any code deployment.
 * It adds indexes that cover both the filter and sort fields
 * so MongoDB doesn't need to do expensive in-memory sorts.
 *
 * Usage:
 *   node test-apis/create-indexes.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  console.log("\n🔌  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URL);
  console.log("✅  Connected.\n");

  const db = mongoose.connection.collection("vehicles");

  console.log("📋  Existing indexes:");
  const existing = await db.indexes();
  existing.forEach((idx) => console.log(`    ${idx.name} → ${JSON.stringify(idx.key)}`));

  console.log("\n🔧  Creating compound indexes...\n");

  const indexNames = existing.map((i) => i.name);

  // Compound index: filter by last_four_digit_rc + sort by rc_no
  if (indexNames.includes("idx_last4rc_rcno")) {
    console.log("  1. { last_four_digit_rc: 1, rc_no: 1 }  — already exists, skipping.");
  } else {
    console.log("  1. { last_four_digit_rc: 1, rc_no: 1 }");
    await db.createIndex(
      { last_four_digit_rc: 1, rc_no: 1 },
      { name: "idx_last4rc_rcno", background: true }
    );
    console.log("     ✅ Created.");
  }

  // Compound index: filter by last_four_digit_chassis + sort by chassis_no
  if (indexNames.includes("idx_last4chassis_chassisno")) {
    console.log("  2. { last_four_digit_chassis: 1, chassis_no: 1 }  — already exists, skipping.");
  } else {
    console.log("  2. { last_four_digit_chassis: 1, chassis_no: 1 }");
    await db.createIndex(
      { last_four_digit_chassis: 1, chassis_no: 1 },
      { name: "idx_last4chassis_chassisno", background: true }
    );
    console.log("     ✅ Created.");
  }
  console.log();

  console.log("📋  Updated indexes:");
  const updated = await db.indexes();
  updated.forEach((idx) => console.log(`    ${idx.name} → ${JSON.stringify(idx.key)}`));

  await mongoose.disconnect();
  console.log("\n✅  Done. The production search should now be fast without any code deployment.\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message);
  process.exit(1);
});
