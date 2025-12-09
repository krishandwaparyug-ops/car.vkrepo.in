import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "otp/state",
  initialState: {
    selectedUser: {
      _id: "",
      name: ""
    },
    passwordModal: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setPasswordModal: (state, action) => {
      state.passwordModal = action.payload;
    },
  },
});

export const {
  setSelectedUser,
  setPasswordModal,
} = stateSlice.actions;

export default stateSlice.reducer;
