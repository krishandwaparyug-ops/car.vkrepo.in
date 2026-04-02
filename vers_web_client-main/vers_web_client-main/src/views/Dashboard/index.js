import React, { useEffect, useMemo } from "react";
import OfficeReducer from "../Offices/store";
import { injectReducer } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import { allBranch, allHeadOffice } from "../Offices/store/dataSlice";
import Statistic from "./components/Statistic";
import { CgSpinner } from "react-icons/cg";
import MapInfo from "./components/Map";
import DashboardReducer from "./store";
import { allUserLastLocation } from "./store/dataSlice";
import UserReducer from "../User/store";
import { allUsers } from "../User/store/dataSlice";
import { setDate } from "./store/stateSlice";

injectReducer("office", OfficeReducer);
injectReducer("dashboard", DashboardReducer);
injectReducer("user", UserReducer);

const Dashboard = () => {
  const dispatch = useDispatch();
  const branch = useSelector((state) => state.office.data.branchState.branch);
  const date = useSelector((state) => state.dashboard.state.date);
  const lastLocations = useSelector(
    (state) => state.dashboard.data.location.data
  );
  const lastLocationLoading = useSelector(
    (state) => state.dashboard.data.location.loading
  );
  const branchLoading = useSelector(
    (state) => state.office.data.branchState.loading
  );
  const headOfficeLoading = useSelector(
    (state) => state.office.data.headOfficeState.loading
  );
  const headOffice = useSelector(
    (state) => state.office.data.headOfficeState.headOffice
  );
  const users = useSelector((state) => state.user.data.users);

  const fetchData = () => {
    dispatch(allHeadOffice());
    dispatch(allBranch());
  };

  const fetchUserLastLocation = (date) => {
    dispatch(allUserLastLocation({ date }));
  };
  const fetchAllUsers = () => {
    dispatch(allUsers());
  };

  useEffect(() => {
    if (branch?.length === 0) dispatch(allBranch());
    if (headOffice.length === 0) dispatch(allHeadOffice());
    if (users?.length === 0) fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalVehicle = useMemo(() => {
    return branch?.reduce((accumulator, currentRecord) => {
      return accumulator + currentRecord?.records;
    }, 0);
  }, [branch]);

  const filterUserByStatus = (status) => {
    return (
      users?.filter((user) => {
        return user?.status === status;
      })?.length || 0
    );
  };

  useEffect(() => {
    fetchUserLastLocation(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="page-grid grid-cols-1 xl:grid-cols-2">
      <div className="panel px-5 py-4">
        <div>
          <div className="flex justify-end items-center h-8 mb-3">
            <button
              className="px-3 bg-[#f3f8ff] border border-[#cfe0f7] h-full text-sm rounded-md uppercase font-semibold text-[#1f3d66] flex items-center justify-start"
              onClick={fetchData}
            >
              {branchLoading && headOfficeLoading ? (
                <CgSpinner
                  className={`mr-1 ${
                    branchLoading && headOfficeLoading ? "animate-spin" : ""
                  }`}
                />
              ) : null}
              Refresh
            </button>
          </div>
          <h3 className="text-xl mb-1">Vehicles</h3>
          <div className="grid grid-cols-3 gap-4 ">
            <Statistic
              title="Vehicles"
              bg_color="bg-pink-300"
              count={totalVehicle || 0}
            />
          </div>
          <h3 className="text-xl mt-3 mb-1">Offices</h3>
          <div className="grid grid-cols-3 gap-4 ">
            <Statistic
              title="Branch"
              bg_color="bg-blue-300"
              count={branch?.length || 0}
            />
            <Statistic
              title="Head Office"
              bg_color="bg-purple-300"
              count={headOffice?.length || 0}
            />
          </div>
          <h3 className="text-xl mt-3 mb-1">Users</h3>
          <div className="grid grid-cols-3 gap-4 ">
            <Statistic
              title="Pending"
              bg_color="bg-yellow-300"
              count={filterUserByStatus("PENDING") || 0}
            />
            <Statistic
              title="Active"
              bg_color="bg-green-300"
              count={filterUserByStatus("ACTIVE") || 0}
            />
            <Statistic
              title="Rejected"
              bg_color="bg-red-300"
              count={filterUserByStatus("REJECTED") || 0}
            />
          </div>
        </div>

        <h1 className="brand-heading text-3xl text-[#1f4d8f] mt-6 text-center font-semibold">
          Kartika Associates
        </h1>
        <h1 className="text-xl text-[#32496d] mt-2 text-center font-medium">
          Design & Developed By{" "}
          <a
            href="https://5techg.com"
            target="_blank"
            className="hover:underline text-[#1f6feb]"
            rel="noreferrer"
          >
            5TechG Team
          </a>
        </h1>
        <h1 className="text-lg text-[#32496d] text-center font-medium">
          Contact Us :- 7028828831
        </h1>
        <h1 className="text-md text-[#ff7a1a] text-center font-medium">
          Let's Build Together
        </h1>
      </div>
      <div className="panel px-5 py-4">
        <div className="flex justify-between items-center h-8 mb-3">
          <input
            value={date}
            onChange={(e) => {
              dispatch(setDate(e.target.value));
            }}
            type="date"
            className="h-full ps-3 pe-3 text-md rounded-md select-none"
          ></input>
          <button
            className="px-3 bg-[#f3f8ff] border border-[#cfe0f7] h-full text-sm rounded-md uppercase font-semibold text-[#1f3d66] flex items-center justify-start"
            onClick={fetchUserLastLocation}
          >
            {lastLocationLoading ? (
              <CgSpinner
                className={`mr-1 ${lastLocationLoading ? "animate-spin" : ""}`}
              />
            ) : null}
            Refresh
          </button>
        </div>
        <div style={{ height: "80vh" }}>
          <MapInfo data={lastLocations} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
