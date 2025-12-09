import React from "react";
import { CgSpinner } from "react-icons/cg";

const UserTableSearch = (props) => {
  const {
    setSearchQuery,
    onRefresh,
    loading = false,
    setStatus,
    status = "",
    type = "user",
  } = props;

  return (
    <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm">
      <div className="flex gap-2 h-full">
        <input
          className="h-full outline-none ps-2 pe-2 rounded-sm text-md"
          onChange={(e) => setSearchQuery?.(e.target.value)}
          placeholder="Search here..."
        ></input>
        {type === "user" ? (
          <select
            required={true}
            value={status}
            defaultValue={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-full outline-none ps-2 pe-2 rounded-sm text-md w-full"
          >
            <option value="">ALL</option>
            {["ACTIVE", "IN-ACTIVE", "REJECTED"]?.map((value) => {
              return <option style={{fontSize: '17px'}} value={value}>{value}</option>;
            })}
          </select>
        ) : null}
      </div>
      <button
        className="ps-2 pe-2 bg-white h-8 border-0 text-md rounded-sm uppercase font-medium text-gray-700 flex items-center justify-start hover:bg-gray-200"
        onClick={() => onRefresh?.()}
      >
        {loading ? (
          <CgSpinner className={`${loading ? "animate-spin" : ""}`} />
        ) : null}
        Refresh
      </button>
    </div>
  );
};

export default UserTableSearch;
