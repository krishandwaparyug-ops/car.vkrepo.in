import React, { useState } from "react";
import BaseService from "../../../services/BaseService";
import { toast } from "react-toastify";
import { headerOptions, headerOptionsOfServer } from "../constants";
import { apiUpdateHeader } from "../../../services/VehicleServices";
import { CgSpinner } from "react-icons/cg";

const notify = (message, type = "error") => toast[type](message);

const CHUNK_SIZE = 8000;
const FIRST_CHUNK_CONCURRENCY = 4;
const GLOBAL_CHUNK_CONCURRENCY = 12;

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

const formatColumnLabel = (value = "", index = 0) => {
  const text = value?.toString()?.trim();
  if (text) return text;
  return `Column ${index + 1}`;
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

const runWithConcurrency = async (items = [], limit = 1, worker = async () => {}) => {
  if (!Array.isArray(items) || items.length < 1) {
    return;
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 1, items.length));
  let nextIndex = 0;

  const runners = Array.from({ length: safeLimit }).map(async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
};

const getRowValue = (row, headerValue, index) => {
  if (row && Object.prototype.hasOwnProperty.call(row, headerValue)) {
    return row[headerValue];
  }
  return row?.[index];
};

const postChunk = (branchId, data, options = {}) => {
  const { isFirstChunk = false, isLastChunk = false, totalRows = 0 } = options;

  return BaseService.post(`v1/vehicle/admin/insert/chunk`, {
    branchId,
    data,
    isFirstChunk,
    isLastChunk,
    totalRows,
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
    setUploadProgress,
  } = props;

  const [loading, setLoading] = useState(false);

  const safeHeaderForValidation = Array.isArray(header) ? header : [];
  const resolvedHeaderPreview = safeHeaderForValidation.map((columnName, index) =>
    resolveServerHeaderKey(columnName, defaultFileHeader?.[index])
  );
  const unmatchedHeaderColumns = resolvedHeaderPreview
    .map((mappedKey, index) => {
      if (mappedKey) return null;
      return formatColumnLabel(defaultFileHeader?.[index] || safeHeaderForValidation[index], index);
    })
    .filter(Boolean);

  const mappedKeys = resolvedHeaderPreview.filter(Boolean);
  const duplicateMappedKeys = Array.from(
    mappedKeys.reduce((acc, key) => {
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map())
  )
    .filter(([, count]) => count > 1)
    .map(([key]) => key);

  const isUploadDisabled =
    loading || unmatchedHeaderColumns.length > 0 || duplicateMappedKeys.length > 0;

  const publishProgress = (payload = {}) => {
    if (typeof setUploadProgress === "function") {
      setUploadProgress((prev) => ({ ...prev, ...payload }));
    }
  };

  const onUploadToServer = async () => {
    const uploadStartedAt = Date.now();

    if (loading) return;

    if (verifiedValidData.length < 1) {
      publishProgress({
        phase: "failed",
        percent: 0,
        uploadedRows: 0,
        totalRows: 0,
        startedAt: uploadStartedAt,
        finishedAt: Date.now(),
        message: "Please verify data before upload",
      });
      return notify("Please verify data");
    }

    publishProgress({
      phase: "preparing",
      percent: 0,
      uploadedRows: 0,
      totalRows: verifiedValidData.length,
      startedAt: uploadStartedAt,
      finishedAt: null,
      message: "Preparing upload...",
    });

    setLoading(true);
    setDesc("Updating Header...");
    const newUpdateHeaderToServer = {};
    const safeHeader = Array.isArray(header) ? header : [];

    if (safeHeader.length < 1) {
      notify("Header not found in file");
      publishProgress({
        phase: "failed",
        finishedAt: Date.now(),
        message: "Header not found in file",
      });
      setLoading(false);
      return;
    }

    const resolvedColumnKeys = safeHeader.map((columnName, index) =>
      resolveServerHeaderKey(columnName, defaultFileHeader?.[index])
    );

    const unmatchedColumns = resolvedColumnKeys
      .map((mappedKey, index) => {
        if (mappedKey) return null;
        return formatColumnLabel(defaultFileHeader?.[index] || safeHeader[index], index);
      })
      .filter(Boolean);

    if (unmatchedColumns.length > 0) {
      const unmatchedPreview = unmatchedColumns.slice(0, 6).join(", ");
      const extra = unmatchedColumns.length > 6 ? ` and ${unmatchedColumns.length - 6} more` : "";
      const errorMessage = `Match all columns before upload. Unmatched: ${unmatchedPreview}${extra}`;
      console.error("[Upload] Unmatched columns", unmatchedColumns);
      notify(errorMessage);
      publishProgress({
        phase: "failed",
        finishedAt: Date.now(),
        message: errorMessage,
      });
      setDesc?.("");
      setLoading(false);
      return;
    }

    const duplicateKeys = Array.from(
      resolvedColumnKeys.reduce((acc, key) => {
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map())
    )
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
      .filter(Boolean);

    if (duplicateKeys.length > 0) {
      const duplicateMessage = `Duplicate mapped fields found: ${duplicateKeys.join(", ")}. Remove or remap duplicate columns.`;
      console.error("[Upload] Duplicate mapped fields", duplicateKeys);
      notify(duplicateMessage);
      publishProgress({
        phase: "failed",
        finishedAt: Date.now(),
        message: duplicateMessage,
      });
      setDesc?.("");
      setLoading(false);
      return;
    }

    for (let i = 0; i < safeHeader.length; i++) {
      const headerKey = resolvedColumnKeys[i];
      if (headerKey) {
        const valueKey = normalizeTextKey(defaultFileHeader?.[i] || safeHeader?.[i]);
        if (!valueKey) continue;

        if (!Array.isArray(newUpdateHeaderToServer[headerKey])) {
          newUpdateHeaderToServer[headerKey] = [];
        }

        newUpdateHeaderToServer[headerKey].push(valueKey);
      }
    }

    Object.keys(newUpdateHeaderToServer).forEach((key) => {
      newUpdateHeaderToServer[key] = Array.from(new Set(newUpdateHeaderToServer[key]));
    });

    if (Object.keys(newUpdateHeaderToServer).length > 0) {
      await updateHeader(newUpdateHeaderToServer);
    }

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
          publishProgress({
            phase: "failed",
            finishedAt: Date.now(),
            message: "Branch is not mapped",
          });
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
        publishProgress({
          phase: "failed",
          finishedAt: Date.now(),
          message: "No rows mapped to valid branch",
        });
        return;
      }

      const chunkPlan = groupsToUpload.map((group) => {
        return {
          branchId: group.branchId,
          totalRows: group.rows.length,
          chunks: chunkArray(group.rows),
        };
      });

      const totalChunks = chunkPlan.reduce(
        (sum, group) => sum + group.chunks.length,
        0
      );
      const totalUploadRows = chunkPlan.reduce(
        (sum, group) => sum + group.chunks.reduce((chunkSum, chunk) => chunkSum + chunk.length, 0),
        0
      );
      let completedChunks = 0;
      let uploadedRowsCount = 0;

      const updateProgress = () => {
        const progress = Math.round((completedChunks / totalChunks) * 100);
        setDesc?.(`Uploading Data... (${progress}%)`);
        publishProgress({
          phase: "uploading",
          percent: progress,
          uploadedRows: uploadedRowsCount,
          totalRows: totalUploadRows,
          message: `${uploadedRowsCount}/${totalUploadRows} rows uploaded`,
        });
      };

      const markChunkAsUploaded = (rowsInChunk = 0) => {
        uploadedRowsCount += rowsInChunk;
        completedChunks += 1;
        updateProgress();
      };

      setDesc?.("Uploading Data... (0%)");
      publishProgress({
        phase: "uploading",
        percent: 0,
        uploadedRows: 0,
        totalRows: totalUploadRows,
        message: `0/${totalUploadRows} rows uploaded`,
      });

      const firstChunkJobs = chunkPlan.map((group) => {
        const [firstChunk, ...restChunks] = group.chunks;
        return {
          branchId: group.branchId,
          totalRows: group.totalRows,
          firstChunk,
          restChunks,
        };
      });

      await runWithConcurrency(
        firstChunkJobs,
        FIRST_CHUNK_CONCURRENCY,
        async (job) => {
          const firstRes = await postChunk(job.branchId, job.firstChunk, {
            isFirstChunk: true,
            isLastChunk: job.restChunks.length === 0,
            totalRows: job.totalRows,
          });
          if (firstRes.status !== 200) throw new Error("Chunk failed");
          markChunkAsUploaded(job.firstChunk.length);
        }
      );

      const restChunkJobs = firstChunkJobs.flatMap((job) => {
        return job.restChunks.map((chunk, chunkIndex) => {
          return {
            branchId: job.branchId,
            totalRows: job.totalRows,
            chunk,
            isLastChunk: chunkIndex === job.restChunks.length - 1,
          };
        });
      });

      await runWithConcurrency(
        restChunkJobs,
        GLOBAL_CHUNK_CONCURRENCY,
        async (job) => {
          const chunkRes = await postChunk(job.branchId, job.chunk, {
            isFirstChunk: false,
            isLastChunk: job.isLastChunk,
            totalRows: job.totalRows,
          });
          if (chunkRes.status !== 200) throw new Error("Chunk failed");
          markChunkAsUploaded(job.chunk.length);
        }
      );

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

      publishProgress({
        phase: "success",
        percent: 100,
        uploadedRows: uploadedRowsCount,
        totalRows: totalUploadRows,
        finishedAt: Date.now(),
        message: "Upload completed successfully",
      });

      setFileData?.([]);
      setVerifiedValidData?.([]);
      fetchHeader();
    } catch (error) {
      console.error("[Upload] Error:", error);
      notify("Upload Failed - " + (error.response?.data?.message || "Check Connection"));
      setDesc?.("");
      publishProgress({
        phase: "failed",
        finishedAt: Date.now(),
        message:
          "Upload failed - " +
          (error.response?.data?.message || "Please check connection"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 upload-toolbar-upload">
      <button
      className="text-md pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm flex justify-start items-center hover:bg-gray-200 disabled:opacity-60 upload-cta-btn"
      onClick={onUploadToServer}
      disabled={isUploadDisabled}
      title={
        unmatchedHeaderColumns.length > 0
          ? `Match all columns before upload. Unmatched: ${unmatchedHeaderColumns.slice(0, 5).join(", ")}`
          : duplicateMappedKeys.length > 0
          ? `Duplicate mapped fields: ${duplicateMappedKeys.join(", ")}`
          : "Upload verified data"
      }
    >
        {loading ? (
        <CgSpinner
          className={`${loading ? "animate-spin" : ""}`}
        />
      ) : null}
      Upload
      </button>
      {unmatchedHeaderColumns.length > 0 && !loading ? (
        <p className="text-xs text-[#b42318] font-semibold max-w-[320px] truncate upload-toolbar-action-text" title={unmatchedHeaderColumns.join(", ")}>
          Match all columns to enable upload ({unmatchedHeaderColumns.length} unmatched)
        </p>
      ) : null}
      {duplicateMappedKeys.length > 0 && !loading ? (
        <p className="text-xs text-[#b42318] font-semibold max-w-[320px] truncate upload-toolbar-action-text" title={duplicateMappedKeys.join(", ")}>
          Remove duplicate mapped fields before upload
        </p>
      ) : null}
    </div>
  );
};

export default UploadData;
