
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setBranch, setQuery, setType } from "../../../store/stateSlice";
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
    dispatch(setQuery(e.target.value));
    if (e.target.value?.length === 4) {
      fetchData?.(1, e.target.value, type, branchId);
    }
  };

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
        minLength={4}
        maxLength={4}
        className="h-full outline-none ps-2 pe-2 rounded-sm text-md"
        onChange={handleOnChange}
        value={query}
        placeholder={`Search by ${
          type === "rc_no" ? "RC No" : "Chassis No"
        }...`}
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
