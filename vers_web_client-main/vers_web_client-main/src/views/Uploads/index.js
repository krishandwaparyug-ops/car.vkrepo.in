import React, { useEffect, useMemo, useState } from "react";
import FileReader from "./components/FileReader";
import { useVirtualizer } from "@tanstack/react-virtual";
import ExcelHeader from "./components/ExcelHeader";
import ExcelRow from "./components/ExcelRow";
import VerifyButton from "./components/VerifyButton";
import CountButton from "./components/CountButton";
import UploadData from "./components/UploadData";
import BranchSelect from "./components/BranchSelect";
import { apiGetHeader } from "../../services/VehicleServices";
import { injectReducer } from "../../store";
import OfficeReducer from "../Offices/store";
import { CgSpinner } from "react-icons/cg";
import { headerOptions as staticHeaderOptions } from "./constants";
injectReducer("office", OfficeReducer);

const formatDuration = (milliseconds = 0) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs
      .toString()
      .padStart(2, "0")}s`;
  }

  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const normalizeHeaderMatchToken = (value = "") => {
  return value?.toString()?.toLowerCase()?.replace(/[^a-z0-9]/g, "");
};

const resolveHeaderOptionKey = (value, options = []) => {
  const normalizedValue = normalizeHeaderMatchToken(value);

  if (!normalizedValue || !Array.isArray(options)) {
    return "";
  }

  for (let i = 0; i < options.length; i++) {
    const option = options[i] || {};
    const key = Object.keys(option)?.[0];
    const aliases = Array.isArray(Object.values(option)?.[0])
      ? Object.values(option)?.[0]
      : [];

    const candidates = [key, ...aliases]
      .map((candidate) => normalizeHeaderMatchToken(candidate))
      .filter(Boolean);

    if (candidates.includes(normalizedValue)) {
      return key || "";
    }
  }

  return "";
};

const Uploads = () => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defaultFileHeader, setDefaultFileHeader] = useState([]);
  const [verifiedValidData, setVerifiedValidData] = useState([]);
  const [sourceTotalRows, setSourceTotalRows] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [headerOptions, setHeaderOptions] = useState([]);
  const [desc, setDesc] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isVerifyClicked, setIsVerifyClicked] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    phase: "idle",
    percent: 0,
    uploadedRows: 0,
    totalRows: 0,
    startedAt: null,
    finishedAt: null,
    message: "",
  });
  const [clockTick, setClockTick] = useState(Date.now());

  const parentRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    count: fileData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 25,
  });

  useEffect(() => {
    if (!["preparing", "uploading"].includes(uploadProgress.phase)) {
      return;
    }

    const intervalId = setInterval(() => {
      setClockTick(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [uploadProgress.phase]);

  const elapsedMs = uploadProgress.startedAt
    ? (uploadProgress.finishedAt || clockTick) - uploadProgress.startedAt
    : 0;

  const headerMatchSummary = useMemo(() => {
    const headerRow = Array.isArray(fileData?.[0]) ? fileData[0] : [];

    if (!Array.isArray(defaultFileHeader) || defaultFileHeader.length < 1) {
      return {
        totalColumns: 0,
        matchedColumns: 0,
        unmatchedColumns: [],
        duplicateMappedKeys: [],
        readyToUpload: false,
      };
    }

    const resolvedColumns = defaultFileHeader.map((sourceHeader, index) => {
      const selectedHeader = headerRow?.[index];
      const mappedKey =
        resolveHeaderOptionKey(selectedHeader, headerOptions) ||
        resolveHeaderOptionKey(sourceHeader, headerOptions);

      return {
        index,
        sourceHeader:
          sourceHeader?.toString()?.trim() || `Column ${index + 1}`,
        mappedKey,
      };
    });

    const unmatchedColumns = resolvedColumns.filter((column) => !column.mappedKey);

    const duplicateMappedKeys = Array.from(
      resolvedColumns.reduce((acc, column) => {
        if (!column.mappedKey) return acc;
        acc.set(column.mappedKey, (acc.get(column.mappedKey) || 0) + 1);
        return acc;
      }, new Map())
    )
      .filter(([, count]) => count > 1)
      .map(([key]) => key);

    return {
      totalColumns: resolvedColumns.length,
      matchedColumns: resolvedColumns.length - unmatchedColumns.length,
      unmatchedColumns,
      duplicateMappedKeys,
      readyToUpload:
        unmatchedColumns.length === 0 && duplicateMappedKeys.length === 0,
    };
  }, [defaultFileHeader, fileData, headerOptions]);

  const invalidRowsCount = Math.max(
    0,
    Math.max(
      sourceTotalRows,
      Array.isArray(fileData) && fileData.length > 0 ? fileData.length - 1 : 0
    ) - Math.max(0, Array.isArray(verifiedValidData) ? verifiedValidData.length : 0)
  );
  const validRowsCount = Math.max(
    0,
    Math.min(
      Array.isArray(verifiedValidData) ? verifiedValidData.length : 0,
      Math.max(
        sourceTotalRows,
        Array.isArray(fileData) && fileData.length > 0 ? fileData.length - 1 : 0
      )
    )
  );
  const totalRowsCount = Math.max(
    sourceTotalRows,
    Array.isArray(fileData) && fileData.length > 0 ? fileData.length - 1 : 0
  );

  const onDataChange = (props) => {
    const { rowIndex, colIndex, updatedValue } = props;
    const copyData = [...fileData];
    copyData[rowIndex][colIndex] = updatedValue;
    setFileData(copyData);
  };

  const onDeleteData = async (props) => {
    const { type, colIndex, rowIndex } = props;
    switch (type) {
      case "column":
        const copyDataColumn = [...fileData];
        const copyDefaultHeader = [...defaultFileHeader];
        setFileData([]);
        setDefaultFileHeader([]);
        await new Promise((resolve) => setTimeout(resolve, 10));
        setFileData(
          copyDataColumn?.map((innerArray) => {
            return innerArray?.filter((_, index) => index !== colIndex);
          })
        );
        setDefaultFileHeader(
          copyDefaultHeader.filter((_, index) => index !== colIndex)
        );
        break;
      case "row":
        const copyDataRow = [...fileData];
        setFileData([]);
        await new Promise((resolve) => setTimeout(resolve, 10));
        setFileData(copyDataRow.filter((_, index) => index !== rowIndex));
        break;
      default:
        break;
    }
  };

  const fetchHeader = async () => {
    try {
      const response = await apiGetHeader();
      if (response?.status === 200 && response?.data?.data?.[0]) {
        const serverHeaderConfig = response.data.data[0];

        const toAliases = (value) => {
          if (Array.isArray(value)) return value.filter(Boolean);
          if (value === undefined || value === null || value === "") return [];
          return [value.toString()];
        };

        const serverOptions = Object.keys(serverHeaderConfig).reduce(
          (acc, element) => {
            if (["__v", "updatedAt", "createdAt", "_id"].includes(element)) {
              return acc;
            }

            acc.push({
              [element.toString()?.split("_").join(" ")]:
                toAliases(serverHeaderConfig[element]),
            });
            return acc;
          },
          []
        );

        // Merge by key and union aliases so static fallback aliases stay available.
        const staticMap = new Map(
          staticHeaderOptions.map((option) => {
            const key = Object.keys(option)[0];
            const aliases = Array.isArray(Object.values(option)[0])
              ? Object.values(option)[0]
              : [];
            return [key, aliases];
          })
        );

        const mergedServerOptions = serverOptions.map((option) => {
          const key = Object.keys(option)[0];
          const serverAliases = Array.isArray(Object.values(option)[0])
            ? Object.values(option)[0]
            : [];
          const staticAliases = staticMap.get(key) || [];
          staticMap.delete(key);

          return {
            [key]: Array.from(new Set([...serverAliases, ...staticAliases])),
          };
        });

        const remainingStaticOptions = Array.from(staticMap.entries()).map(
          ([key, aliases]) => ({ [key]: aliases })
        );

        setHeaderOptions([...mergedServerOptions, ...remainingStaticOptions]);
      } else {
        // Fallback to static options if server call fails
        setHeaderOptions(staticHeaderOptions);
      }
    } catch (error) {
      setHeaderOptions(staticHeaderOptions);
    }
  };

  useEffect(() => {
    fetchHeader();
  }, []);

  return (
    <>
      <div className="panel-header upload-sheet-toolbar upload-toolbar-controls p-2 min-h-12 rounded-xl flex flex-wrap gap-2 text-[#1c3a63] border border-[#d9e5f6] mb-2">
        <FileReader
          setLoading={setLoading}
          setDefaultFileHeader={setDefaultFileHeader}
          setFileData={setFileData}
          setVerifiedValidData={setVerifiedValidData}
          setSourceTotalRows={setSourceTotalRows}
          setRawFile={setRawFile}
          setIsVerifyClicked={setIsVerifyClicked}
        />
        {/* <CountButton label="Opening" data={`${count}`} /> */}
        <CountButton
          data={`Total: ${totalRowsCount}`}
        />
        <CountButton data={`Valid: ${validRowsCount}`} />
        <CountButton data={`Invalid: ${invalidRowsCount}`} />
        <VerifyButton
          data={fileData}
          verifiedValidData={verifiedValidData}
          sourceTotalRows={sourceTotalRows}
          setFileData={setFileData}
          setVerifiedValidData={setVerifiedValidData}
          setIsVerifyBtnClick={setIsVerifyClicked}
        />
        <BranchSelect setSelectedBranch={setSelectedBranch} />
        <UploadData
          fetchHeader={fetchHeader}
          defaultFileHeader={defaultFileHeader}
          selectedBranch={selectedBranch}
          setFileData={setFileData}
          verifiedValidData={verifiedValidData}
          setVerifiedValidData={setVerifiedValidData}
          header={fileData[0]}
          setDesc={setDesc}
          rawFile={rawFile}
          setUploadProgress={setUploadProgress}
        />
        <p className="text-sm font-medium" style={{ padding: 0, margin: 0 }}>
          {desc}
        </p>

        {uploadProgress.startedAt ? (
          <div className="ml-auto min-w-[300px] max-w-[420px] rounded-xl border border-[#d7e4f8] bg-gradient-to-br from-[#f8fbff] to-[#ffffff] p-3 shadow-[0_10px_20px_rgba(17,34,64,0.08)]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-wide text-[#496992] font-semibold">
                Upload Progress
              </p>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  uploadProgress.phase === "success"
                    ? "bg-[#dcfce8] text-[#187a3f]"
                    : uploadProgress.phase === "failed"
                    ? "bg-[#ffe7e7] text-[#b31b1b]"
                    : "bg-[#e6efff] text-[#1f5cbc]"
                }`}
              >
                {uploadProgress.phase}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-[#e7eefb] overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  uploadProgress.phase === "failed"
                    ? "bg-[#ef4444]"
                    : "bg-gradient-to-r from-[#2f80ff] via-[#1f6feb] to-[#1760d1]"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, uploadProgress.percent || 0))}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#355a86] mb-1">
              <p>{Math.min(100, Math.max(0, uploadProgress.percent || 0))}% complete</p>
              <p>Elapsed: {formatDuration(elapsedMs)}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#355a86] mb-1">
              <p>
                Rows: {uploadProgress.uploadedRows || 0}/{uploadProgress.totalRows || 0}
              </p>
              {uploadProgress.finishedAt ? (
                <button
                  className="text-[#1f6feb] font-semibold hover:underline"
                  onClick={() =>
                    setUploadProgress({
                      phase: "idle",
                      percent: 0,
                      uploadedRows: 0,
                      totalRows: 0,
                      startedAt: null,
                      finishedAt: null,
                      message: "",
                    })
                  }
                >
                  Clear
                </button>
              ) : null}
            </div>

            <p className="text-xs text-[#4a6b95] truncate">
              {uploadProgress.message || "Waiting for upload"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="upload-sheet-workspace">
        <div
          className="panel upload-sheet-panel"
          ref={parentRef}
          style={{
            overflow: "auto",
          }}
        >
          {!loading ? (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              <table className="border-collapse upload-sheet-table">
                <tbody>
                  {rowVirtualizer?.getVirtualItems()?.map((virtualItem) => {
                    return (
                      <tr
                        key={virtualItem.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          padding: 0,
                          width: "100%",
                          height: `${virtualItem.size - 2}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                          zIndex: virtualItem?.index === 0 ? 1 : 0,
                        }}
                      >
                        {fileData?.[virtualItem?.index]?.map((value, index) => {
                          return virtualItem.index === 0 ? (
                            <td
                              className="upload-sheet-cell upload-sheet-cell-header"
                              style={{ maxWidth: "200px", minWidth: "200px" }}
                              key={index}
                            >
                              <ExcelHeader
                                headerOptions={headerOptions}
                                onDeleteData={onDeleteData}
                                defaultFileHeader={defaultFileHeader}
                                verifiedValidData={verifiedValidData}
                                isVerifyClicked={isVerifyClicked}
                                header={fileData[0]?.map((value) =>
                                  value?.toString()?.toLowerCase()
                                )}
                                onDataChange={onDataChange}
                                value={value}
                                rowIndex={virtualItem.index}
                                colIndex={index}
                              />
                            </td>
                          ) : (
                            <td
                              className="text-sm upload-sheet-cell"
                              style={{ maxWidth: "200px", minWidth: "200px" }}
                              key={index}
                            >
                              <ExcelRow
                                onDeleteData={onDeleteData}
                                onDataChange={onDataChange}
                                value={value}
                                rowIndex={virtualItem.index}
                                colIndex={index}
                                type="text"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full w-full justify-center items-center flex flex-col text-[#1f3d66]">
              <CgSpinner
                className={`h-10 w-10 text-[#1f6feb] ${loading ? "animate-spin" : ""
                  }`}
              />
              <p>Reading file... Please wait...</p>
            </div>
          )}
        </div>

        <aside className="upload-match-panel">
          <div className="upload-match-head">
            <h4 className="upload-match-title">Column Match Panel</h4>
            <p className="upload-match-subtitle">
              Red headers listed here must be mapped before upload.
            </p>
          </div>

          {headerMatchSummary.totalColumns > 0 ? (
            <>
              <div className="upload-match-stats">
                <span className="upload-match-pill upload-match-pill-info">
                  {headerMatchSummary.matchedColumns}/{headerMatchSummary.totalColumns} matched
                </span>
                <span
                  className={`upload-match-pill ${
                    headerMatchSummary.readyToUpload
                      ? "upload-match-pill-ok"
                      : "upload-match-pill-warn"
                  }`}
                >
                  {headerMatchSummary.readyToUpload
                    ? "Ready to Upload"
                    : "Action Required"}
                </span>
              </div>

              {headerMatchSummary.unmatchedColumns.length > 0 ? (
                <ul className="upload-match-list">
                  {headerMatchSummary.unmatchedColumns.map((column) => (
                    <li
                      key={column.index}
                      className="upload-match-item upload-match-item-unmatched"
                    >
                      <span className="upload-match-index">{column.index + 1}</span>
                      <span className="upload-match-name">{column.sourceHeader}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="upload-match-success">
                  All columns are matched. You can verify and upload now.
                </p>
              )}

              {headerMatchSummary.duplicateMappedKeys.length > 0 ? (
                <div className="upload-duplicate-box">
                  <p className="upload-duplicate-title">Duplicate mapped fields</p>
                  <ul className="upload-duplicate-list">
                    {headerMatchSummary.duplicateMappedKeys.map((key) => (
                      <li key={key}>{key.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <p className="upload-match-empty">Upload a file to see red unmatched headers here.</p>
          )}
        </aside>
      </div>
    </>
  );
};

export default Uploads;
