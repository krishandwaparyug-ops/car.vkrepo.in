import { combineReducers } from "@reduxjs/toolkit";
import data from "./dataSlice";
import state from "./stateSlice";

const DashboardReducer = combineReducers({
  data,
  state
});

export default DashboardReducer;
