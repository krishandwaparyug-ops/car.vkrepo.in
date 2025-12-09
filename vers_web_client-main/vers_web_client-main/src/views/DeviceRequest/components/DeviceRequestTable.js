import React, { useMemo, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useDispatch } from "react-redux";
import { updateDeviceRequestStatus } from "../store/dataSlice";
import { toast } from "react-toastify";
import sortData from "../../../utils/sortFunction";

const notify = (message, type = "error") => toast[type](message);

const DeviceRequestTable = (props) => {
  const { data = [] } = props;
  const dispatch = useDispatch();
  const [updatingUser, setUpdatingUser] = useState({
    user_id: "",
    status: "",
    loading: false,
  });

  const sortDataFunc = useMemo(() => {
    return sortData(data, "name");
  }, [data]);

  const handleOnUpdateDeviceRequest = async (user_id, status = "FAILED") => {
    setUpdatingUser({
      user_id,
      status,
      loading: true,
    });
    const action = await dispatch(
      updateDeviceRequestStatus({ user_id, status })
    );
    setUpdatingUser({
      user_id,
      status,
      loading: false,
    });
    if (action?.payload?.status === 200) {
      notify("Successful", "success");
    } else {
      notify("Unsuccessful");
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
              action
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
                  <td className="border border-gray-400 ps-2 pe-2">
                    <div className=" flex justify-center items-center gap-x-2">
                      <button
                        disabled={updatingUser.loading}
                        onClick={() =>
                          handleOnUpdateDeviceRequest(details?._id, "ACCEPTED")
                        }
                        className={`ps-2 pe-2 bg-green-500 h-8 border-0 text-md rounded-sm capitalize font-medium flex text-white items-center justify-start hover:bg-green-400 ${
                          updatingUser.status && "cursor-not-allowed"
                        }`}
                      >
                        {updatingUser.loading &&
                        updatingUser.user_id === details?._id &&
                        updatingUser.status === "ACCEPTED" ? (
                          <CgSpinner
                            className={`text-white ${
                              updatingUser ? "animate-spin" : ""
                            }`}
                          />
                        ) : null}
                        Yes
                      </button>
                      <button
                        disabled={updatingUser.loading}
                        onClick={() =>
                          handleOnUpdateDeviceRequest(details?._id, "FAILED")
                        }
                        className={`ps-2 pe-2 bg-red-500 h-8 border-0 text-md rounded-sm capitalize font-medium flex text-white items-center justify-start hover:bg-red-400`}
                      >
                        {updatingUser.loading &&
                        updatingUser.user_id === details?._id &&
                        updatingUser.status === "FAILED" ? (
                          <CgSpinner
                            className={`text-white ${
                              updatingUser ? "animate-spin" : ""
                            }`}
                          />
                        ) : null}
                        No
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10" className="text-center w-full text-md">
                Device Ids Not Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DeviceRequestTable;
