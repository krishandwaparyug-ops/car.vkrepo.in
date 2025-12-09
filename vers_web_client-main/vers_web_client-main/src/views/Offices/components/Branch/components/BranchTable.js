import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  setBranchModal,
  setSelectedBranch,
  setType,
} from "../../../store/stateSlice";
import isEmpty from "lodash/isEmpty";
import { allBranch } from "../../../store/dataSlice";
import sortData from "../../../../../utils/sortFunction";
import { useMemo, useState } from "react";
import axios from "axios";
import appConfig from "../../../../../configs/app.config";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
const notify = (message, type = "error") => toast[type](message);

const handleDownloadRecords = (branchId, setDownloading) => {
  notify("Downloading start", "info");
  setDownloading?.(true);
  axios({
    url: `${appConfig.apiPrefix}v1/vehicle/admin/records/download/${branchId}`,
    method: "POST",
    responseType: "blob",
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${branchId}.csv`);
      document.body.appendChild(link);
      link.click();
      notify("Download successful", "success");
      setDownloading?.(false);
    })
    .catch((error) => {
      notify("Download failed");
      setDownloading?.(false);
    });
};

const BranchTable = (props) => {
  const dispatch = useDispatch();
  const [downloading, setDownloading] = useState(false);
  const { data = [], setSearchQuery } = props;

  const loading = useSelector((state) => state.office.data.branchState.loading);

  const sortDataFunc = useMemo(() => {
    return sortData(data, "name");
  }, [data]);

  return (
    <div className="w-full h-full rounded-sm">
      <div className="h-10 bg-blue-600 flex justify-between items-center p-1 rounded-t-sm">
        <input
          className="h-full outline-none ps-2 pe-2 rounded-sm text-md w-[60%]"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search here..."
        ></input>
        <div className="flex gap-2">
          <button
            className="ps-3 pe-3 bg-white h-8 border-0 rounded-sm uppercase font-medium text-gray-700 flex justify-start items-center hover:bg-gray-200"
            onClick={() => dispatch(setType("all"))}
          >
            ALL
          </button>
          <button
            className="ps-3 pe-3 bg-white h-8 border-0 rounded-sm uppercase font-medium text-gray-700 flex justify-start items-center hover:bg-gray-200"
            onClick={() => dispatch(allBranch())}
          >
            {loading ? (
              <CgSpinner className={`${loading ? "animate-spin" : ""}`} />
            ) : null}
            Refresh
          </button>
        </div>
      </div>
      <div className="w-full h-full overflow-scroll">
        <table className="w-full uppercase border-collapse">
          <thead className="h-10 relative">
            <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-center text-md">
              <th className="border font-semibold border-gray-400 text-md">
                branch name
              </th>
              <th className="border font-semibold border-gray-400 text-md text-center">
                Records
              </th>
              <th className="border font-semibold border-gray-400 text-md text-center">
                date & Time
              </th>
              <th className="border font-semibold border-gray-400 text-md text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {!isEmpty(sortDataFunc) ? (
              sortDataFunc.map((branch, index) => {
                return (
                  <tr
                    className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md hover:bg-gray-300"
                    key={index}
                  >
                    <td className="border truncate border-gray-400 ps-2 pe-2">
                      {branch?.name || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2 text-center">
                      {branch?.records || 0}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2 text-center">
                      {dayjs(branch?.updatedAt).format("DD/MM/YYYY hh:mm A") ||
                        "-"}
                    </td>
                    <td className="text-center border border-gray-400 gap-2 w-40">
                      <div className="flex gap-2 justify-center w-full">
                        <button
                          className="ps-2 pe-2 bg-green-500 h-8 border-0 text-md rounded-sm font-medium text-white"
                          onClick={() => {
                            dispatch(setSelectedBranch(branch));
                            dispatch(
                              setBranchModal({ type: "edit", status: true })
                            );
                          }}
                        >
                          Edit
                        </button>
                        <button
                          disabled={downloading}
                          className={`ps-2 pe-2 bg-gray-400 h-8 border-0 text-md rounded-sm font-medium text-black ${
                            downloading ? "cursor-wait" : ""
                          }`}
                          onClick={() => {
                            !downloading &&
                              handleDownloadRecords(
                                branch?._id,
                                setDownloading
                              );
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center w-full text-md">
                  Branch Not Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default BranchTable;
