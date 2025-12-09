import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiAllFileInfo } from "../../../services/FileInfoService";

export const allFileInfo = createAsyncThunk(
  "file-info/data/all",
  async (data) => {
    try {
      const response = await apiAllFileInfo(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const dataSlice = createSlice({
  name: "file-info/data",
  initialState: {
    fileInfo: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(allFileInfo.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.fileInfo = action.payload.data?.data;
        }
      })
      .addCase(allFileInfo.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(allFileInfo.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
