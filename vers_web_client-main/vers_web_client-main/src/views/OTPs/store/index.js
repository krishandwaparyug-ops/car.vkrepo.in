import { combineReducers } from "@reduxjs/toolkit";
import data from "./dataSlice";
import state from "./stateSlice";

const OTPReducer = combineReducers({
  data,
  state,
});

export default OTPReducer;
