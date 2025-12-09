import React from "react";
import { CgSpinner } from "react-icons/cg";
import { useSelector } from "react-redux";

const TableRefreshButton = ({ fetchDetails }) => {
  const loading = useSelector((state) => state.details.data.loading);
  const payload = useSelector((state) => state.details.state.payload);
  const handleOnRefresh = () => {
    const { user, ...otherPayload } = payload;
    fetchDetails?.({ ...otherPayload, user_id: user?.[0]?.value || "" });
  };
  
  return (
    <button
      className="text-sm pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm flex justify-start items-center hover:bg-gray-200"
      onClick={handleOnRefresh}
    >
      {loading ? (
        <CgSpinner className={`me-1 ${loading ? "animate-spin" : ""}`} />
      ) : null}
      REFRESH
    </button>
  );
};

export default TableRefreshButton;
