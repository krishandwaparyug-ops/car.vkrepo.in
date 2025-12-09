import React from "react";
import HeadOfficeTable from "./components/HeadOfficeTable";
import HeadOfficeForm, { defaultValue } from "./components/HeadOfficeForm";
import { useDispatch, useSelector } from "react-redux";
import { newHeadOffice, updateHeadOffice } from "../../store/dataSlice";
import { setHeadOfficeModal } from "../../store/stateSlice";
import { toast } from "react-toastify";

const notify = (type = "error", message) => toast[type](message);

const HeadOffice = () => {
  const dispatch = useDispatch();
  const selectedHeadOffice = useSelector(
    (state) => state.office.state.selectedHeadOffice
  );
  const headOfficeModal = useSelector(
    (state) => state.office.state.headOfficeModal
  );

  const handleNewFormSubmit = async (values, setValues) => {
    const action = await dispatch(newHeadOffice(values));
    if (action.payload?.status === 200) {
      dispatch(
        setHeadOfficeModal({ type: headOfficeModal.type, status: false })
      );
      setValues?.(defaultValue);
      notify("success", action.payload.data?.message);
      return;
    }
    notify("error", action.payload.data?.message);
    return;
  };

  const handleUpdateFormSubmit = async (values, setValues) => {
    const action = await dispatch(updateHeadOffice(values));
    if (action.payload?.status === 200) {
      dispatch(
        setHeadOfficeModal({ type: headOfficeModal.type, status: false })
      );
      setValues?.(defaultValue);
      notify("success", action.payload.data?.message);
      return;
    }
    notify("error", action.payload.data?.message);
    return;
  };

  return (
    <>
      <HeadOfficeTable />
      <HeadOfficeForm
        initialValue={
          headOfficeModal.type === "edit"
            ? { type: headOfficeModal.type, ...selectedHeadOffice }
            : { ...defaultValue }
        }
        handleSubmit={
          headOfficeModal.type === "new"
            ? handleNewFormSubmit
            : handleUpdateFormSubmit
        }
      />
    </>
  );
};

export default HeadOffice;
