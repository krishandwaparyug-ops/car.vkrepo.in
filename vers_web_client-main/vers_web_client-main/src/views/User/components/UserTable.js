import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "../store/stateSlice";
import sortData from "../../../utils/sortFunction";

const UserTable = (props) => {
  const dispatch = useDispatch();
  const { data = [] } = props;

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const sortDataFunc = useMemo(() => {
    return sortData(data, "name");
  }, [data]);

  return (
    <div className="w-full h-[85vh] overflow-scroll">
      <table className="w-full uppercase border-collapse">
        <thead className="h-10 relative">
          <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-md">
            <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2">
              Name
            </th>
            <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2">
              Mobile
            </th>
            <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2">
              Role
            </th>
            <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {sortDataFunc.map((user, index) => {
            const isSelected = index === selectedRowIndex;
            return (
              <tr
                className={`text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800 ${
                  isSelected ? "!bg-indigo-200" : ""
                }`}
                key={index}
                onClick={() => {
                  dispatch(setSelectedUser(user));
                  setSelectedRowIndex(index);
                }}
              >
                <td className="border border-gray-400 ps-2 pe-2 ">
                  {user?.name || "-"}
                </td>
                <td className="border border-gray-400 ps-2 pe-2 text-center">
                  {user?.mobile || "-"}
                </td>
                <td className="border border-gray-400 ps-2 pe-2 text-center">
                  {user?.role || "-"}
                </td>
                <td
                  className={`border border-gray-400 ps-2 pe-2 text-center text-white ${
                    user?.status === "ACTIVE"
                      ? "bg-green-600"
                      : user?.status === "PENDING"
                      ? "bg-yellow-500"
                      : user?.status === "REJECTED"
                      ? "bg-red-600"
                      : "bg-gray-500"
                  }`}
                >
                  {user?.status || "-"}
                </td>
              </tr>
            );
          })}
          {sortDataFunc?.length === 0 ? (
            <tr className="text-left cursor-default select-none h-8 text-md text-gray-800">
              <td
                colSpan="4"
                className="border text-center text-md text-gray-700 border-gray-400 ps-2 pe-2 "
              >
                User not found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
export default UserTable;
