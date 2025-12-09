import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetAllOTPs, apiNewOTPGenerate } from "../../../services/OTPService";
import { apiUpdateUserPassword } from "../../../services/UserService";

export const getOTPList = createAsyncThunk("otp/data/list", async (data) => {
  try {
    const response = await apiGetAllOTPs(data);
    return response;
  } catch (error) {
    return error?.response || error.toString();
  }
});
export const newOTPGenerate = createAsyncThunk(
  "otp/data/generate",
  async (data) => {
    try {
      const response = await apiNewOTPGenerate(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const newPassword = createAsyncThunk(
  "otp/data/password/new",
  async (data) => {
    try {
      const response = await apiUpdateUserPassword(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const initialOTP = {
  OTPs: [],
  loading: false,
};

const dataSlice = createSlice({
  name: "otp/data",
  initialState: {
    OTP: initialOTP,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOTPList.fulfilled, (state, action) => {
        state.OTP.loading = false;
        if (action.payload.status === 200) {
          state.OTP.OTPs = action.payload.data?.data;
        }
      })
      .addCase(getOTPList.rejected, (state, action) => {
        state.OTP.loading = false;
      })
      .addCase(getOTPList.pending, (state) => {
        state.OTP.loading = true;
      });

    builder.addCase(newOTPGenerate.fulfilled, (state, action) => {
      if (action.payload.status === 200) {
        state.OTP.OTPs = state.OTP.OTPs.map((user) => {
          if (user?._id === action.meta.arg?.user_id) {
            return { ...user, otp: action.payload.data?.data };
          }
          return user;
        });
      }
    });
    builder.addCase(newPassword.fulfilled, () => {});
  },
});

export const {} = dataSlice.actions;

export default dataSlice.reducer;
