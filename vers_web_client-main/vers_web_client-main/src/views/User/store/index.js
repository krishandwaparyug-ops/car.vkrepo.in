import { combineReducers } from "@reduxjs/toolkit";
import data from "./dataSlice";
import state from "./stateSlice";

const UserReducer = combineReducers({
  data,
  state,
});

export default UserReducer;
