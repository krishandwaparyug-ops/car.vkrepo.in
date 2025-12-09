import React, { useEffect, useMemo, useState } from "react";
import UserTable from "./components/UserTable";
import BranchTable from "./components/BranchTable";
import UserDetails from "./components/UserDetails";
import isEmpty from "lodash/isEmpty";
import TableSearch from "./components/TableSearch";
import { useSelector, useDispatch } from "react-redux";
import { allBranch } from "../Offices/store/dataSlice";
import { injectReducer } from "../../store";
import OfficeReducer from "../Offices/store";
import UserReducer from "./store";
import { allUsers } from "./store/dataSlice";

injectReducer("office", OfficeReducer);
injectReducer("user", UserReducer);

const User = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const branches = useSelector((state) => state.office.data.branchState.branch);
  const users = useSelector((state) => state.user.data.users);
  const loading = useSelector((state) => state.user.data.loading);
  const selectedUser = useSelector((state) => state.user.state.selectedUser);

  const fetchAllUsers = () => {
    dispatch(allUsers());
  };

  const fetchAllBranches = () => {
    dispatch(allBranch());
  };

  useEffect(() => {
    if (branches.length === 0) {
      fetchAllBranches();
    }
    if (users.length === 0) {
      fetchAllUsers();
    }
  }, []);

  const filterUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const shouldFilterByStatus = status !== "";

    const filteredUsers = users.filter((user) => {
      const nameMatches = user?.name.toLowerCase().startsWith(query);
      const mobileMatches = user?.mobile
        ?.toString()
        .toLowerCase()
        .endsWith(query);

      if (shouldFilterByStatus) {
        return (nameMatches || mobileMatches) && user.status === status;
      } else {
        return nameMatches || mobileMatches;
      }
    });
    return filteredUsers;
  }, [searchQuery, users, status]);

  return (
    <div className="grid grid-cols-12 gap-2 pe-2 ps-2 h-[85vh]">
      <div className="grid col-span-5 h-full">
        <div className="w-full h-full rounded-sm">
          <TableSearch
            setSearchQuery={setSearchQuery}
            onRefresh={fetchAllUsers}
            loading={loading}
            setStatus={setStatus}
            status={status}
          />
          <UserTable data={filterUsers} />
        </div>
      </div>
      <div className="grid col-span-3 h-[85vh]">
        {!isEmpty(selectedUser) && <UserDetails selectedUser={selectedUser} />}
      </div>
      <div className="grid col-span-4 h-full">
        {!isEmpty(selectedUser) && (
          <BranchTable
            selectedUser={selectedUser}
            branches={branches}
            onRefresh={fetchAllBranches}
          />
        )}
      </div>
    </div>
  );
};

export default User;
