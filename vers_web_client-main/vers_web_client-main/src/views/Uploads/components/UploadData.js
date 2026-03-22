import React, { useState } from "react";
import BaseService from "../../../services/BaseService";
import appConfig from "../../../configs/app.config";
import { toast } from "react-toastify";
import { headerOptionsOfServer } from "../constants";
import { apiUpdateHeader } from "../../../services/VehicleServices";
import { CgSpinner } from "react-icons/cg";

import Papa from "papaparse";

const notify = (message, type = "error") => toast[type](message);

const updateHeader = async (header) => {
  try {
    await apiUpdateHeader({ header });
    return;
  } catch (error) {
    return;
  }
};

const UploadData = (props) => {
  const {
    setDesc,
    verifiedValidData = [],
    setVerifiedValidData,
    header = [],
    defaultFileHeader = [],
    setFileData,
    fetchHeader,
    selectedBranch,
  } = props;

  const [loading, setLoading] = useState(false);

  let percent = 0;
  const onUploadToServer = async () => {
    if (loading) return;
    
    if (verifiedValidData.length < 1) {
      return notify("Please verify data");
    }
    if (!selectedBranch) {
      return notify("Please select branch");
    }
    setLoading(true);
    setDesc("Updating Header...");
    const newUpdateHeaderToServer = {};
    for (let i = 0; i < header.length; i++) {
      const headerKey = header[i]
        ?.toString()
        ?.replace(/[^a-zA-Z0-9]/g, " ")
        .toLowerCase()
        .trim()
        .split(" ")
        .join("_");
      if (headerOptionsOfServer.includes(headerKey)) {
        const valueKey = defaultFileHeader[i]
          ?.toString()
          ?.replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
          .trim();
        newUpdateHeaderToServer[headerKey] = valueKey;
      }
    }
    await updateHeader(newUpdateHeaderToServer);
    
    setDesc?.("Uploading Data... Starting...");
    try {
      const uploadDateObj = new Date();
      const processLocalRow = (row) => {
        let newRow = { branch_id: selectedBranch, is_released: false, createdAt: uploadDateObj, updatedAt: uploadDateObj };
        header.forEach((h, idx) => {
          const key = headerOptionsOfServer[idx] || h.toString().toLowerCase().replace(/[^a-z0-9]/g, "_");
          const val = row[h] || row[idx];
          if (val) {
            if (key === "rc_no" || key === "chassis_no") {
              const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
              const digits = clean.replace(/\D/g, "");
              newRow[key] = clean;
              newRow[key === "rc_no" ? "last_four_digit_rc" : "last_four_digit_chassis"] = String(parseInt(digits.slice(-4), 10) || 0);
            } else newRow[key] = val;
          }
        });
        return newRow;
      };

      const finalData = verifiedValidData.map(processLocalRow);
      const CHUNK_SIZE = 5000;
      const chunks = [];
      for (let i = 0; i < finalData.length; i += CHUNK_SIZE) chunks.push(finalData.slice(i, i + CHUNK_SIZE));

      // First batch
      setDesc?.("Uploading Data... (0%)");
      const firstRes = await BaseService.post(`v1/vehicle/admin/insert/chunk`, { branchId: selectedBranch, data: chunks[0], isFirstChunk: true });
      if (firstRes.status !== 200) throw new Error("Chunk failed");

      // Parallel batches
      if (chunks.length > 1) {
         let completed = 1;
         const remaining = chunks.slice(1);
         const CONCURRENCY = 8; // Boost speed
         for (let i = 0; i < remaining.length; i += CONCURRENCY) {
            const group = remaining.slice(i, i + CONCURRENCY);
            await Promise.all(group.map(async (chunk) => {
               await BaseService.post(`v1/vehicle/admin/insert/chunk`, { branchId: selectedBranch, data: chunk, isFirstChunk: false });
               completed++;
               setDesc?.(`Uploading Data... (${Math.round((completed/chunks.length)*100)}%)`);
            }));
         }
      }

      setDesc?.("");
      notify("Upload Successfully", "success");
      setFileData?.([]);
      setVerifiedValidData?.([]);
      fetchHeader();
    } catch (error) {
      console.error("[Upload] Error:", error);
      notify("Upload Failed - " + (error.response?.data?.message || "Check Connection"));
      setDesc?.("");
    }
    setLoading(false);
  };

  return (
    <button
      className="text-md pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm flex justify-start items-center hover:bg-gray-200"
      onClick={onUploadToServer}
    >
        {loading ? (
        <CgSpinner
          className={`${loading ? "animate-spin" : ""}`}
        />
      ) : null}
      Upload
    </button>
  );
};

export default UploadData;
