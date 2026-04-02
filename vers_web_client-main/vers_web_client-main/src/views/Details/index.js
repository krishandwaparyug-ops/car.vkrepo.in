import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { injectReducer } from "../../store";
import DetailsReducer from "./store";
import { allDetails } from "./store/dataSlice";
import DetailsTable from "./components/DetailsTable";
import TableFilterTools from "./components/TableFilterTools";
import UserReducer from "../User/store";
import { allUsers } from "../User/store/dataSlice";
injectReducer("details", DetailsReducer);
injectReducer("user", UserReducer);

const Details = () => {
  const details = useSelector((state) => state.details.data.details);
  const users = useSelector((state) => state.user.data.users);
  // const selectedUser = useSelector((state) => state.user.state.selectedUser)

  const dispatch = useDispatch();

  const fetchDetails = (data) => {
    dispatch(allDetails(data));
  };

  const fetchAllUsers = () => {
    dispatch(allUsers());
  };

  useEffect(() => {
    if (details.length === 0) {
      fetchDetails();
    }
  }, []);

  useEffect(() => {
    if (users.length === 0) {
      fetchAllUsers();
    }
  }, []);
  return (
    <div className="panel p-2 h-[85vh]">
      <TableFilterTools fetchDetails={fetchDetails} users={users} />
      <DetailsTable data={details} />
    </div>
  );
};

export default Details;
