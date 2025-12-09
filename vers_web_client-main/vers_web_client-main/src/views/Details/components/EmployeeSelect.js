import React from "react";
import Select from "react-dropdown-select";
import sortData from "./../../../utils/sortFunction";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPayload } from "../store/stateSlice";

const EmployeeSelect = ({ users = [] }) => {
  const dispatch = useDispatch();
  const payload = useSelector((state) => state.details.state.payload);

  const data = useMemo(() => {
    let newUsers = [{ label: "All", value: "" }];
    if (users?.length === 0) {
      return newUsers;
    }
    const newSortData = sortData(
      users?.map((item) => {
        return { label: item?.name, value: item?._id };
      }),
      "label"
    );
    return (newUsers = [...newUsers, ...newSortData]);
  }, [users]);

  return (
    <Select
      className="text-md pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm w-full"
      options={data}
      defaultValue={payload.user}
      onChange={(values) =>
        dispatch(setPayload({ ...payload, user: values || null }))
      }
      placeholder="Search & select users"
      style={{
        minHeight: "32px",
        height: "100%",
        width: "100%",
        outline: "none",
        border: "none",
        padding: "4px",
      }}
    />
  );
};

export default EmployeeSelect;
