import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allFileInfo } from "./store/dataSlice";
import { injectReducer } from "../../store";
import fileInfoReducer from "./store";
import Statistic from "./components/Statistic";
import BaseService from "../../services/BaseService";
import appConfig from "../../configs/app.config";
import { toast } from "react-toastify";
const notify = (message, type = "error") => toast[type](message);
injectReducer("fileInfo", fileInfoReducer);

const handleFileDownload = async (_id, setIsDownloading) => {
  notify("Downloading start", "info");
  setIsDownloading?.(true);
  
  try {
    const response = await BaseService({
      url: `${appConfig.webhookPrefix}file/download/${_id}`,
      method: "GET",
      responseType: "blob",
    });

    if (response) {
      console.log(`[FileDownload] Successfully fetched blob for ${_id}`);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${_id}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsDownloading?.(false);
      notify("Download successful", "success");
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error("[FileDownload] Download error:", error.message || error);
    setIsDownloading?.(false);
    notify(`Download failed: ${error.message || ""}`);
  }
};

const FileInfo = () => {
  const dispatch = useDispatch();
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInfo = useSelector((state) => state.fileInfo.data.fileInfo);

  useEffect(() => {
    if (fileInfo.length === 0) {
      dispatch(allFileInfo());
    }
  }, []);
  return (
    <div className="grid grid-cols-5 gap-2">
      {fileInfo.map((file) => {
        return (
          <Statistic
            data={file}
            handleFileDownload={handleFileDownload}
            setIsDownloading={setIsDownloading}
            isDownloading={isDownloading}
          />
        );
      })}
    </div>
  );
};

export default FileInfo;
