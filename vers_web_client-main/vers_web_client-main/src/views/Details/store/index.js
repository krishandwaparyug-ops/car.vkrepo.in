import { combineReducers } from "@reduxjs/toolkit";
import data from "./dataSlice";
import state from "./stateSlice";

const DetailsReducer = combineReducers({
  data,
  state,
});

export default DetailsReducer;
