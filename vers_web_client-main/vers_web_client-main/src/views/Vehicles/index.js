import React from "react";
import Search from "./components/Search";
import Details from "./components/Details";
import { injectReducer } from "../../store";
import VehicleReducer from "./store";
import BranchDetails from "./components/Branches";
import OfficeReducer from "../Offices/store";

injectReducer("office", OfficeReducer);
injectReducer("vehicle", VehicleReducer);

const Vehicles = () => {
  return (
    <div className="page-grid grid-cols-1 xl:grid-cols-12 min-h-[80vh]">
      <div className="panel xl:col-span-5 h-[85vh] p-2">
        <Search />
      </div>
      <div className="panel grid xl:col-span-3 h-[85vh] p-2">
        <BranchDetails />
      </div>
      <div className="panel grid xl:col-span-4 h-[85vh] p-2">
        <Details />
      </div>
    </div>
  );
};

export default Vehicles;
