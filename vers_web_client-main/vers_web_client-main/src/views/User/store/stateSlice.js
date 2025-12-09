import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "user/state",
  initialState: {
    selectedUser : {},
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setSelectedUser
} = stateSlice.actions;

export default stateSlice.reducer;
