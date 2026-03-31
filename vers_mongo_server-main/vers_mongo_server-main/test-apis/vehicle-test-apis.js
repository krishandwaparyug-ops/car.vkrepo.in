require("dotenv").config();
const axios = require("axios");

const BASE_URL = process.env.TEST_API_BASE_URL || "http://localhost:5002/api/v1/vehicle";
const TOKEN = process.env.TEST_API_TOKEN || "";

const RC_LAST4 = process.env.TEST_RC_LAST4 || "";
const CHASSIS_LAST4 = process.env.TEST_CHASSIS_LAST4 || "";
const ADMIN_BRANCH_ID = process.env.TEST_ADMIN_BRANCH_ID || "";

const MODE = (process.argv[2] || "user").toLowerCase();

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (TOKEN) {
  client.defaults.headers.common.Authorization = `Bearer ${TOKEN}`;
}

const printTitle = (text) => {
  console.log("\n" + "=".repeat(65));
  console.log(text);
  console.log("=".repeat(65));
};

const showUsageAndExit = () => {
  console.log("Usage:");
  console.log("  node test-apis/vehicle-test-apis.js user");
  console.log("  node test-apis/vehicle-test-apis.js admin");
  console.log("  node test-apis/vehicle-test-apis.js both");
  console.log("\nRequired environment:");
  console.log("  TEST_API_TOKEN=<JWT token>");
  console.log("  TEST_RC_LAST4=<last 4 digits of RC>");
  console.log("  TEST_CHASSIS_LAST4=<last 4 digits of chassis>");
  console.log("\nOptional:");
  console.log("  TEST_API_BASE_URL=http://localhost:5002/api/v1/vehicle");
  console.log("  TEST_ADMIN_BRANCH_ID=<branchId for admin search>");
  process.exit(1);
};

const assertEnv = () => {
  if (!TOKEN || !RC_LAST4 || !CHASSIS_LAST4) {
    showUsageAndExit();
  }
};

const postAndLog = async (path, body, label) => {
  printTitle(label);
  console.log("POST", `${BASE_URL}${path}`);
  console.log("Payload:", body);
  const { data } = await client.post(path, body);
  console.log("Response:", JSON.stringify(data, null, 2));
  return data;
};

const runUserFlow = async () => {
  const rcResult = await postAndLog(
    "/user/pagination",
    {
      type: "rc_no",
      query: RC_LAST4,
      pageIndex: 1,
      pageSize: 20,
    },
    "USER SEARCH BY RC LAST 4"
  );

  const chassisResult = await postAndLog(
    "/user/pagination",
    {
      type: "chassis_no",
      query: CHASSIS_LAST4,
      pageIndex: 1,
      pageSize: 20,
    },
    "USER SEARCH BY CHASSIS LAST 4"
  );

  const vehicleId = rcResult?.data?.[0]?._id || chassisResult?.data?.[0]?._id;

  if (!vehicleId) {
    console.log("\nNo vehicle found from search, skipping detail API call.");
    return;
  }

  await postAndLog(
    "/user/details/id",
    {
      _id: vehicleId,
    },
    `USER VEHICLE DETAILS BY ID (${vehicleId})`
  );
};

const runAdminFlow = async () => {
  const adminBasePayload = {
    pageIndex: 1,
    pageSize: 20,
  };

  if (ADMIN_BRANCH_ID) {
    adminBasePayload.branchId = ADMIN_BRANCH_ID;
  }

  await postAndLog(
    "/admin/pagination",
    {
      ...adminBasePayload,
      type: "rc_no",
      searchTerm: RC_LAST4,
    },
    "ADMIN SEARCH BY RC LAST 4"
  );

  await postAndLog(
    "/admin/pagination",
    {
      ...adminBasePayload,
      type: "chassis_no",
      searchTerm: CHASSIS_LAST4,
    },
    "ADMIN SEARCH BY CHASSIS LAST 4"
  );
};

const main = async () => {
  assertEnv();

  if (!["user", "admin", "both"].includes(MODE)) {
    showUsageAndExit();
  }

  try {
    if (MODE === "user" || MODE === "both") {
      await runUserFlow();
    }

    if (MODE === "admin" || MODE === "both") {
      await runAdminFlow();
    }

    printTitle("ALL REQUESTS FINISHED");
  } catch (error) {
    printTitle("REQUEST FAILED");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
    process.exit(1);
  }
};

main();
