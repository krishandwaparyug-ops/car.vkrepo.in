import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiGetAllDeviceRequest,
  apiUpdateDeviceRequest,
} from "../../../services/DeviceRequestService";
import { apiAllUsers } from "../../../services/UserService";

export const getAllDeviceRequest = createAsyncThunk(
  "device/data/list",
  async (data) => {
    try {
      const response = await apiGetAllDeviceRequest(data);

      if (response?.status === 200 && Array.isArray(response?.data?.data)) {
        if (response.data.data.length > 0) {
          return response;
        }

        // Fallback so web can still show device ids if API payload differs.
        const usersResponse = await apiAllUsers();
        if (usersResponse?.status === 200 && Array.isArray(usersResponse?.data?.data)) {
          const usersWithDeviceIds = usersResponse.data.data.filter(
            (user) =>
              (user?.requestDeviceId && String(user.requestDeviceId).trim() !== "") ||
              (user?.deviceId && String(user.deviceId).trim() !== "")
          );
          return {
            ...response,
            data: {
              ...response.data,
              data: usersWithDeviceIds,
            },
          };
        }
      }

      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const updateDeviceRequestStatus = createAsyncThunk(
  "device/data/update",
  async (data) => {
    try {
      const response = await apiUpdateDeviceRequest(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const initialState = {
  requests: [],
  loading: false,
};

const dataSlice = createSlice({
  name: "otp/data",
  initialState: {
    device: initialState,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllDeviceRequest.fulfilled, (state, action) => {
        state.device.loading = false;
        if (action.payload.status === 200) {
          state.device.requests = action.payload.data?.data;
        }
      })
      .addCase(getAllDeviceRequest.rejected, (state, action) => {
        state.device.loading = false;
      })
      .addCase(getAllDeviceRequest.pending, (state) => {
        state.device.loading = true;
      });

    builder.addCase(updateDeviceRequestStatus.fulfilled, (state, action) => {
      if (action.payload.status === 200) {
        state.device.requests = state.device.requests.filter(
          (user) => user?._id !== action.meta.arg?.user_id
        );
      }
    });
  },
});

export default dataSlice.reducer;
