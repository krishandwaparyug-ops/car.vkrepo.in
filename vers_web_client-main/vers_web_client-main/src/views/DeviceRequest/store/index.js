import { combineReducers } from "@reduxjs/toolkit";
import data from "./dataSlice";

const DeviceRequestReducer = combineReducers({
  data,
});

export default DeviceRequestReducer;
