import isEmpty from "lodash/isEmpty";
import React, { memo, useEffect, useState } from "react";
import dayjs from "dayjs";
import DetailsForm from "./DetailsForm";
import PlanForm from "./PlanForm";
import { useDispatch, useSelector } from "react-redux";
import { userAllPlan } from "../store/dataSlice";
import appConfig from "../../../configs/app.config";

const UserDetails = (props) => {
  const dispatch = useDispatch();
  const { selectedUser } = props;
  const [userModelToggle, setUserModelToggle] = useState(false);
  const [userPlanModelToggle, setUserPlanModelToggle] = useState(false);
  const userPlan = useSelector((state) => state.user.data.userPlan);
  useEffect(() => {
    if (selectedUser) dispatch(userAllPlan({ user_id: selectedUser?._id }));
  }, [selectedUser]);

  return (
    <>
      <div className="w-full h-full">
        <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm">
          <h1 className="flex gap-2 text-white text-md">USER DETAILS</h1>
          <div className="flex gap-2 text-white">
            <button
              className="text-md font-bold bg-green-600 border rounded-sm pe-2 ps-2 p-1"
              onClick={() => setUserModelToggle(true)}
            >
              EDIT
            </button>
          </div>
        </div>
        <div className="w-full overflow-scroll h-[285px]">
          <table className="w-full uppercase border-collapse">
            <tbody className="table-body">
              {!isEmpty(selectedUser)
                ? Object.keys(selectedUser).map((element, index) => {
                    if (
                      ![
                        "branchId",
                        "_id",
                        "__v",
                        "password",
                        "deviceId",
                        "requestDeviceId",
                      ].includes(element)
                    )
                      if (["createdAt", "updatedAt"].includes(element))
                        return (
                          <tr
                            className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                            key={index}
                          >
                            <td className="border border-gray-400 ps-2 pe-2">
                              {element || "-"}
                            </td>
                            <td className="border border-gray-400 ps-2 pe-2 ">
                              {dayjs(selectedUser[element]).format(
                                "MMMM D, YYYY h:mm A"
                              ) || "-"}
                            </td>
                          </tr>
                        );
                      else if (
                        [
                          "aadharFront",
                          "aadharBack",
                          "panCard",
                          "draCertificate",
                        ].includes(element)
                      ) {
                        if (selectedUser[element]) {
                          let filePath = selectedUser[element];
                          const newFilePath = filePath.replace(/^public\//, "");

                          return (
                            <tr
                              className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                              key={index}
                            >
                              <td className="border border-gray-400 ps-2 pe-2">
                                {element || "-"}
                              </td>
                              <td className="border border-gray-400 ps-2 pe-2">
                                <a
                                  target="_blank"
                                  href={appConfig.apiPrefix + newFilePath}
                                  className="border px-4 py-1 bg-blue-500 text-white rounded" rel="noreferrer"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          );
                        }
                      } else {
                        return (
                          <tr
                            className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                            key={index}
                          >
                            <td className="border border-gray-400 ps-2 pe-2">
                              {element || "-"}
                            </td>
                            <td className="border border-gray-400 ps-2 pe-2">
                              {selectedUser[element] || "-"}
                            </td>
                          </tr>
                        );
                      }
                  })
                : null}
            </tbody>
          </table>
        </div>
        <div className="h-9 bg-blue-500 flex mt-5 justify-between items-center p-1 rounded-t-sm">
          <h1 className="flex gap-2 text-white">USER PLANS</h1>
          <div className="flex gap-2 text-white">
            <button
              className="text-md font-bold bg-pink-600 border rounded-sm pe-2 ps-2 p-1"
              onClick={() => setUserPlanModelToggle(true)}
            >
              NEW
            </button>
          </div>
        </div>
        <div className="w-full overflow-scroll h-[285px]">
          <table className="w-full uppercase border-collapse">
            <thead className="h-10">
              <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-center text-md">
                <th className="border border-gray-400 font-semibold text-md">
                  START
                </th>
                <th className="border border-gray-400 font-semibold text-md">
                  END
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {userPlan?.length > 0
                ? userPlan.map((plan, index) => {
                    return (
                      <tr
                        className="text-center cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                        key={index}
                      >
                        <td className="border border-gray-400 ps-2 pe-2">
                          {dayjs(plan?.startDate).format("D-MMMM-YYYY") || "-"}
                        </td>
                        <td className="border border-gray-400 ps-2 pe-2 ">
                          {dayjs(plan?.endDate).format("D-MMMM-YYYY") || "-"}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </div>
      <DetailsForm
        initialValue={selectedUser}
        userModelToggle={userModelToggle}
        setUserModelToggle={setUserModelToggle}
      />
      <PlanForm
        selectedUser={selectedUser}
        userPlanModelToggle={userPlanModelToggle}
        setUserPlanModelToggle={setUserPlanModelToggle}
      />
    </>
  );
};
export default memo(UserDetails);
