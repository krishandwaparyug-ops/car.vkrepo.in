import React from "react";
import { BsFiletypeCsv } from "react-icons/bs";
import dayjs from "dayjs";
const Statistic = ({
  data,
  handleFileDownload,
  isDownloading = false,
  setIsDownloading,
}) => {
  return (
    <div
      className={`h-22 border border-[#cfe0f7] bg-gradient-to-br from-[#1f6feb] to-[#1554b2] rounded-xl text-white p-3 shadow-[0_14px_28px_rgba(21,84,178,0.28)] ${
        isDownloading ? "cursor-wait" : "cursor-pointer"
      }`}
      onClick={() => {
        !isDownloading && handleFileDownload(data, setIsDownloading);
      }}
    >
      <div className="h-1/2 flex gap-1 justify-between mb-3">
        <div className="h-full">
          <p className="text-md font-semibold truncate">{data.file_name}</p>
          <p className="text-sm text-blue-100">{data.bankDetails?.bank_name || 'N/A'}</p>
        </div>
        <BsFiletypeCsv className="h-full text-4xl" />
      </div>
      <div className="flex justify-between gap-1">
        <p className="text-xs">{data.uploaded_by}</p>
        <p className="text-xs">
          {dayjs(data?.createdAt).format("DD/MM/YYYY hh:mm A")}
        </p>
      </div>
    </div>
  );
};

export default Statistic;
