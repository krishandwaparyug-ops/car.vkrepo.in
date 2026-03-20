import React, { useEffect, useMemo } from "react";
import Select from "react-dropdown-select";
import { useSelector, useDispatch } from "react-redux";
import { allBranch } from "../../Offices/store/dataSlice";
import sortData from "../../../utils/sortFunction";

const BranchSelect = (props) => {
  const { setSelectedBranch } = props;
  const dispatch = useDispatch();
  const branch =
    useSelector((state) => state.office.data.branchState.branch) || [];

  const fetchBranch = () => {
    dispatch(allBranch());
  };
  useEffect(() => {
    if (branch?.length === 0) return fetchBranch();
  }, []);

  const data = useMemo(() => {
    if (branch.length === 0) {
      return [{ label: "", value: "" }];
    }
    return sortData(
      branch?.map((item) => {
        return { label: item?.name, value: item?._id };
      }),
      "label"
    );
  }, [branch]);

  return (
    <div style={{ width: "500px" }} className="h-full">
      {data.length > 0 && (
        <Select
          className="text-sm pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm"
          options={data}
          onChange={(values) => setSelectedBranch?.(values?.[0]?.value || null)}
          placeholder="Search & select branch"
          style={{
            minHeight: "32px",
            width: "100%",
            fontSize: '16.5px',
            outline: "none",
            border: "none",
          }}
        />
      )}
    </div>
  );
};

export default BranchSelect;
