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
    <div className="grid grid-cols-12 gap-2 pe-2 ps-2 h-96">
      <div className="col-span-5 h-[85vh]">
        <Search />
      </div>
      <div className="grid col-span-3 h-[85vh]">
        <BranchDetails />
      </div>
      <div className="grid col-span-4 h-[90vh]">
        <Details />
      </div>
    </div>
  );
};

export default Vehicles;
