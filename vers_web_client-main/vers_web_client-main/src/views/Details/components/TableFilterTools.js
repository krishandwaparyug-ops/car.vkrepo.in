import React from "react";
import TableRefreshButton from "./TableRefreshButton";
import EmployeeSelect from "./EmployeeSelect";
import { useSelector, useDispatch } from "react-redux";
import { initialPayload, setPayload } from "../store/stateSlice";

const TableFilterTools = (props) => {
  const { fetchDetails, users = [] } = props;
  const dispatch = useDispatch();
  const payload = useSelector((state) => state.details.state.payload);

  const handleOnSearch = () => {
    const { user, ...otherPayload } = payload;
    fetchDetails?.({ ...otherPayload, user_id: user?.[0]?.value || "" });
  };

  const handleOnClear = () => {
    dispatch(setPayload(initialPayload));
    fetchDetails(initialPayload);
  };

  return (
    <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm">
      <div className="flex gap-2 h-full">
        <div className="h-full">
          <input
            type="text"
            placeholder="Search by RC"
            value={payload?.rc_no}
            onChange={(e) => {
              dispatch(setPayload({ ...payload, rc_no: e.target.value }));
            }}
            className="outline-none p-1 ps-3 pe-3 text-md rounded-sm"
          ></input>
        </div>
        <div className="h-full">
          <input
            value={payload?.date}
            onChange={(e) => {
              dispatch(setPayload({ ...payload, date: e.target.value }));
            }}
            type="date"
            className="outline-none h-full ps-3 pe-3 text-md rounded-sm select-none"
          ></input>
        </div>
        <div className="w-[300px] h-full">
          <EmployeeSelect users={users} />
        </div>
        <button
          className="text-md border rounded-sm pe-2 ps-2 bg-white hover:bg-gray-200"
          onClick={handleOnSearch}
        >
          Search
        </button>
        <button
          className="text-md border rounded-sm pe-2 ps-2 bg-white hover:bg-gray-200"
          onClick={handleOnClear}
        >
          Clear All
        </button>
      </div>
      <TableRefreshButton fetchDetails={fetchDetails} />
    </div>
  );
};

export default TableFilterTools;
