import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/dataSlice";
import { setSelectedUser } from "../store/stateSlice";

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

const role = ["ADMIN", "USER"];

const DetailsForm = (props) => {
  const dispatch = useDispatch();
  const { userModelToggle, setUserModelToggle, initialValue } = props;
  const [value, setValue] = useState(initialValue);
  const closeModal = () => {
    setUserModelToggle?.(false);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const action = await dispatch(updateUser(value));
    if (action.payload?.status === 200) {
      dispatch(setSelectedUser({ ...initialValue, ...value }));
      closeModal();
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  return (
    <Modal
      isOpen={userModelToggle}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <h3 className="p-0 mb-4 text-center font-semibold text-lg text-gray-700">
        UPDATE USER DETAILS
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="h-full w-full"
      >
        <div className="flex gap-2 h-10 w-full mb-4">
          <input
            autoComplete="off"
            placeholder="USER NAME"
            autoFocus
            required={true}
            value={value.name}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            onChange={handleOnChange}
            name="name"
          />
        </div>
        <div className="flex gap-2 h-10 mb-4">
          <input
            autoComplete="off"
            value={value.mobile}
            required={true}
            onChange={handleOnChange}
            name="mobile"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            placeholder="MOBILE"
          />
          <input
            autoComplete="off"
            value={value.address}
            required={true}
            onChange={handleOnChange}
            placeholder="ADDRESS"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
            name="address"
          />
        </div>
        <div className="flex gap-2 h-10 mb-4">
          <select
            required={true}
            name="role"
            value={value.role}
            onChange={handleOnChange}
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
          >
            <option selected defaultValue={value.role}>
              {value.role?.toString().toUpperCase()}
            </option>
            {role.map((user) => {
              if (user !== value.role)
                return <option value={user}>{user}</option>;
            })}
          </select>
          <select
            required={true}
            onChange={handleOnChange}
            name="status"
            className="uppercase w-full h-full text-sm ps-3 pe-3 outline-purple-800 border rounded-sm border-gray-300"
          >
            <option selected={initialValue.status === 'ACCEPTED'} value="ACCEPTED">ACCEPTED</option>
            <option selected={initialValue.status === 'REJECTED'} value="REJECTED">REJECTED</option>
            <option selected={initialValue.status === 'ACTIVE'} value="ACTIVE">ACTIVE</option>
            <option selected={initialValue.status === 'IN-ACTIVE'} value="IN-ACTIVE">IN ACTIVE</option>

          </select>
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

export default DetailsForm;
