
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setBranch, setData, setPageIndex, setQuery, setType } from "../../../store/stateSlice";
import { allBranch } from "../../../../Offices/store/dataSlice";
import sortData from "../../../../../utils/sortFunction";


const TableSearch = (props) => {
  const { fetchData } = props;
  const dispatch = useDispatch();
  const type = useSelector((state) => state.vehicle.state.searchQuery.type);
  const query = useSelector((state) => state.vehicle.state.searchQuery.query);
  const branch = useSelector((state) => state.office.data.branchState.branch);
  const branchId = useSelector(
    (state) => state.vehicle.state.searchQuery.branchId
  );
  const handleOnChange = (e) => {
    const value = e.target.value;
    dispatch(setQuery(value));

    if (value?.trim()?.length >= 2) {
      fetchData?.(1, value, type, branchId);
    } else {
      dispatch(setData([]));
      dispatch(setPageIndex(1));
    }
  };

  useEffect(() => {
    if (query?.trim()?.length >= 2) {
      fetchData?.(1, query, type, branchId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, branchId]);

  useEffect(() => {
    if (branch?.length === 0) {
      dispatch(allBranch());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortDataFunc = useMemo(() => {
    return sortData(
      branch?.map((item) => {
        return { name: item?.name, _id: item?._id };
      }),
      "name"
    );
  }, [branch]);

  return (
    <div className="h-10 bg-blue-500 flex gap-2 items-center p-1 rounded-t-sm">
      <input
        className="h-full outline-none ps-2 pe-2 rounded-sm text-md"
        onChange={handleOnChange}
        value={query}
        placeholder={`Search by ${
          type === "rc_no" ? "RC No" : "Chassis No"
        } (last 4 or full)...`}
      ></input>
      <select
        required={true}
        defaultValue={type}
        onChange={(e) => dispatch(setType(e.target.value))}
        className="h-full outline-none ps-2 pe-2 rounded-sm text-md w-40"
      >
        <option style={{fontSize: '18px'}} selected value="rc_no">
          RC Number
        </option>
        <option style={{fontSize: '18px'}} value="chassis_no">Chassis Number</option>
      </select>
      <select
        required={true}
        defaultValue={branchId}
        onChange={(e) => dispatch(setBranch(e.target.value))}
        className="h-full outline-none ps-2 pe-2 rounded-sm text-md w-full"
      >
        <option value="">ALL</option>
        {sortDataFunc?.map((branch) => {
          return <option style={{fontSize: '18px'}} value={branch?._id}>{branch?.name}</option>;
        })}
      </select>
    </div>
  );
};

export default TableSearch;
