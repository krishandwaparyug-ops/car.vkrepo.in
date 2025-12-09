import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { deleteBranch, deleteBranchRecords } from "../../../store/dataSlice";
import { setBranchModal } from "../../../store/stateSlice";
import { toast } from "react-toastify";
const notify = (message, type = "error") => toast[type](message);
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "510px",
    marginRight: "-50%",
    transform: "translate(-50%, -40%)",
  },
};

export const defaultValue = {
  name: "",
  contact_one: {
    name: "",
    mobile: "",
  },
  contact_two: {
    name: "",
    mobile: "",
  },
  contact_three: {
    name: "",
    mobile: "",
  },
};

Modal.setAppElement("#root");

function BranchForm(props) {
  const { initialValue, handleSubmit } = props;
  const dispatch = useDispatch();

  const selectedHeadOffice = useSelector(
    (state) => state.office.state.selectedHeadOffice
  );
  const loading = useSelector((state) => state.office.data.branchState.loading);
  const branchModal = useSelector((state) => state.office.state.branchModal);

  function closeModal() {
    dispatch(setBranchModal({ type: branchModal.type, status: false }));
  }

  const [values, setValues] = useState(initialValue);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit?.(
      { ...values, head_office_id: selectedHeadOffice?._id },
      setValues
    );
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleObjectChange = (e, key) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [name]: value,
      },
    }));
  };

  const handleDelete = async () => {
    const action = await dispatch(
      deleteBranch({ _id: values._id, head_office_id: values?.head_office_id })
    );
    if (action.payload.status === 200) {
      notify("Branch successfully deleted", "success");
      closeModal();
      return;
    }
    return notify("Branch not deleted");
  };

  const handleDeleteRecords = async () => {
    const action = await dispatch(deleteBranchRecords({ _id: values._id }));
    if (action.payload.status === 200) {
      notify("Records successfully deleted", "success");
      closeModal();
      return;
    }
    return notify("Records not deleted");
  };

  useEffect(() => {
    setValues(initialValue);
  }, [initialValue]);

  return (
    <Modal
      isOpen={branchModal.status}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <h3 className="p-0 m-0 mb-4 text-center font-semibold text-lg text-gray-700">
        {selectedHeadOffice?.name}
      </h3>
      <form className="h-full w-full" onSubmit={handleFormSubmit}>
        <div className="flex gap-2 h-10 w-full mb-3 ">
          <input
            autoComplete="off"
            required
            placeholder="BRANCH NAME"
            autoFocus
            value={values.name}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            onChange={handleOnChange}
            name="name"
          />
        </div>
        <div className="flex gap-2 h-10 mb-4">
          <input
            autoComplete="off"
            value={values.contact_one.name}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="CONTACT PERSON ONE"
            onChange={(e) => handleObjectChange(e, "contact_one")}
            name="name"
          />
          <input
            autoComplete="off"
            value={values.contact_one.mobile}
            placeholder="CONTACT PERSON MOBILE"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            onChange={(e) => handleObjectChange(e, "contact_one")}
            name="mobile"
          />
        </div>
        <div className="flex gap-2 h-10 mb-4">
          <input
            autoComplete="off"
            value={values.contact_two.name}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="CONTACT PERSON TWO"
            onChange={(e) => handleObjectChange(e, "contact_two")}
            name="name"
          />
          <input
            autoComplete="off"
            value={values.contact_two.mobile}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="CONTACT PERSON MOBILE"
            onChange={(e) => handleObjectChange(e, "contact_two")}
            name="mobile"
          />
        </div>
        <div className="flex gap-2 h-10 mb-4">
          <input
            autoComplete="off"
            value={values.contact_three.name}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="CONTACT PERSON THREE"
            onChange={(e) => handleObjectChange(e, "contact_three")}
            name="name"
          />
          <input
            autoComplete="off"
            value={values.contact_three.mobile}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="CONTACT PERSON MOBILE"
            onChange={(e) => handleObjectChange(e, "contact_three")}
            name="mobile"
          />
        </div>
        <div className="flex justify-end gap-2">
          {initialValue?.type === "edit" ? (
            <>
              <button
                className={`ps-2 pe-2 h-7 text-sm border-0 uppercase rounded-sm bg-red-500 text-white  ${
                  loading ? "cursor-wait" : ""
                }`}
                type="button"
                role="button"
                onClick={handleDeleteRecords}
                disabled={loading}
              >
                Del Records
              </button>
              <button
                className={`ps-2 pe-2 h-7 text-sm border-0 uppercase rounded-sm bg-red-500 text-white  ${
                  loading ? "cursor-wait" : ""
                }`}
                type="button"
                role="button"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            </>
          ) : null}
          <button
            className={`ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 bg-blue-600 text-white  ${
              loading ? "cursor-wait" : ""
            }`}
            type="button"
            role="button"
            disabled={loading}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className={`ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 text-slate-700  ${
              loading ? "cursor-wait" : ""
            }`}
            type="submit"
            role="button"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BranchForm;
