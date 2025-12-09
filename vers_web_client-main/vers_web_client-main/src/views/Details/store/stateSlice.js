import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export const initialPayload = {
  date: dayjs(new Date()).format("YYYY-MM-DD"),
  rc_no: "",
  user: null,
};

const stateSlice = createSlice({
  name: "details/data",
  initialState: { payload: initialPayload },
  reducers: {
    setPayload: (state, action) => {
      state.payload = action.payload;
    },
  },
});

export const { setPayload } = stateSlice.actions;

export default stateSlice.reducer;
