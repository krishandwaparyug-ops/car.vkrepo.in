import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { CgSpinner } from "react-icons/cg";
import { useDispatch } from "react-redux";
import { deleteOTPUserDevice, newOTPGenerate } from "../store/dataSlice";
import { toast } from "react-toastify";
import sortData from "../../../utils/sortFunction";
import { setPasswordModal, setSelectedUser } from "../store/stateSlice";

const notify = (message, type = "error") => toast[type](message);

const OTPsTable = (props) => {
  const { data = [] } = props;
  const dispatch = useDispatch();
  const [generating, setGenerating] = useState({ user_id: "", status: false });
  const [deleting, setDeleting] = useState({ user_id: "", status: false });

  const sortDataFunc = useMemo(() => {
    return sortData(data, "name");
  }, [data]);

  const handleOnGenerate = async (user_id) => {
    setGenerating({
      user_id,
      status: true,
    });
    const action = await dispatch(newOTPGenerate({ user_id }));
    setGenerating({
      user_id,
      status: false,
    });
    if (action?.payload?.status === 200) {
      notify("OTP successfully changed", "success");
    } else {
      notify("OTP changed unsuccessful");
    }
  };

  const handleOnDelete = async (userDetails) => {
    const user_id = userDetails?._id;
    const name = userDetails?.name;
    const isConfirmed = window.confirm(
      `Delete the device id for ${name || "this user"}? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    setDeleting({ user_id, status: true });
    const action = await dispatch(
      deleteOTPUserDevice({
        user_id,
        requestDeviceId: userDetails?.requestDeviceId,
      })
    );
    setDeleting({ user_id, status: false });

    if (action?.payload?.status === 200) {
      notify("Device id successfully deleted", "success");
    } else {
      notify(
        action?.payload?.data?.message || "Device id delete unsuccessful"
      );
    }
  };

  return (
    <div className="w-full h-[85vh] overflow-scroll">
      <table className="w-full uppercase border-collapse">
        <thead className="h-10">
          <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-center text-md">
            <th className="border border-gray-400 font-semibold text-md">
              name
            </th>
            <th className="border border-gray-400 font-semibold text-md">
              mobile
            </th>
            <th className="border border-gray-400 font-semibold text-md">
              code
            </th>
            <th className="border border-gray-400 font-semibold text-md">
              created At (Code)
            </th>
            <th className="border border-gray-400 font-semibold text-md">
              action (new)
            </th>
          </tr>
        </thead>
        <tbody>
          {sortDataFunc?.length > 0 ? (
            sortDataFunc?.map((details) => {
              return (
                <tr
                  className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                  key={details?._id}
                >
                  <td className="border border-gray-400 ps-2 pe-2">
                    {details?.name || "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2 text-center">
                    {details?.mobile || "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2 text-center group capitalize">
                    <p className="hidden group-hover:block">
                      {details?.otp?.otp || "-"}
                    </p>
                    <p className="block group-hover:hidden text-blue-500 font-semibold">
                      hover me
                    </p>
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2 text-center">
                    {details?.otp?.createdAt
                      ? dayjs(details?.otp?.createdAt).format(
                          "DD/MM/YYYY hh:mm A"
                        )
                      : "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2">
                    <div className=" flex justify-center items-center gap-x-2">
                      <button
                        disabled={generating.status || deleting.status}
                        onClick={() => handleOnGenerate(details?._id)}
                        className={`ps-2 pe-2 bg-orange-500 h-8 border-0 text-md rounded-sm capitalize font-medium flex text-white items-center justify-start hover:bg-orange-400 ${
                          generating.status && "cursor-not-allowed"
                        }`}
                      >
                        {generating.status &&
                        generating.user_id === details?._id ? (
                          <CgSpinner
                            className={`text-white ${
                              generating ? "animate-spin" : ""
                            }`}
                          />
                        ) : null}
                        code
                      </button>
                      <button
                        disabled={generating.status || deleting.status}
                        onClick={() => {
                          dispatch(setSelectedUser(details));
                          dispatch(setPasswordModal(true));
                        }}
                        className={`ps-2 pe-2 bg-blue-500 h-8 border-0 text-md rounded-sm capitalize font-medium flex text-white items-center justify-start hover:bg-blue-400`}
                      >
                        pass
                      </button>
                      <button
                        disabled={generating.status || deleting.status}
                        onClick={() => handleOnDelete(details)}
                        className={`ps-2 pe-2 bg-red-500 h-8 border-0 text-md rounded-sm capitalize font-medium flex text-white items-center justify-start hover:bg-red-400 ${
                          deleting.status ? "cursor-not-allowed" : ""
                        }`}
                      >
                        {deleting.status && deleting.user_id === details?._id ? (
                          <CgSpinner className="text-white animate-spin" />
                        ) : null}
                        delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10" className="text-center w-full text-md">
                OTPs Not Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default OTPsTable;
