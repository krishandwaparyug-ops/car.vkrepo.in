import { memo, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setBranchModal,
  setHeadOfficeModal,
  setSelectedHeadOffice,
  setType,
} from "../../../store/stateSlice";
import { allHeadOffice } from "../../../store/dataSlice";
import sortData from "./../../../../../utils/sortFunction";
import { CgSpinner } from "react-icons/cg";
import dayjs from "dayjs";

const HeadOfficeTable = () => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailHeadOffice, setDetailHeadOffice] = useState(null);
  const data =
    useSelector((state) => state.office.data.headOfficeState.headOffice) || [];
  const allBranches =
    useSelector((state) => state.office.data.branchState.branch) || [];
  const loading = useSelector(
    (state) => state.office.data.headOfficeState.loading
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredHeadOffice = useMemo(() => {
    return data.filter((headOffice) =>
      headOffice.name.toLowerCase()?.includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  const sortDataFunc = useMemo(() => {
    return sortData(filteredHeadOffice, "name");
  }, [filteredHeadOffice]);

  const relatedBranches = useMemo(() => {
    if (!detailHeadOffice?._id) return [];
    return sortData(
      allBranches.filter(
        (branch) => branch.head_office_id?.toString() === detailHeadOffice._id
      ),
      "name"
    );
  }, [allBranches, detailHeadOffice]);

  const totalRecords = useMemo(() => {
    return relatedBranches.reduce(
      (sum, branch) => sum + Number(branch?.records || 0),
      0
    );
  }, [relatedBranches]);

  return (
    <>
      <div className="w-full h-full rounded-md border border-[#dbe5f4] bg-white shadow-[0_12px_28px_rgba(17,34,64,0.08)]">
        <div className="h-12 bg-gradient-to-r from-[#eef4ff] to-[#ffffff] flex justify-between items-center px-2 rounded-t-md border-b border-[#dbe5f4]">
          <input
            className="h-9 ps-3 pe-3 rounded-md text-sm w-[58%] border border-[#c9d8ef]"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            placeholder="Search here..."
          ></input>
          <div className="flex gap-2">
            <button
              className="px-3 bg-[#f7fbff] h-9 border border-[#c9d8ef] rounded-md uppercase text-xs font-semibold text-[#27466f] flex items-center justify-start hover:bg-[#e9f2ff]"
              onClick={() =>
                dispatch(setHeadOfficeModal({ type: "new", status: true }))
              }
            >
              Add
            </button>
            <button
              className="px-3 bg-[#1f6feb] h-9 border-0 rounded-md uppercase text-xs font-semibold text-white flex items-center justify-start hover:bg-[#1658bc]"
              onClick={() => dispatch(allHeadOffice())}
            >
              {loading ? (
                <CgSpinner className={`${loading ? "animate-spin" : ""} mr-1`} />
              ) : null}
              Refresh
            </button>
          </div>
        </div>
        <div className="w-full h-[calc(100%-48px)] overflow-x-auto overflow-y-auto">
          <table className="w-full uppercase border-collapse">
            <thead className="h-10 relative">
              <tr className="h-full sticky top-0 bg-[#edf3ff] cursor-default select-none text-center text-md">
                <th className="border border-[#d2dff2] font-semibold text-sm">
                  head office name
                </th>
                <th className="border border-[#d2dff2] font-semibold text-sm">
                  branches
                </th>
                <th className="border border-[#d2dff2] font-semibold text-sm">
                  action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortDataFunc.length !== 0 ? (
                sortDataFunc.map((headOffice, index) => {
                  return (
                    <tr
                      className={`text-left cursor-default select-none [&:nth-child(even)]:bg-[#f8fbff] h-11 text-sm hover:bg-[#edf4ff] ${
                        headOffice?._id === selectedRow
                          ? "!bg-indigo-100"
                          : ""
                      }`}
                      key={index}
                      onClick={() => {
                        dispatch(setSelectedHeadOffice(headOffice));
                        dispatch(setType(headOffice?._id));
                        setSelectedRow(headOffice?._id);
                      }}
                    >
                      <td className="border border-[#d2dff2] ps-2 pe-2">
                        {headOffice?.name || "-"}
                      </td>
                      <td className="text-center border border-[#d2dff2] ps-2 pe-2">
                        {headOffice?.branches || 0}
                      </td>
                      <td className="text-center border border-[#d2dff2] w-[320px]">
                        <div className="flex justify-center items-center h-full gap-2 py-1">
                          <button
                            className="px-3 bg-[#f59e0b] h-8 border-0 text-xs rounded-md font-semibold text-white hover:bg-[#c67b03]"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(
                                setBranchModal({ type: "new", status: true })
                              );
                            }}
                          >
                            Add
                          </button>
                          <button
                            className="px-3 bg-[#169c46] h-8 border-0 text-xs rounded-md font-semibold text-white hover:bg-[#117937]"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(setSelectedHeadOffice(headOffice));
                              dispatch(
                                setHeadOfficeModal({ type: "edit", status: true })
                              );
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 bg-[#eef3fa] h-8 border border-[#c9d8ef] text-xs rounded-md font-semibold text-[#29486f] hover:bg-[#dfeaf8]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailHeadOffice(headOffice);
                            }}
                          >
                            View All
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center w-full text-md py-6 text-[#45638d]">
                    Head Office Not Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailHeadOffice ? (
        <div className="fixed inset-0 z-[70] bg-[#0b152633] backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-[#dbe5f4] bg-white shadow-[0_24px_48px_rgba(17,34,64,0.22)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#dbe5f4] bg-gradient-to-r from-[#eef4ff] to-[#ffffff]">
              <div>
                <p className="text-[18px] font-semibold text-[#1d3f72]">
                  {detailHeadOffice?.name}
                </p>
                <p className="text-xs text-[#4b6990]">
                  Complete branch and record overview for this head office
                </p>
              </div>
              <button
                className="h-9 px-4 rounded-lg border border-[#d6e2f4] bg-white text-[#24456f] font-semibold hover:bg-[#f2f7ff]"
                onClick={() => setDetailHeadOffice(null)}
              >
                Close
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#fbfdff] border-b border-[#ebf1fb]">
              <div className="rounded-xl border border-[#d9e5f6] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-[#5a7aa3]">Total Branches</p>
                <p className="text-2xl font-bold text-[#183c69]">{relatedBranches.length}</p>
              </div>
              <div className="rounded-xl border border-[#d9e5f6] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-[#5a7aa3]">Total Records</p>
                <p className="text-2xl font-bold text-[#183c69]">{totalRecords}</p>
              </div>
              <div className="rounded-xl border border-[#d9e5f6] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-[#5a7aa3]">Created At</p>
                <p className="text-sm font-semibold text-[#22466f]">
                  {detailHeadOffice?.createdAt
                    ? dayjs(detailHeadOffice.createdAt).format("DD/MM/YYYY hh:mm A")
                    : "-"}
                </p>
              </div>
              <div className="rounded-xl border border-[#d9e5f6] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-[#5a7aa3]">Updated At</p>
                <p className="text-sm font-semibold text-[#22466f]">
                  {detailHeadOffice?.updatedAt
                    ? dayjs(detailHeadOffice.updatedAt).format("DD/MM/YYYY hh:mm A")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="max-h-[56vh] overflow-auto p-5">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#eef4ff] text-[#21446d]">
                    <th className="border border-[#d2dff2] text-left p-2">Branch</th>
                    <th className="border border-[#d2dff2] text-center p-2">Records</th>
                    <th className="border border-[#d2dff2] text-center p-2">Created</th>
                    <th className="border border-[#d2dff2] text-center p-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedBranches.length ? (
                    relatedBranches.map((branch) => (
                      <tr key={branch._id} className="odd:bg-white even:bg-[#f8fbff] hover:bg-[#edf4ff]">
                        <td className="border border-[#d2dff2] p-2 font-semibold text-[#22466f]">
                          {branch?.name || "-"}
                        </td>
                        <td className="border border-[#d2dff2] p-2 text-center text-[#22466f]">
                          {branch?.records || 0}
                        </td>
                        <td className="border border-[#d2dff2] p-2 text-center text-[#335a86]">
                          {branch?.createdAt
                            ? dayjs(branch.createdAt).format("DD/MM/YYYY hh:mm A")
                            : "-"}
                        </td>
                        <td className="border border-[#d2dff2] p-2 text-center text-[#335a86]">
                          {branch?.updatedAt
                            ? dayjs(branch.updatedAt).format("DD/MM/YYYY hh:mm A")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-[#55749e] border border-[#d2dff2]">
                        No branches are linked with this head office.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default memo(HeadOfficeTable);
