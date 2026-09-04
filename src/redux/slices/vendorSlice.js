import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchVendors = createAsyncThunk(
  'vendor/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/vendors');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch vendors list.';
      return rejectWithValue(message);
    }
  }
);

export const fetchVendorDetail = createAsyncThunk(
  'vendor/fetchVendorDetail',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/superadmin/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch vendor details.';
      return rejectWithValue(message);
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendor/createVendor',
  async (vendorData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/superadmin/vendors/', vendorData);
      const emailSent = response.data.data?.emailSent;
      if (emailSent === true) {
        toast.success('Vendor created successfully. Login credentials have been sent to the registered email address.');
      } else if (emailSent === false) {
        toast.warning('Vendor created successfully, but the credentials email could not be sent.');
      } else {
        toast.success(response.data.message || 'Vendor created successfully');
      }
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create vendor.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendor/updateVendor',
  async ({ vendorId, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/superadmin/vendors/${vendorId}`, updateData);
      toast.success(response.data.message || 'Vendor updated successfully');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update vendor.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendor/deleteVendor',
  async (vendorId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/superadmin/vendors/${vendorId}`);
      toast.success(response.data?.message || 'Vendor deleted successfully');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete vendor.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkImportVendors = createAsyncThunk(
  'vendor/bulkImportVendors',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/superadmin/vendors/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Import completed successfully');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to import vendor records.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  vendors: [],
  totalVendors: 0,
  totalPages: 1,
  currentPage: 1,
  selectedVendor: null,
  loading: false,
  detailLoading: false,
  isSaving: false,
  error: null,
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.vendors || [];
        state.totalVendors = action.payload.totalVendors || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor Detail
      .addCase(fetchVendorDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchVendorDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedVendor = action.payload || null;
      })
      .addCase(fetchVendorDetail.rejected, (state) => {
        state.detailLoading = false;
      })
      // Create Vendor
      .addCase(createVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createVendor.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(createVendor.rejected, (state) => {
        state.isSaving = false;
      })
      // Update Vendor
      .addCase(updateVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateVendor.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(updateVendor.rejected, (state) => {
        state.isSaving = false;
      })
      // Delete Vendor
      .addCase(deleteVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(deleteVendor.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(deleteVendor.rejected, (state) => {
        state.isSaving = false;
      })
      // Bulk Import
      .addCase(bulkImportVendors.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkImportVendors.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkImportVendors.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
