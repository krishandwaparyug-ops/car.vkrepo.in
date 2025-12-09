import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "office/state",
  initialState: {
    selectedHeadOffice: {
      _id: "",
    },
    selectedBranch: {
      _id: "",
    },
    type: "all",
    headOfficeModal: {
      type: "new",
      status: false,
    },
    branchModal: {
      type: "new",
      status: false,
    },
  },
  reducers: {
    setSelectedHeadOffice: (state, action) => {
      state.selectedHeadOffice = action.payload;
    },
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setHeadOfficeModal: (state, action) => {
      state.headOfficeModal = action.payload;
    },
    setBranchModal: (state, action) => {
      state.branchModal = action.payload;
    },
  },
});

export const {
  setSelectedHeadOffice,
  setSelectedBranch,
  setType,
  setHeadOfficeModal,
  setBranchModal,
} = stateSlice.actions;

export default stateSlice.reducer;
