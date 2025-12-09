import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export const initialPayload = {
  date: dayjs(new Date()).format("YYYY-MM-DD"),
};

const stateSlice = createSlice({
  name: "dashboard/data",
  initialState: { ...initialPayload },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
  },
});

export const { setDate } = stateSlice.actions;

export default stateSlice.reducer;
