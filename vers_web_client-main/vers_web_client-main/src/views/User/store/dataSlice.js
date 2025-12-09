import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiAllUserPlan,
  apiAllUsers,
  apiNewUserPlan,
  apiUpdateUser,
  apiUpdateUserBranchAccess,
} from "../../../services/UserService";

export const updateUserBranchAccess = createAsyncThunk(
  "user/data/branch/access",
  async (data) => {
    try {
      const response = await apiUpdateUserBranchAccess(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

export const allUsers = createAsyncThunk("user/data/all", async (data) => {
  try {
    const response = await apiAllUsers(data);
    return response;
  } catch (error) {
    return error?.response || error.toString();
  }
});

export const updateUser = createAsyncThunk("user/data/update", async (data) => {
  try {
    const response = await apiUpdateUser(data);
    return response;
  } catch (error) {
    return error?.response || error.toString();
  }
});
export const newUserPlan = createAsyncThunk(
  "user/data/plan/register",
  async (data) => {
    try {
      const response = await apiNewUserPlan(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const userAllPlan = createAsyncThunk(
  "user/data/plan/all",
  async (data) => {
    try {
      const response = await apiAllUserPlan(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const dataSlice = createSlice({
  name: "user/data",
  initialState: {
    users: [],
    userPlan: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateUserBranchAccess.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.users = state.users.map((user) => {
            if (user._id === action.meta.arg._id) {
              return { ...user, ...action.payload.data?.data };
            }
            return user;
          });
        }
      })
      .addCase(updateUserBranchAccess.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUserBranchAccess.pending, (state) => {
        state.loading = true;
      });

    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.users = state.users.map((user) => {
            if (user._id === action.meta.arg._id) {
              return { ...user, ...action.meta.arg };
            }
            return user;
          });
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      });

    builder
      .addCase(allUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.users = action.payload.data?.data;
        }
      })
      .addCase(allUsers.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(allUsers.pending, (state) => {
        state.loading = true;
      });
    // USER PLAN BUILDER
    builder
      .addCase(userAllPlan.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.userPlan = action.payload.data?.data;
        }
      })
      .addCase(userAllPlan.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(userAllPlan.pending, (state) => {
        state.loading = true;
      });
    builder
      .addCase(newUserPlan.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 200) {
          state.userPlan = [action.payload.data?.data, ...state.userPlan];
        }
      })
      .addCase(newUserPlan.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(newUserPlan.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
