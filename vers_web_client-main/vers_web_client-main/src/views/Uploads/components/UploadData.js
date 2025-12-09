import React, { useState } from "react";
import axios from "axios";
import appConfig from "../../../configs/app.config";
import { toast } from "react-toastify";
import { headerOptionsOfServer } from "../constants";
import { apiUpdateHeader } from "../../../services/VehicleServices";
import { CgSpinner } from "react-icons/cg";

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

  const [loading, setLoading] = useState(false)

  let percent = 0;
  const onUploadToServer = async () => {
    if (verifiedValidData.length < 1) {
      return notify("Please verify data");
    }
    if (!selectedBranch) {
      return notify("Please select branch");
    }
    setLoading(true)
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
    setDesc?.("Processing...");
    try {
      const workerCode = `
      importScripts("https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js");
      self.addEventListener('message', (e) => {
        try {
        const worksheet = XLSX.utils.aoa_to_sheet(e.data);
        const csvFile = XLSX.utils.sheet_to_csv(worksheet);
        postMessage(csvFile);
        }catch(e){
          console.log(e)
          postMessage(String(e.message || e).bold() )
        }
      }, false);
    `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      if (!blob) {
        return console.log("something");
      }
      const workerURL = URL.createObjectURL(blob);

      const worker = new Worker(workerURL);
      worker.postMessage([
        header.map((value) =>
          value
            ?.toString()
            ?.toLowerCase()
            ?.replace(/[^a-zA-Z0-9\s]/g, "")
            ?.replace(/\s+/g, " ")
            ?.trim()
            ?.split(" ")
            ?.join("_")
        ),
        ...verifiedValidData,
      ]);
      worker.onmessage = async (event) => {
        const csvFile = await event.data;
        setDesc?.("Processing completed...");
        const formData = new FormData();
        const csvBlob = new Blob([csvFile], { type: "text/csv" });
        formData.append("csv_file", csvBlob, "data.csv");
        formData.append("branchId", selectedBranch);
        const config = {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            percent = Math.floor((loaded * 100) / total);
            if (percent < 100) {
              setDesc(`${percent}% uploaded`);
            } else if (percent === 100) {
              setDesc(`Inserting data`);
            } else {
              setDesc("");
            }
          },
        };
        axios
          .post(
            `${appConfig.apiPrefix}v1/vehicle/admin/insert`,
            formData,
            config
          )
          .then((res) => {
            setDesc?.("");
            if (res.status === 200) {
              notify("Upload Successful", "success");
              setFileData?.([]);
              setVerifiedValidData?.([]);
            } else {
              notify("Failed");
            }
            fetchHeader();
            setLoading(false)
          });
      };
      worker.onerror = async (e) => {
        notify("Failed");
        setDesc?.("");
        setLoading(false)
      };
    } catch (error) {
      setLoading(false)
      console.log(error);
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
