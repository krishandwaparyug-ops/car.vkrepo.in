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

const HeadOfficeTable = () => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const data =
    useSelector((state) => state.office.data.headOfficeState.headOffice) || [];
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

  return (
    <div className="w-full h-full rounded-sm">
      <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm">
        <input
          className="h-full outline-none ps-2 pe-2 rounded-sm text-md w-[60%]"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          placeholder="Search here..."
        ></input>
        <div className="flex gap-2">
          <button
            className="ps-2 pe-2 bg-white h-8 border-0 text-md rounded-sm uppercase font-medium text-gray-700 flex items-center justify-start hover:bg-gray-200"
            onClick={() =>
              dispatch(setHeadOfficeModal({ type: "new", status: true }))
            }
          >
            Add
          </button>
          <button
            className="ps-2 pe-2 bg-white h-8 border-0 text-md rounded-sm uppercase font-medium text-gray-700 flex items-center justify-start hover:bg-gray-200"
            onClick={() => dispatch(allHeadOffice())}
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
              <th className="border border-gray-400 font-semibold text-md">
                head office name
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                branches
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortDataFunc.length !== 0 ? (
              sortDataFunc.map((headOffice, index) => {
                return (
                  <tr
                    className={`text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md hover:bg-gray-200 ${
                      headOffice?._id === selectedRow
                        ? "!bg-indigo-200"
                        : ""
                    }`}
                    key={index}
                    onClick={() => {
                      dispatch(setSelectedHeadOffice(headOffice));
                      dispatch(setType(headOffice?._id));
                      setSelectedRow(headOffice?._id);
                    }}
                  >
                    <td className="border border-gray-400 ps-2 pe-2">
                      {headOffice?.name || "-"}
                    </td>
                    <td className="text-center border border-gray-400 ps-2 pe-2">
                      {headOffice?.branches || 0}
                    </td>
                    <td className="text-center border border-gray-400 w-18">
                      <div className="flex justify-center items-center h-full">
                        <button
                          className="ps-2 pe-2 bg-orange-500 h-8 me-2 border-0 text-md rounded-sm font-medium text-white"
                          onClick={() => {
                            dispatch(
                              setBranchModal({ type: "new", status: true })
                            );
                          }}
                        >
                          Add
                        </button>
                        <button
                          className="ps-2 pe-2 bg-green-500 h-8 border-0 text-md rounded-sm font-medium text-white"
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="2" className="text-center w-full text-md">
                  Head Office Not Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default memo(HeadOfficeTable);
