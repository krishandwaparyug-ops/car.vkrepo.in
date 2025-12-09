import { memo, useMemo, useState } from "react";
import TableSearch from "../components/TableSearch";
import { useDispatch, useSelector } from "react-redux";
import { updateUserBranchAccess } from "../store/dataSlice";
import { setSelectedUser } from "../store/stateSlice";
import sortData from "../../../utils/sortFunction";
const BranchTable = (props) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const loading = useSelector((state) => state.office.data.branchState.loading);
  const {
    selectedUser: { branchId = [], _id },
    branches = [],
    onRefresh,
  } = props;

  const filterBranches = useMemo(() => {
    return branches.filter((branch) =>
      branch.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  }, [searchQuery, branches, branchId]);

  const handleBranchAccess = async (branch) => {
    const action = await dispatch(updateUserBranchAccess({ _id, ...branch }));
    if (action.payload?.status === 200) {
      dispatch(setSelectedUser(action.payload.data?.data));
    }
  };

  const sortDataFunc = useMemo(() => {
    return sortData(filterBranches, "name");
  }, [filterBranches]);

  return (
    <div className="w-full h-full overflow-hidden">
      <TableSearch
        setSearchQuery={setSearchQuery}
        onRefresh={onRefresh}
        loading={loading}
        type="branch"
      />
      <div className="w-full h-[85vh] overflow-scroll">
        <table className="w-full uppercase border-collapse">
          <thead className="h-10 relative">
            <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-md">
              <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2 ">
                Branch Name
              </th>
              <th className="border border-gray-400 font-semibold text-md text-center ps-2 pe-2 ">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortDataFunc.map((branch, index) => {
              return (
                <tr
                  className="text-left cursor-default select-none h-10 text-md text-gray-800"
                  key={index}
                >
                  <td className="border border-gray-400 ps-2 pe-2 ">
                    {branch?.name || "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2 w-14">
                    <div className="text-white flex justify-center w-full">
                      {!branchId?.includes(branch?._id) ? (
                        <button
                          className="bg-green-500 border p-1 rounded-md ps-2 pe-2"
                          onClick={() =>
                            handleBranchAccess({ branch_id: branch?._id })
                          }
                        >
                          YES
                        </button>
                      ) : (
                        <button
                          className="bg-red-500 border p-1 rounded-md ps-2 pe-2"
                          onClick={() =>
                            handleBranchAccess({ branch_id: branch?._id })
                          }
                        >
                          NO
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortDataFunc.length === 0 ? (
              <tr className="text-left cursor-default select-none h-10 text-md text-gray-800">
                <td
                  colSpan="2"
                  className="border text-center text-md text-gray-700 border-gray-400 ps-2 pe-2 "
                >
                  Branch not found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default memo(BranchTable);
