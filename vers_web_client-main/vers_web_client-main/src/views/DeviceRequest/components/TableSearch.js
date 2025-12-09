import React from "react";
import { CgSpinner } from "react-icons/cg";

const DeviceRequestTableSearch = (props) => {
  const { setSearchQuery, onRefresh, loading = false } = props;

  return (
    <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm">
      <input
        className="h-full outline-none ps-2 pe-2 rounded-sm text-md"
        onChange={(e) => setSearchQuery?.(e.target.value)}
        placeholder="Search here..."
      ></input>
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

export default DeviceRequestTableSearch;
