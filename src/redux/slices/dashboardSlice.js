import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getDashboardApiUrl } from '../../services/api';
import { toast } from 'react-toastify';

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchDashboardOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/dashboard/overview');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard data. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const addDashboardState = createAsyncThunk(
  'dashboard/addDashboardState',
  async ({ name, vendorCount }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/superadmin/dashboard/states', { name, vendorCount });
      toast.success('State added successfully!');
      dispatch(fetchDashboardOverview());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add state.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addDashboardCategory = createAsyncThunk(
  'dashboard/addDashboardCategory',
  async ({ name, projectId, projectName }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(getDashboardApiUrl('/dashboard/categories'), {
        name,
        projectId,
        projectName,
      });
      toast.success('Category added successfully!');
      dispatch(fetchDashboardOverview());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add category.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addDashboardSubcategory = createAsyncThunk(
  'dashboard/addDashboardSubcategory',
  async ({ parentCategory, subcategories, projectId, projectName }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(getDashboardApiUrl('/dashboard/subcategories'), {
        parentCategory,
        subcategories,
        projectId,
        projectName,
      });
      toast.success('Subcategory added successfully!');
      dispatch(fetchDashboardOverview());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add subcategory.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  stats: null,
  cascadeData: null,
  loading: false,
  error: null,
  addStateLoading: false,
  addCategoryLoading: false,
  addSubcategoryLoading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.cascadeData = action.payload.cascadeData;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add State
      .addCase(addDashboardState.pending, (state) => {
        state.addStateLoading = true;
      })
      .addCase(addDashboardState.fulfilled, (state) => {
        state.addStateLoading = false;
      })
      .addCase(addDashboardState.rejected, (state) => {
        state.addStateLoading = false;
      })
      // Add Category
      .addCase(addDashboardCategory.pending, (state) => {
        state.addCategoryLoading = true;
      })
      .addCase(addDashboardCategory.fulfilled, (state) => {
        state.addCategoryLoading = false;
      })
      .addCase(addDashboardCategory.rejected, (state) => {
        state.addCategoryLoading = false;
      })
      // Add Subcategory
      .addCase(addDashboardSubcategory.pending, (state) => {
        state.addSubcategoryLoading = true;
      })
      .addCase(addDashboardSubcategory.fulfilled, (state) => {
        state.addSubcategoryLoading = false;
      })
      .addCase(addDashboardSubcategory.rejected, (state) => {
        state.addSubcategoryLoading = false;
      });
  },
});

export default dashboardSlice.reducer;
