import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiAllDetails } from "../../../services/DetailsService";

export const allDetails = createAsyncThunk("details/data/all", async (data) => {
  try {
    const response = await apiAllDetails(data);
    return response;
  } catch (error) {
    return error?.response || error.toString();
  }
});
const dataSlice = createSlice({
  name: "details/data",
  initialState: {
    details: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(allDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.details = action.payload.data?.data;
        }
      })
      .addCase(allDetails.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(allDetails.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
