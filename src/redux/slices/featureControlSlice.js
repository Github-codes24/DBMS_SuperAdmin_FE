import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchAdminUsers = createAsyncThunk(
  'featureControl/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/feature-control/admin-users');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch admin users.';
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminFeatures = createAsyncThunk(
  'featureControl/fetchAdminFeatures',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/feature-control/admin-users/${userId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch admin features.';
      return rejectWithValue(message);
    }
  }
);

export const updateAdminFeatures = createAsyncThunk(
  'featureControl/updateAdminFeatures',
  async ({ userId, features }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/feature-control/admin-users/${userId}`, features);
      toast.success(response.data.message || 'Feature settings updated successfully');
      dispatch(fetchAdminUsers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update feature settings.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  adminUsers: [],
  selectedAdminFeatures: {
    customerManagement: false,
    vendorManagement: false,
    reports: false,
    exportData: false,
    bulkUpload: false,
    telecallerAssignment: false,
  },
  loading: false,
  selectedLoading: false,
  isSaving: false,
  error: null,
};

const featureControlSlice = createSlice({
  name: 'featureControl',
  initialState,
  reducers: {
    toggleLocalFeature: (state, action) => {
      const featureKey = action.payload;
      if (state.selectedAdminFeatures && featureKey in state.selectedAdminFeatures) {
        state.selectedAdminFeatures[featureKey] = !state.selectedAdminFeatures[featureKey];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = action.payload || [];
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Admin Features
      .addCase(fetchAdminFeatures.pending, (state) => {
        state.selectedLoading = true;
      })
      .addCase(fetchAdminFeatures.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedAdminFeatures = action.payload.features || {
          customerManagement: false,
          vendorManagement: false,
          reports: false,
          exportData: false,
          bulkUpload: false,
          telecallerAssignment: false,
        };
      })
      .addCase(fetchAdminFeatures.rejected, (state) => {
        state.selectedLoading = false;
      })
      // Update Admin Features
      .addCase(updateAdminFeatures.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateAdminFeatures.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedAdminFeatures = action.payload.features;
      })
      .addCase(updateAdminFeatures.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export const { toggleLocalFeature } = featureControlSlice.actions;
export default featureControlSlice.reducer;
