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

const handleFileDownload = (file, token, setIsDownloading) => {
  const { _id, file_name } = file;
  
  if (!token) {
    notify("Authentication error. Please sign in again.");
    return;
  }

  notify(`Starting download`, "info");
  setIsDownloading?.(true);


  // Directly trigger browser-native download to avoid blob corruption
  const downloadUrl = `${appConfig.apiPrefix}v1/file/info/download/${_id}?token=${token}`;
  
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", file_name);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    setIsDownloading?.(false);
  }, 500);
};


const FileInfo = () => {
  const dispatch = useDispatch();
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInfo = useSelector((state) => state.fileInfo.data.fileInfo);
  const token = useSelector((state) => state.auth.session.token);

  useEffect(() => {
    if (fileInfo.length === 0) {
      dispatch(allFileInfo());
    }
  }, []);
  
  return (
    <div className="page-grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {fileInfo.map((file) => {
        return (
          <Statistic
            key={file._id}
            data={file}
            handleFileDownload={(data, setIsDownloading) => handleFileDownload(data, token, setIsDownloading)}
            setIsDownloading={setIsDownloading}
            isDownloading={isDownloading}
          />
        );
      })}
    </div>
  );
};

export default FileInfo;
