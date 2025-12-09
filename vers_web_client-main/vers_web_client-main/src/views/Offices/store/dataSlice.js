import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiAllBranch,
  apiAllHeadOffice,
  apiDeleteBranch,
  apiDeleteBranchRecords,
  apiDeleteHeadOffice,
  apiNewBranch,
  apiNewHeadOffice,
  apiUpdateBranch,
  apiUpdateHeadOffice,
} from "../../../services/OfficeServices";

export const newHeadOffice = createAsyncThunk(
  "office/data/head-office/registration",
  async (data) => {
    try {
      const response = await apiNewHeadOffice(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

export const allHeadOffice = createAsyncThunk(
  "office/data/head-office/all",
  async (data) => {
    try {
      const response = await apiAllHeadOffice(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const updateHeadOffice = createAsyncThunk(
  "office/data/head-office/update",
  async (data) => {
    try {
      const response = await apiUpdateHeadOffice(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const deleteHeadOffice = createAsyncThunk(
  "office/data/head-office/delete",
  async (data) => {
    try {
      const response = await apiDeleteHeadOffice(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

export const newBranch = createAsyncThunk(
  "office/data/branch/registration",
  async (data) => {
    try {
      const response = await apiNewBranch(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

export const allBranch = createAsyncThunk(
  "office/data/branch/pagination",
  async (data) => {
    try {
      const response = await apiAllBranch(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const updateBranch = createAsyncThunk(
  "office/data/branch/update",
  async (data) => {
    try {
      const response = await apiUpdateBranch(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const deleteBranch = createAsyncThunk(
  "office/data/branch/delete",
  async (data) => {
    try {
      const response = await apiDeleteBranch(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);
export const deleteBranchRecords = createAsyncThunk(
  "office/data/branch/delete/record",
  async (data) => {
    try {
      const response = await apiDeleteBranchRecords(data);
      return response;
    } catch (error) {
      return error?.response || error.toString();
    }
  }
);

const headOfficeState = {
  headOffice: [],
  loading: false,
};
const branchState = {
  branch: [],
  loading: false,
};

const dataSlice = createSlice({
  name: "office/data",
  initialState: {
    headOfficeState,
    branchState,
  },
  reducers: {
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    setActivityIndex: (state, action) => {
      state.activityIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Head Office Extra Reducer
    builder
      .addCase(newHeadOffice.fulfilled, (state, action) => {
        state.headOfficeState.loading = false;
        if (action.payload.status === 200) {
          state.headOfficeState.headOffice.push(action.payload.data?.data);
        }
      })
      .addCase(newHeadOffice.rejected, (state, action) => {
        state.headOfficeState.loading = false;
      })
      .addCase(newHeadOffice.pending, (state) => {
        state.headOfficeState.loading = true;
      });

    builder
      .addCase(updateHeadOffice.fulfilled, (state, action) => {
        state.headOfficeState.loading = false;
        if (action.payload.status === 200) {
          state.headOfficeState.headOffice =
            state.headOfficeState.headOffice.map((headOffice) => {
              if (headOffice._id === action.meta.arg._id) {
                return { ...headOffice, ...action.meta.arg };
              }
              return headOffice;
            });
        }
      })
      .addCase(updateHeadOffice.rejected, (state, action) => {
        state.headOfficeState.loading = false;
      })
      .addCase(updateHeadOffice.pending, (state) => {
        state.headOfficeState.loading = true;
      });

    builder
      .addCase(allHeadOffice.fulfilled, (state, action) => {
        state.headOfficeState.loading = false;
        if (action.payload.status === 200) {
          state.headOfficeState.headOffice = action.payload.data?.data;
        }
      })
      .addCase(allHeadOffice.rejected, (state, action) => {
        state.headOfficeState.loading = false;
      })
      .addCase(allHeadOffice.pending, (state) => {
        state.headOfficeState.loading = true;
      });
    builder
      .addCase(deleteHeadOffice.fulfilled, (state, action) => {
        state.headOfficeState.loading = false;
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.headOfficeState.headOffice =
            state.headOfficeState.headOffice.filter(
              (headOffice) => headOffice._id !== action.meta.arg._id
            );
          state.branchState.branch = state.branchState.branch.filter(
            (branch) => branch.head_office_id !== action.meta.arg._id
          );
        }
      })
      .addCase(deleteHeadOffice.rejected, (state, action) => {
        state.headOfficeState.loading = false;
        state.branchState.loading = false;
      })
      .addCase(deleteHeadOffice.pending, (state) => {
        state.headOfficeState.loading = true;
        state.branchState.loading = true;
      });

    // Branch Extra Reducer
    builder
      .addCase(newBranch.fulfilled, (state, action) => {
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.branchState.branch.push(action.payload.data?.data);
          state.headOfficeState.headOffice =
            state.headOfficeState.headOffice.map((headOffice) => {
              if (headOffice?._id === action.meta.arg?.head_office_id) {
                return {
                  ...headOffice,
                  branches: Number(headOffice.branches) + 1,
                };
              }
              return headOffice;
            });
        }
      })
      .addCase(newBranch.rejected, (state, action) => {
        state.branchState.loading = false;
      })
      .addCase(newBranch.pending, (state) => {
        state.branchState.loading = true;
      });

    builder
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.branchState.branch = state.branchState.branch.map((branch) => {
            if (branch._id === action.meta.arg._id) {
              return { ...branch, ...action.meta.arg };
            }
            return branch;
          });
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.branchState.loading = false;
      })
      .addCase(updateBranch.pending, (state) => {
        state.branchState.loading = true;
      });

    builder
      .addCase(allBranch.fulfilled, (state, action) => {
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.branchState.branch = action.payload.data?.data;
        }
      })
      .addCase(allBranch.rejected, (state, action) => {
        state.branchState.loading = false;
      })
      .addCase(allBranch.pending, (state) => {
        state.branchState.loading = true;
      });
    builder
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.headOfficeState.loading = false;
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.headOfficeState.headOffice =
            state.headOfficeState.headOffice.map((headOffice) => {
              if (headOffice._id === action.meta.arg.head_office_id) {
                return { ...headOffice, branches: headOffice.branches - 1 };
              }
              return headOffice;
            });
          state.branchState.branch = state.branchState.branch.filter(
            (branch) => branch._id !== action.meta.arg._id
          );
        }
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.headOfficeState.loading = false;
        state.branchState.loading = false;
      })
      .addCase(deleteBranch.pending, (state) => {
        state.headOfficeState.loading = true;
        state.branchState.loading = true;
      });
    builder
      .addCase(deleteBranchRecords.fulfilled, (state, action) => {
        state.branchState.loading = false;
        if (action.payload.status === 200) {
          state.branchState.branch = state.branchState.branch.map((branch) => {
            if (branch._id === action.meta.arg._id) {
              return { ...branch, records: 0 };
            }
            return branch;
          });
        }
      })
      .addCase(deleteBranchRecords.rejected, (state, action) => {
        state.branchState.loading = false;
      })
      .addCase(deleteBranchRecords.pending, (state) => {
        state.branchState.loading = true;
      });
  },
});

export const { setActivityIndex } = dataSlice.actions;

export default dataSlice.reducer;
