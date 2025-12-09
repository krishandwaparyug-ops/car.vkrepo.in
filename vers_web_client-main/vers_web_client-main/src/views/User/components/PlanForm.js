import React, { useState } from "react";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import { newUserPlan } from "../store/dataSlice";

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

const PlanForm = (props) => {
  const dispatch = useDispatch();
  const { userPlanModelToggle, setUserPlanModelToggle, selectedUser } = props;
  const [value, setValue] = useState({
    endDate: "",
    startDate: "",
  });
  const closeModal = () => {
    setUserPlanModelToggle?.(false);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const action = await dispatch(
      newUserPlan({ user_id: selectedUser?._id, ...value })
    );
    if (action.payload?.status === 200) {
      closeModal();
    }
  };
  return (
    <Modal
      isOpen={userPlanModelToggle}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <h3 className="p-0 mb-4 text-center font-semibold text-lg text-gray-700">
        USER NEW PLAN
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="h-full w-full"
      >
        <div className="flex gap-2 h-10 mb-4">
          <input
            autoComplete="off"
            type="date"
            value={value.startDate}
            required={true}
            onChange={handleOnChange}
            name="startDate"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="START DATE"
          />
          <input
            autoComplete="off"
            type="date"
            value={value.endDate}
            required={true}
            onChange={handleOnChange}
            placeholder="END DATE"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            name="endDate"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 bg-blue-500 text-white"
            type="button"
            role="button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="ps-2 pe-2 h-7 text-sm border uppercase rounded-sm border-gray-300 text-slate-700"
            type="submit"
            role="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlanForm;
