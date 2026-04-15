import React, { useEffect, useState } from "react";
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
const WIDTH_SIZE = 10;
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

const Uploads = () => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defaultFileHeader, setDefaultFileHeader] = useState([]);
  const [verifiedValidData, setVerifiedValidData] = useState([]);
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

        const serverOptions = Object.keys(serverHeaderConfig)
          .map((element) => {
            if (!["__v", "updatedAt", "createdAt", "_id"].includes(element))
              return {
                [element.toString()?.split("_").join(" ")]:
                  toAliases(serverHeaderConfig[element]),
              };
          })
          .filter(Boolean);

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
      <div className="panel-header p-2 min-h-12 rounded-xl flex flex-wrap gap-2 text-[#1c3a63] border border-[#d9e5f6] mb-2">
        <FileReader
          setLoading={setLoading}
          setDefaultFileHeader={setDefaultFileHeader}
          setFileData={setFileData}
          setVerifiedValidData={setVerifiedValidData}
          setRawFile={setRawFile}
          setIsVerifyClicked={setIsVerifyClicked}
        />
        {/* <CountButton label="Opening" data={`${count}`} /> */}
        <CountButton
          data={`Total: ${fileData.length > 0
              ? verifiedValidData.length + fileData.length - 1
              : 0
            }`}
        />
        <CountButton data={`Valid: ${verifiedValidData.length}`} />
        <CountButton
          data={`Invalid: ${fileData.length > 0 ? fileData.length - 1 : 0}`}
        />
        <VerifyButton
          data={fileData}
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

      <div
        className="panel"
        ref={parentRef}
        style={{
          height: `calc(100vh - 110px)`,
          overflow: "auto",
          width: `calc(100vw - ${WIDTH_SIZE}px)`,
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
            <table style={{ width: "100%" }} className="border-collapse">
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
                            className=" border border-green-400"
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
                            className="text-sm border border-gray-400"
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
    </>
  );
};

export default Uploads;
