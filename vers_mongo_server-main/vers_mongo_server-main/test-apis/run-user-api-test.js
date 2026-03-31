/**
 * User API Test Script
 * ---------------------------------------------------
 * Connects to MongoDB, finds an active USER account,
 * generates a JWT (same way the real login does),
 * then calls all user vehicle endpoints and prints results.
 *
 * Usage:
 *   node test-apis/run-user-api-test.js [device_id] [last4digits] [type]
 *
 * Arguments:
 *   device_id   - your device id (default: 61607cbf4654b298)
 *   last4digits - last 4 digits of RC or chassis to search (default: empty = no filter)
 *   type        - "rc_no" or "chassis_no" (default: rc_no)
 *
 * Examples:
 *   node test-apis/run-user-api-test.js 61607cbf4654b298
 *   node test-apis/run-user-api-test.js 61607cbf4654b298 1234
 *   node test-apis/run-user-api-test.js 61607cbf4654b298 1234 chassis_no
 */

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");

// ─── CONFIG ────────────────────────────────────────────────────────────────
const DEVICE_ID   = process.argv[2] || "61607cbf4654b298";
const QUERY       = process.argv[3] || "";          // last 4 digits of RC or chassis
const TYPE        = process.argv[4] || "rc_no";     // "rc_no" or "chassis_no"
const BASE_URL    = `http://localhost:${process.env.PORT || 5002}/api/v1`;
const PRIVATE_KEY = process.env.PRIVATEKEY;
const MONGO_URL   = process.env.MONGO_URL;
// ───────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

// Simple HTTP POST helper (no extra deps)
function post(path, token, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        Authorization: `Bearer ${token}`,
      },
    };
    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function printResult(label, result) {
  console.log("\n" + "═".repeat(60));
  console.log(`  ${label}  →  HTTP ${result.status}`);
  console.log("═".repeat(60));
  console.log(JSON.stringify(result.body, null, 2));
}

async function main() {
  console.log("\n🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected.\n");

  // Find any ACTIVE USER
  const user = await User.findOne({ role: "USER", status: "ACTIVE" }).lean();

  if (!user) {
    console.error(
      "❌  No ACTIVE USER found in the database.\n" +
        "     Make sure at least one user with role=USER and status=ACTIVE exists."
    );
    process.exit(1);
  }

  const { branch_id, password, ...tokenData } = user;

  console.log("👤  Using user:");
  console.log(`    _id    : ${user._id}`);
  console.log(`    mobile : ${user.mobile || user.phone || "(not stored)"}`);
  console.log(`    name   : ${user.name || "(not stored)"}`);
  console.log(`    status : ${user.status}`);
  console.log(`    deviceId stored in DB: ${user.deviceId || "(none — will be set on first call)"}`);

  // Generate JWT exactly as login.controller.js does
  const token = jwt.sign(
    { user: { ...tokenData }, authority: [user.role] },
    PRIVATE_KEY
  );
  console.log(`\n🔑  Generated JWT (first 60 chars): ${token.substring(0, 60)}...`);
  console.log(`📱  Using device_id: ${DEVICE_ID}`);

  // ── 1. Search endpoint ──────────────────────────────────────────────────
  const searchBody = {
    device_id: DEVICE_ID,
    query: QUERY,
    type: TYPE,
    pageIndex: 1,
    pageSize: 20,
  };

  console.log("\n🔍  Calling POST /vehicle/user/pagination");
  console.log("    Body:", JSON.stringify(searchBody));
  const searchResult = await post("/vehicle/user/pagination", token, searchBody);
  printResult("POST /vehicle/user/pagination", searchResult);

  // If search returned vehicles, test details endpoint with first vehicle id
  const vehicles =
    searchResult.body?.data?.data ||
    searchResult.body?.data ||
    (Array.isArray(searchResult.body) ? searchResult.body : []);

  if (Array.isArray(vehicles) && vehicles.length > 0) {
    const firstVehicleId = vehicles[0]?._id;
    if (firstVehicleId) {
      console.log(`\n🔍  Calling POST /vehicle/user/details/id  (vehicle _id: ${firstVehicleId})`);
      const detailBody = { device_id: DEVICE_ID, _id: firstVehicleId };
      console.log("    Body:", JSON.stringify(detailBody));
      const detailResult = await post("/vehicle/user/details/id", token, detailBody);
      printResult("POST /vehicle/user/details/id", detailResult);
    }
  } else {
    console.log(
      "\n⚠️   No vehicles returned from search — skipping details call.\n" +
        "     Try providing RC or chassis last-4 digits as arguments."
    );
  }

  await mongoose.disconnect();
  console.log("\n✅  Done.\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message);
  process.exit(1);
});
