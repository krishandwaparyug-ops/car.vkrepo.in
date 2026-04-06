import React, { useState } from "react";
import BaseService from "../../../services/BaseService";
import { toast } from "react-toastify";
import { headerOptions, headerOptionsOfServer } from "../constants";
import { apiUpdateHeader } from "../../../services/VehicleServices";
import { CgSpinner } from "react-icons/cg";

const notify = (message, type = "error") => toast[type](message);

const CHUNK_SIZE = 5000;
const CHUNK_CONCURRENCY = 8;

const sanitizeHeaderKey = (value = "") => {
  return value
    ?.toString()
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]/g, "_")
    ?.replace(/_+/g, "_")
    ?.replace(/^_+|_+$/g, "");
};

const normalizeTextKey = (value = "") => {
  return value?.toString()?.trim()?.toLowerCase()?.replace(/[^a-z0-9]/g, "");
};

const tokenizeText = (value = "") => {
  return value
    ?.toString()
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]+/g, " ")
    ?.trim()
    ?.split(/\s+/)
    ?.filter(Boolean);
};

const buildBranchResolver = (branches = []) => {
  const exactMap = new Map();
  const entries = [];

  branches.forEach((item) => {
    const id = item?._id?.toString();
    if (!id) return;

    const name = item?.name || "";
    const normalizedName = normalizeTextKey(name);
    const tokens = tokenizeText(name);

    exactMap.set(normalizeTextKey(id), id);
    if (normalizedName && !exactMap.has(normalizedName)) {
      exactMap.set(normalizedName, id);
    }

    entries.push({ id, normalizedName, tokens });
  });

  const resolve = (rawValue) => {
    const normalizedRaw = normalizeTextKey(rawValue);
    if (!normalizedRaw) return null;

    const exact = exactMap.get(normalizedRaw);
    if (exact) return exact;

    const containsMatches = entries.filter(
      (entry) =>
        (entry.normalizedName && entry.normalizedName.includes(normalizedRaw)) ||
        (entry.normalizedName && normalizedRaw.includes(entry.normalizedName))
    );

    if (containsMatches.length === 1) {
      return containsMatches[0].id;
    }

    const rawTokens = tokenizeText(rawValue);
    if (rawTokens.length > 0) {
      const scored = entries
        .map((entry) => {
          const overlap = rawTokens.filter((token) =>
            entry.tokens.includes(token)
          ).length;
          return { id: entry.id, overlap };
        })
        .filter((entry) => entry.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap);

      if (
        scored.length > 0 &&
        (scored.length === 1 || scored[0].overlap > scored[1].overlap)
      ) {
        return scored[0].id;
      }
    }

    return null;
  };

  return { resolve };
};

const buildHeaderAliasMap = () => {
  const aliasMap = new Map();

  headerOptions.forEach((option) => {
    const displayKey = Object.keys(option)?.[0];
    const aliases = Object.values(option)?.[0] || [];
    const serverKey = sanitizeHeaderKey(displayKey);

    if (!serverKey || !headerOptionsOfServer.includes(serverKey)) {
      return;
    }

    const normalizedDisplay = normalizeTextKey(displayKey);
    const normalizedServer = normalizeTextKey(serverKey);

    if (normalizedDisplay) aliasMap.set(normalizedDisplay, serverKey);
    if (normalizedServer) aliasMap.set(normalizedServer, serverKey);

    aliases.forEach((alias) => {
      const normalizedAlias = normalizeTextKey(alias);
      if (normalizedAlias) aliasMap.set(normalizedAlias, serverKey);
    });
  });

  headerOptionsOfServer.forEach((serverKey) => {
    const normalizedServer = normalizeTextKey(serverKey);
    if (normalizedServer) aliasMap.set(normalizedServer, serverKey);
  });

  return aliasMap;
};

const headerAliasMap = buildHeaderAliasMap();

const resolveServerHeaderKey = (columnName, fallbackColumnName) => {
  const candidates = [columnName, fallbackColumnName];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    const normalizedCandidate = normalizeTextKey(candidate);
    if (!normalizedCandidate) continue;

    const mappedKey = headerAliasMap.get(normalizedCandidate);
    if (mappedKey) return mappedKey;

    const sanitized = sanitizeHeaderKey(candidate);
    if (headerOptionsOfServer.includes(sanitized)) return sanitized;
  }

  return null;
};

const chunkArray = (input = [], size = CHUNK_SIZE) => {
  const chunks = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
};

const getRowValue = (row, headerValue, index) => {
  if (row && Object.prototype.hasOwnProperty.call(row, headerValue)) {
    return row[headerValue];
  }
  return row?.[index];
};

const postChunk = (branchId, data, isFirstChunk) => {
  return BaseService.post(`v1/vehicle/admin/insert/chunk`, {
    branchId,
    data,
    isFirstChunk,
  });
};

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

  const onUploadToServer = async () => {
    if (loading) return;

    if (verifiedValidData.length < 1) {
      return notify("Please verify data");
    }

    setLoading(true);
    setDesc("Updating Header...");
    const newUpdateHeaderToServer = {};
    const safeHeader = Array.isArray(header) ? header : [];

    if (safeHeader.length < 1) {
      notify("Header not found in file");
      setLoading(false);
      return;
    }

    const resolvedColumnKeys = safeHeader.map((columnName, index) =>
      resolveServerHeaderKey(columnName, defaultFileHeader?.[index])
    );

    for (let i = 0; i < safeHeader.length; i++) {
      const headerKey = resolvedColumnKeys[i];
      if (headerKey) {
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

      const processLocalRow = (row, branchId) => {
        let newRow = {
          branch_id: branchId,
          is_released: false,
          createdAt: uploadDateObj,
          updatedAt: uploadDateObj,
        };

        safeHeader.forEach((h, idx) => {
          const key = resolvedColumnKeys[idx];
          if (!key) return;

          const val = getRowValue(row, h, idx);
          if (val !== undefined && val !== null && val !== "") {
            if (key === "rc_no" || key === "chassis_no") {
              const clean = String(val).trim().replace(/[^a-zA-Z0-9]/g, "");
              const digits = clean.replace(/\D/g, "");
              newRow[key] = clean;
              newRow[key === "rc_no" ? "last_four_digit_rc" : "last_four_digit_chassis"] = String(parseInt(digits.slice(-4), 10) || 0);
            } else if (key === "is_released") {
              const v = String(val).trim().toLowerCase();
              newRow[key] = (v === "true" || v === "yes" || v === "1" || v === "y");
            } else {
              newRow[key] = val;
            }
          }
        });
        return newRow;
      };

      let groupsToUpload = [];
      let unresolvedBranches = new Set();

      if (selectedBranch) {
        const branchRows = verifiedValidData.map((row) =>
          processLocalRow(row, selectedBranch)
        );
        groupsToUpload = [{ branchId: selectedBranch, rows: branchRows }];
      } else {
        const branchColumnIndex = resolvedColumnKeys.findIndex(
          (columnKey) => columnKey === "branch"
        );

        if (branchColumnIndex < 0) {
          notify("Please select branch or map BRANCH column");
          setDesc?.("");
          return;
        }

        setDesc?.("Resolving Branch...");
        const branchRes = await BaseService.post("/v1/branch/all", {});
        const branches = branchRes?.data?.data || [];
        const { resolve: resolveBranchId } = buildBranchResolver(branches);

        const groupedMap = new Map();
        verifiedValidData.forEach((row) => {
          const rawBranchValue = getRowValue(
            row,
            safeHeader[branchColumnIndex],
            branchColumnIndex
          );
          const resolvedBranchId = resolveBranchId(rawBranchValue);

          if (!resolvedBranchId) {
            unresolvedBranches.add(
              String(rawBranchValue || "").trim() || "(blank)"
            );
            return;
          }

          const processed = processLocalRow(row, resolvedBranchId);
          if (!groupedMap.has(resolvedBranchId)) {
            groupedMap.set(resolvedBranchId, []);
          }
          groupedMap.get(resolvedBranchId).push(processed);
        });

        if (groupedMap.size === 0 && branches.length === 1) {
          const onlyBranchId = branches?.[0]?._id?.toString();
          if (onlyBranchId) {
            groupedMap.set(
              onlyBranchId,
              verifiedValidData.map((row) => processLocalRow(row, onlyBranchId))
            );
            unresolvedBranches = new Set();
          }
        }

        groupedMap.forEach((rows, branchId) => {
          groupsToUpload.push({ branchId, rows });
        });
      }

      groupsToUpload = groupsToUpload.filter((group) => group.rows.length > 0);

      if (groupsToUpload.length < 1) {
        notify("No verified rows mapped to a valid branch");
        setDesc?.("");
        return;
      }

      const chunkPlan = groupsToUpload.map((group) => {
        return {
          branchId: group.branchId,
          chunks: chunkArray(group.rows),
        };
      });

      const totalChunks = chunkPlan.reduce(
        (sum, group) => sum + group.chunks.length,
        0
      );
      let completedChunks = 0;
      let uploadedRowsCount = 0;

      const updateProgress = () => {
        completedChunks += 1;
        const progress = Math.round((completedChunks / totalChunks) * 100);
        setDesc?.(`Uploading Data... (${progress}%)`);
      };

      setDesc?.("Uploading Data... (0%)");

      for (const group of chunkPlan) {
        const [firstChunk, ...restChunks] = group.chunks;

        const firstRes = await postChunk(group.branchId, firstChunk, true);
        if (firstRes.status !== 200) throw new Error("Chunk failed");
        uploadedRowsCount += firstChunk.length;
        updateProgress();

        if (restChunks.length > 0) {
          for (let i = 0; i < restChunks.length; i += CHUNK_CONCURRENCY) {
            const parallelChunks = restChunks.slice(i, i + CHUNK_CONCURRENCY);
            await Promise.all(
              parallelChunks.map((chunk) =>
                postChunk(group.branchId, chunk, false)
              )
            );
            uploadedRowsCount += parallelChunks.reduce(
              (sum, chunk) => sum + chunk.length,
              0
            );
            completedChunks += parallelChunks.length;
            const progress = Math.round((completedChunks / totalChunks) * 100);
            setDesc?.(`Uploading Data... (${progress}%)`);
          }
        }
      }

      setDesc?.("");

      if (unresolvedBranches.size > 0) {
        const unresolvedPreview = Array.from(unresolvedBranches)
          .slice(0, 5)
          .join(", ");
        const remaining =
          unresolvedBranches.size > 5
            ? ` and ${unresolvedBranches.size - 5} more`
            : "";
        const skipped = verifiedValidData.length - uploadedRowsCount;
        notify(
          `Uploaded ${uploadedRowsCount} rows. Skipped ${skipped} rows due to unknown branch (${unresolvedPreview}${remaining}).`,
          "warning"
        );
      } else {
        notify("Upload Successfully", "success");
      }

      setFileData?.([]);
      setVerifiedValidData?.([]);
      fetchHeader();
    } catch (error) {
      console.error("[Upload] Error:", error);
      notify("Upload Failed - " + (error.response?.data?.message || "Check Connection"));
      setDesc?.("");
    } finally {
      setLoading(false);
    }
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
