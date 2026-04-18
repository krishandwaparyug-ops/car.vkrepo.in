import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-dropdown-select";
import { useSelector, useDispatch } from "react-redux";
import { allBranch } from "../../Offices/store/dataSlice";
import sortData from "../../../utils/sortFunction";
import BaseService from "../../../services/BaseService";

const BranchSelect = (props) => {
  const { setSelectedBranch } = props;
  const dispatch = useDispatch();
  const branch =
    useSelector((state) => state.office.data.branchState.branch) || [];
  const [fallbackBranch, setFallbackBranch] = useState([]);
  const [loadingBranch, setLoadingBranch] = useState(false);

  const fetchBranch = useCallback(async () => {
    setLoadingBranch(true);

    try {
      const action = await dispatch(allBranch());
      const branchFromAction = Array.isArray(action?.payload?.data?.data)
        ? action.payload.data.data
        : [];

      if (branchFromAction.length > 0) {
        setFallbackBranch([]);
        return;
      }

      const branchResponse = await BaseService.post("/v1/branch/all", {});
      const branchFromFallback = Array.isArray(branchResponse?.data?.data)
        ? branchResponse.data.data
        : [];
      setFallbackBranch(branchFromFallback);
    } catch (error) {
      console.error("[BranchSelect] Unable to load branches", error);
      setFallbackBranch([]);
    } finally {
      setLoadingBranch(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (branch?.length > 0) {
      setFallbackBranch([]);
      return;
    }
    fetchBranch();
  }, [branch?.length, fetchBranch]);

  const data = useMemo(() => {
    const sourceBranches = branch.length > 0 ? branch : fallbackBranch;

    if (sourceBranches.length === 0) {
      return [];
    }

    return sortData(
      sourceBranches.map((item) => {
        return { label: item?.name, value: item?._id };
      }),
      "label"
    );
  }, [branch, fallbackBranch]);

  return (
    <div className="h-full upload-toolbar-branch">
      <Select
        className="text-sm pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm upload-branch-select"
        options={data}
        disabled={loadingBranch || data.length === 0}
        onChange={(values) => setSelectedBranch?.(values?.[0]?.value || null)}
        placeholder={loadingBranch ? "Loading branches..." : "Search & select branch"}
        noDataLabel={loadingBranch ? "Loading branches..." : "No branches found"}
        style={{
          minHeight: "40px",
          width: "100%",
          fontSize: "15px",
          outline: "none",
          border: "1px solid #2c2420",
          background: "#fffdf8",
          color: "#111111",
        }}
      />
    </div>
  );
};

export default BranchSelect;
