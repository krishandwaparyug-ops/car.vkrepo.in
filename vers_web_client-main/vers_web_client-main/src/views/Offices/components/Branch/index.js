import React, { useMemo, useState } from "react";
import BranchTable from "./components/BranchTable";
import BranchForm, { defaultValue } from "./components/BranchForm";
import { useSelector, useDispatch } from "react-redux";
import { newBranch, updateBranch } from "../../store/dataSlice";
import { setBranchModal } from "../../store/stateSlice";
import { toast } from "react-toastify";
const notify = (type = "error", message) => toast[type](message);
const Branch = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const selectedHeadOffice = useSelector(
    (state) => state.office.state.selectedHeadOffice
  );

  const type = useSelector((state) => state.office.state.type);

  const branch = useSelector((state) => state.office.data.branchState.branch);

  const branchModal = useSelector((state) => state.office.state.branchModal);
  const selectedBranch = useSelector(
    (state) => state.office.state.selectedBranch
  );

  const branchData = useMemo(() => {
    if (type === "all")
      return branch.filter((headOffice) =>
        headOffice.name.toLowerCase()?.includes(searchQuery.toLowerCase().trim())
      );
    else
      return branch.filter(
        (branch) =>
          branch.head_office_id === selectedHeadOffice._id &&
          branch.name.toLowerCase()?.includes(searchQuery.toLowerCase().trim())
      );
  }, [type, branch, searchQuery]);

  const handleNewFormSubmit = async (values, setValues) => {
    const action = await dispatch(newBranch(values));
    if (action.payload?.status === 200) {
      dispatch(setBranchModal({ type: branchModal.type, status: false }));
      setValues?.(defaultValue);
      notify("success", action.payload.data?.message);
      return;
    }
    notify("error", action.payload.data?.message);
    return;
  };
  const handleUpdateFormSubmit = async (values, setValues) => {
    const action = await dispatch(updateBranch(values));
    if (action.payload?.status === 200) {
      dispatch(setBranchModal({ type: branchModal.type, status: false }));
      setValues?.(defaultValue);
      notify("success", action.payload.data?.message);
      return;
    }
    notify("error", action.payload.data?.message);
    return;
  };

  return (
    <>
      <BranchTable data={branchData} setSearchQuery={setSearchQuery} />
      <BranchForm
        initialValue={
          branchModal.type === "edit"
            ? { type: "edit", ...selectedBranch }
            : { type: "new", ...defaultValue }
        }
        handleSubmit={
          branchModal.type === "new"
            ? handleNewFormSubmit
            : handleUpdateFormSubmit
        }
      />
    </>
  );
};

export default Branch;
