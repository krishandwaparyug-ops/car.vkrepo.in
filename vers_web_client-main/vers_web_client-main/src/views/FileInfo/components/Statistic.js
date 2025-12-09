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
      className={`h-22 bg-blue-500 rounded-md text-white p-2 ${
        isDownloading ? "cursor-wait" : "cursor-pointer"
      }`}
      onClick={() => {
        !isDownloading && handleFileDownload(data._id, setIsDownloading);
      }}
    >
      <div className="h-1/2 flex gap-1 justify-between mb-3">
        <div className="h-full">
          <p className="text-md font-semibold">{data.file_name}</p>
          <p className="text-sm">{data.bankDetails.bank_name}</p>
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
