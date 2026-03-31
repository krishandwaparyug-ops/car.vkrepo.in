import React, { useMemo, useState } from "react";
import {
  apiTestAdminVehicleSearch,
  apiTestUserVehicleDetails,
  apiTestUserVehicleSearch,
} from "../../services/TestingService";

const pretty = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

const Testing = () => {
  const [mode, setMode] = useState("user");
  const [type, setType] = useState("rc_no");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [branchId, setBranchId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [deviceId, setDeviceId] = useState("61607cbf4654b298");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchResponse, setSearchResponse] = useState(null);
  const [detailsResponse, setDetailsResponse] = useState(null);
  const [errorText, setErrorText] = useState("");

  const canFetchDetails = useMemo(() => vehicleId.trim().length > 0, [vehicleId]);

  const runSearch = async () => {
    if (!query.trim()) {
      setErrorText("Enter RC/chassis last 4 digits before search.");
      return;
    }

    if (mode === "user" && !deviceId.trim()) {
      setErrorText("Enter device ID before search (required for user mode).");
      return;
    }

    setErrorText("");
    setLoadingSearch(true);
    setSearchResponse(null);

    try {
      if (mode === "user") {
        const response = await apiTestUserVehicleSearch({
          type,
          query: query.trim(),
          pageIndex,
          pageSize,
          device_id: deviceId.trim(),
        });
        setSearchResponse(response?.data || {});

        const firstId = response?.data?.data?.[0]?._id;
        if (firstId) {
          setVehicleId(firstId);
        }
      } else {
        const payload = {
          type,
          searchTerm: query.trim(),
          pageIndex,
          pageSize,
        };

        if (branchId.trim()) {
          payload.branchId = branchId.trim();
        }

        const response = await apiTestAdminVehicleSearch(payload);
        setSearchResponse(response?.data || {});
      }
    } catch (error) {
      setErrorText(error?.response?.data?.message || error?.message || "Search failed");
      setSearchResponse(error?.response?.data || null);
    } finally {
      setLoadingSearch(false);
    }
  };

  const runUserDetails = async () => {
    if (!canFetchDetails) {
      setErrorText("Enter vehicle id first.");
      return;
    }

    if (!deviceId.trim()) {
      setErrorText("Enter device ID before fetching details.");
      return;
    }

    setErrorText("");
    setLoadingDetails(true);
    setDetailsResponse(null);

    try {
      const response = await apiTestUserVehicleDetails({
        _id: vehicleId.trim(),
        device_id: deviceId.trim(),
      });
      setDetailsResponse(response?.data || {});
    } catch (error) {
      setErrorText(
        error?.response?.data?.message || error?.message || "Details request failed"
      );
      setDetailsResponse(error?.response?.data || null);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="px-4 pb-6">
      <div className="rounded-md border border-gray-300 bg-white p-4">
        <h1 className="text-xl font-bold text-gray-800">API Testing</h1>
        <p className="text-sm text-gray-600 mt-1">
          Test vehicle search APIs directly from UI. Current backend expects last 4 digits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Mode</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="rc_no">RC</option>
              <option value="chassis_no">Chassis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Last 4 Digits</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 1234"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Page Index</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-3 py-2"
              value={pageIndex}
              onChange={(e) => setPageIndex(Number(e.target.value) || 1)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Page Size</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-3 py-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) || 20)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Branch Id (Admin optional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="ObjectId"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Device Id (Required for User)</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="device_id"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            onClick={runSearch}
            disabled={loadingSearch}
          >
            {loadingSearch ? "Searching..." : "Run Search API"}
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 disabled:bg-gray-400"
            onClick={runUserDetails}
            disabled={loadingDetails || mode !== "user" || !canFetchDetails}
          >
            {loadingDetails ? "Loading..." : "Run User Details API"}
          </button>
        </div>

        {errorText && (
          <div className="mt-3 rounded border border-red-300 bg-red-50 text-red-700 p-2 text-sm">
            {errorText}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1">Vehicle Id (for user details API)</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="vehicle _id (auto-filled from search or paste manually)"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="rounded-md border border-gray-300 bg-white p-3">
          <h2 className="font-semibold text-gray-800 mb-2">Search API Response</h2>
          <pre className="bg-gray-900 text-green-300 rounded p-3 text-xs overflow-auto max-h-[60vh]">
            {pretty(searchResponse)}
          </pre>
        </div>

        <div className="rounded-md border border-gray-300 bg-white p-3">
          <h2 className="font-semibold text-gray-800 mb-2">User Details API Response</h2>
          <pre className="bg-gray-900 text-green-300 rounded p-3 text-xs overflow-auto max-h-[60vh]">
            {pretty(detailsResponse)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Testing;
