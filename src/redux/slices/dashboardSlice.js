import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// 1. Async Thunk: Fetch Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard stats.";
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Fetch Cascade Filter Data
export const fetchCascadeData = createAsyncThunk(
  "dashboard/fetchCascadeData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/cascade-data");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load cascade filter data.";
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Add State
export const addState = createAsyncThunk(
  "dashboard/addState",
  async (stateData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/dashboard/states", {
        name: stateData.name.trim(),
        vendorCount: Number(stateData.vendorCount) || 0
      });
      // Refresh cascade filter data from server
      dispatch(fetchCascadeData());
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add state.";
      return rejectWithValue(message);
    }
  }
);

// 4. Async Thunk: Add Category
export const addCategory = createAsyncThunk(
  "dashboard/addCategory",
  async (categoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/dashboard/categories", {
        name: categoryData.name.trim(),
        vendorCount: Number(categoryData.vendorCount) || 0
      });
      // Refresh cascade filter data from server
      dispatch(fetchCascadeData());
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add category.";
      return rejectWithValue(message);
    }
  }
);

// 5. Async Thunk: Add Subcategory
export const addSubcategory = createAsyncThunk(
  "dashboard/addSubcategory",
  async (subcategoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/dashboard/subcategories", {
        name: subcategoryData.name.trim(),
        parentCategory: subcategoryData.parentCategory,
        vendorCount: Number(subcategoryData.vendorCount) || 0
      });
      // Refresh cascade filter data from server
      dispatch(fetchCascadeData());
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add subcategory.";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  stats: {
    totalProducts: 0,
    activeProducts: 0,
    ordersToday: 0,
    pendingQueries: 0,
    vendorActivity: 0,
    onlineUsers: 0,
    pendingVendorPayment:  {
      count: 0,
      totalAmount: 0
    }
  },
  states: [],
  categories: [],
  subcategories: [],

  statsLoading: false,
  cascadeLoading: false,
  saving: false,

  error: null,
  statsError: null,
  cascadeError: null,
  saveError: null
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
      state.statsError = null;
      state.cascadeError = null;
      state.saveError = null;
    }
  },
  extraReducers: (builder) => {
    // fetchDashboardStats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = {
          ...state.stats,
          ...action.payload
        };
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || "Failed to load dashboard stats.";
      });

    // fetchCascadeData
    builder
      .addCase(fetchCascadeData.pending, (state) => {
        state.cascadeLoading = true;
        state.cascadeError = null;
      })
      .addCase(fetchCascadeData.fulfilled, (state, action) => {
        state.cascadeLoading = false;
        state.states = Array.isArray(action.payload?.states) ? action.payload.states : [];
        state.categories = Array.isArray(action.payload?.categories) ? action.payload.categories : [];
        state.subcategories = Array.isArray(action.payload?.subcategories) ? action.payload.subcategories : [];
        state.cascadeError = null;
      })
      .addCase(fetchCascadeData.rejected, (state, action) => {
        state.cascadeLoading = false;
        state.cascadeError = action.payload || "Failed to load cascade filter data.";
      });

    // addState
    builder
      .addCase(addState.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(addState.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && !state.states.some((s) => s._id === action.payload._id || s.name === action.payload.name)) {
          state.states.push(action.payload);
        }
        state.saveError = null;
      })
      .addCase(addState.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to add state.";
      });

    // addCategory
    builder
      .addCase(addCategory.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && !state.categories.some((c) => c._id === action.payload._id || c.name === action.payload.name)) {
          state.categories.push(action.payload);
        }
        state.saveError = null;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to add category.";
      });

    // addSubcategory
    builder
      .addCase(addSubcategory.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(addSubcategory.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && !state.subcategories.some((sub) => sub._id === action.payload._id || sub.name === action.payload.name)) {
          state.subcategories.push(action.payload);
        }
        state.saveError = null;
      })
      .addCase(addSubcategory.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to add subcategory.";
      });
  }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

