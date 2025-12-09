import { createSlice } from "@reduxjs/toolkit";

export const searchInitialState = {
  type: "rc_no",
  query: "",
  branchId: "",
  pageIndex: 1,
  data: [],
};

const stateSlice = createSlice({
  name: "vehicle/state",
  initialState: {
    searchQuery: searchInitialState,
    selectedVehicleIndex: "",
    selectedVehicle: "",
  },
  reducers: {
    setSelectedVehicleIndex: (state, action) => {
      state.selectedVehicleIndex = action.payload;
    },
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    setType: (state, action) => {
      state.searchQuery.type = action.payload;
    },
    setBranch: (state, action) => {
      state.searchQuery.branchId = action.payload;
    },
    setQuery: (state, action) => {
      state.searchQuery.query = action.payload;
    },
    setPageIndex: (state, action) => {
      state.searchQuery.pageIndex = action.payload;
    },
    setData: (state, action) => {
      state.searchQuery.data = action.payload;
    },
  },
});

export const {
  setSelectedVehicleIndex,
  setSelectedVehicle,
  setType,
  setBranch,
  setQuery,
  setPageIndex,
  setData,
} = stateSlice.actions;

export default stateSlice.reducer;
