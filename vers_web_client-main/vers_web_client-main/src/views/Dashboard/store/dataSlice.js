import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiAllLastLocations } from "../../../services/DetailsService";

export const allUserLastLocation = createAsyncThunk(
  "dashboard/data/last/location",
  async (data) => {
    try {
      const response = await apiAllLastLocations(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const location = {
  loading: false,
  data: [],
};

const dataSlice = createSlice({
  name: "dashboard/data",
  initialState: {
    location,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(allUserLastLocation.fulfilled, (state, action) => {
        state.location.loading = false;
        if (action.payload.status === 200) {
          state.location.data = action.payload.data?.data;
        }
      })
      .addCase(allUserLastLocation.rejected, (state, action) => {
        state.location.loading = false;
      })
      .addCase(allUserLastLocation.pending, (state) => {
        state.location.loading = true;
      });
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
