import React, { forwardRef, useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { setHeadOfficeModal } from "../../../store/stateSlice";
import { deleteHeadOffice } from "../../../store/dataSlice";
import { toast } from "react-toastify";
const notify = (message, type = "error") => toast[type](message);
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    width: "510px",
    transform: "translate(-50%, -50%)",
  },
};

export const defaultValue = {
  name: "",
  _id: "",
};

// Modal.setAppElement("#root");

const HeadOfficeForm = forwardRef((props, ref) => {
  const { handleSubmit, initialValue } = props;
  const dispatch = useDispatch();
  const headOfficeModal = useSelector(
    (state) => state.office.state.headOfficeModal
  );
  const loading = useSelector(
    (state) => state.office.data.headOfficeState.loading
  );

  const [values, setValues] = useState(initialValue);

  const handleDelete = async () => {
    const action = await dispatch(deleteHeadOffice({ _id: initialValue?._id }));
    if (action.payload.status === 200) {
      notify(action.payload.data?.message, "success");
      closeModal();
      return;
    }
    return notify(action.payload.data?.message);
  };

  const closeModal = () => {
    dispatch(setHeadOfficeModal({ type: headOfficeModal.type, status: false }));
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    setValues(initialValue);
  }, [initialValue]);

  return (
    <Modal
      isOpen={headOfficeModal.status}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <h3 className="p-0 mb-4 text-center font-semibold text-lg text-gray-700">
        {initialValue?.type === "edit"
          ? "UPDATE HEAD OFFICE"
          : "NEW HEAD OFFICE"}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit?.(values, setValues);
        }}
        className="h-full w-full"
      >
        <div className="flex gap-2 h-9 w-full mb-3 ">
          <input
            autoComplete="off"
            autoFocus
            required
            placeholder="HEAD OFFICE NAME"
            className="uppercase w-full h-full text-md ps-3 pe-3 outline-purple-800"
            onChange={handleOnChange}
            value={values?.name}
            name="name"
          />
        </div>
        <div className="flex justify-end gap-2">
          {initialValue?.type === "edit" ? (
            <button
              className={`ps-2 pe-2 h-7 text-sm border-0 uppercase rounded-sm bg-red-500 text-white ${
                loading ? "cursor-wait" : ""
              }`}
              type="button"
              role="button"
              disabled={loading}
              onClick={handleDelete}
            >
              Delete
            </button>
          ) : null}
          <button
            className={`ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 bg-blue-500 text-white  ${
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
            className={`ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 text-slate-700  ${
              loading ? "cursor-wait" : ""
            }`}
            type="submit"
            role="submit"
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
});

HeadOfficeForm.defaultProps = {
  initialValue: {
    _id: "",
    type: "new",
    name: "",
  },
};

export default HeadOfficeForm;
