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
    <div className="w-full h-full rounded-md border border-[#dbe5f4] bg-white shadow-[0_12px_28px_rgba(17,34,64,0.08)]">
      <div className="h-12 bg-gradient-to-r from-[#eef4ff] to-[#ffffff] flex justify-between items-center px-2 rounded-t-md border-b border-[#dbe5f4]">
        <input
          className="h-9 ps-3 pe-3 rounded-md text-sm w-[58%] border border-[#c9d8ef]"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search here..."
        ></input>
        <div className="flex gap-2">
          <button
            className="px-3 bg-[#f7fbff] h-9 border border-[#c9d8ef] rounded-md uppercase text-xs font-semibold text-[#27466f] flex justify-start items-center hover:bg-[#e9f2ff]"
            onClick={() => dispatch(setType("all"))}
          >
            ALL
          </button>
          <button
            className="px-3 bg-[#1f6feb] h-9 border-0 rounded-md uppercase text-xs font-semibold text-white flex justify-start items-center hover:bg-[#1658bc]"
            onClick={() => dispatch(allBranch())}
          >
            {loading ? (
              <CgSpinner className={`mr-1 ${loading ? "animate-spin" : ""}`} />
            ) : null}
            Refresh
          </button>
        </div>
      </div>
      <div className="w-full h-[calc(100%-48px)] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[860px] uppercase border-collapse">
          <thead className="h-10 relative">
            <tr className="h-full sticky top-0 bg-[#edf3ff] cursor-default select-none text-center text-md">
              <th className="border font-semibold border-[#d2dff2] text-sm">
                branch name
              </th>
              <th className="border font-semibold border-[#d2dff2] text-sm text-center">
                Records
              </th>
              <th className="border font-semibold border-[#d2dff2] text-sm text-center">
                date & Time
              </th>
              <th className="border font-semibold border-[#d2dff2] text-sm text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {!isEmpty(sortDataFunc) ? (
              sortDataFunc.map((branch, index) => {
                return (
                  <tr
                    className="text-left cursor-default select-none [&:nth-child(even)]:bg-[#f8fbff] h-11 text-sm hover:bg-[#edf4ff]"
                    key={index}
                  >
                    <td className="border truncate border-[#d2dff2] ps-2 pe-2">
                      {branch?.name || "-"}
                    </td>
                    <td className="border border-[#d2dff2] ps-2 pe-2 text-center">
                      {branch?.records || 0}
                    </td>
                    <td className="border border-[#d2dff2] ps-2 pe-2 text-center">
                      {dayjs(branch?.updatedAt).format("DD/MM/YYYY hh:mm A") ||
                        "-"}
                    </td>
                    <td className="text-center border border-[#d2dff2] gap-2 w-[280px]">
                      <div className="flex gap-2 justify-center w-full py-1">
                        <button
                          className="px-3 bg-[#169c46] h-8 border-0 text-xs rounded-md font-semibold text-white hover:bg-[#117937]"
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
                          className={`px-3 bg-[#eef3fa] h-8 border border-[#c9d8ef] text-xs rounded-md font-semibold text-[#29486f] hover:bg-[#dfeaf8] ${
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
                <td colSpan="4" className="text-center w-full text-md py-6 text-[#45638d]">
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
