# Vehicle Test APIs

This folder contains quick scripts to test vehicle search and details APIs.

## 1) Set environment variables (PowerShell)

```powershell
$env:TEST_API_BASE_URL="http://localhost:5002/api/v1/vehicle"
$env:TEST_API_TOKEN="<PASTE_JWT_TOKEN>"
$env:TEST_RC_LAST4="1234"
$env:TEST_CHASSIS_LAST4="5678"
# Optional for admin filtering
$env:TEST_ADMIN_BRANCH_ID="<branch_object_id>"
```

## 2) Run test scripts

```powershell
npm run test:api:vehicle:user
npm run test:api:vehicle:admin
npm run test:api:vehicle:both
```

## Notes

- This backend searches by last 4 digits (not 5).
- User APIs require a USER token with valid device checks.
- Admin APIs require an ADMIN token.
- Script file: `test-apis/vehicle-test-apis.js`
