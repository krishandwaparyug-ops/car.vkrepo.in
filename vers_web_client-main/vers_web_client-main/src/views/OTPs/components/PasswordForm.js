import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setPasswordModal } from "../store/stateSlice";
import { newPassword } from "../store/dataSlice";

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
  password: "",
  cpassword: "",
};

const PasswordForm = () => {
  const dispatch = useDispatch();
  const passwordModal = useSelector((state) => state.otp.state.passwordModal);
  const selectedUser = useSelector((state) => state.otp.state.selectedUser);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(defaultValue);

  const closeModal = () => {
    dispatch(setPasswordModal(false));
  };

  useEffect(() => {
    setValues(defaultValue);
  }, [passwordModal]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if(values.password !== values.cpassword) {
        return notify('Password not matched');
    }

    setLoading(true)
    const action = await dispatch(
        newPassword({ _id: selectedUser?._id, ...values })
    );
    setLoading(false)
    if (action?.payload?.status === 200) {
      notify(action?.payload?.data?.message, "success");
      closeModal();
      return;
    }
    return notify(action?.payload?.data?.message);
  };

  return (
    <Modal
      isOpen={passwordModal}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <h3 className="p-0 mb-2 text-center font-semibold text-lg text-orange-500">
        New Password
      </h3>
      <h3 className="p-0 mb-4 text-center font-semibold text-lg text-gray-700">
        {selectedUser?.name}
      </h3>
      <form onSubmit={handleFormSubmit} className="h-full w-full">
        <div className="flex gap-2 h-9 w-full mb-3 ">
          <input
            autoComplete="off"
            autoFocus
            required
            placeholder="Password"
            className="w-full h-full text-md ps-3 pe-3 outline-purple-800 border"
            onChange={handleOnChange}
            value={values?.password}
            type="password"
            name="password"
          />
          <input
            autoComplete="off"
            required
            placeholder="Confirm Password"
            className="w-full h-full text-md ps-3 pe-3 outline-purple-800 border"
            onChange={handleOnChange}
            value={values?.cpassword}
            name="cpassword"
            type="password"
          />
        </div>
        <div className="flex justify-end gap-2">
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
};

export default PasswordForm;
