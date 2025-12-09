import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiDeleteVehicleById,
  apiGetVehicleDetailsAndDuplicate,
} from "../../../services/VehicleServices";

export const getVehicleDetailsAndDuplicates = createAsyncThunk(
  "vehicle/data/details/duplicate",
  async (data) => {
    try {
      const response = await apiGetVehicleDetailsAndDuplicate(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const deleteVehicleById = createAsyncThunk(
  "vehicle/data/details/delete",
  async (data) => {
    try {
      const response = await apiDeleteVehicleById(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const vehicleDetailsAndDuplicates = {
  vehicleDetails: [],
  loading: false,
};

const dataSlice = createSlice({
  name: "vehicle/data",
  initialState: {
    vehicleDetailsAndDuplicates,
  },
  reducers: {},
  extraReducers: (builder) => {
    // VEHICLE DETAIL AND CONTROLLER vehicle EXTRA REDUCER
    builder
      .addCase(getVehicleDetailsAndDuplicates.fulfilled, (state, action) => {
        state.vehicleDetailsAndDuplicates.loading = false;
        if (action.payload.status === 200) {
          state.vehicleDetailsAndDuplicates.vehicleDetails =
            action.payload.data?.data;
        }
      })
      .addCase(getVehicleDetailsAndDuplicates.rejected, (state, action) => {
        state.vehicleDetailsAndDuplicates.loading = false;
      })
      .addCase(getVehicleDetailsAndDuplicates.pending, (state) => {
        state.vehicleDetailsAndDuplicates.loading = true;
      });

    builder
      .addCase(deleteVehicleById.fulfilled, (state, action) => {
        if (action.payload.status === 200) {
          state.vehicleDetailsAndDuplicates.vehicleDetails = {
            ...state.vehicleDetailsAndDuplicates.vehicleDetails,
            branches:
              state.vehicleDetailsAndDuplicates.vehicleDetails?.branches?.filter(
                (data) =>
                  data._id !==
                  state.vehicleDetailsAndDuplicates.vehicleDetails?.vehicles?.filter(
                    (data) => data._id === action.meta.arg._id
                  )?.[0]?.branch_id
              ),
            vehicles:
              state.vehicleDetailsAndDuplicates.vehicleDetails?.vehicles?.filter(
                (data) => data._id !== action.meta.arg._id
              ),
          };
        }
      })
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
