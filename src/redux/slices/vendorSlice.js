import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// 19. Search / List Vendors API
export const fetchVendors = createAsyncThunk(
  'vendor/fetchVendors',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (queryParams.search) params.search = queryParams.search;
      if (queryParams.state && queryParams.state !== 'All') params.state = queryParams.state;
      if (queryParams.city && queryParams.city !== 'All') params.city = queryParams.city;
      if (queryParams.page) params.page = queryParams.page;
      if (queryParams.limit) params.limit = queryParams.limit || 10;

      const response = await api.get('/superadmin/vendors/search', { params });
      return response.data;
    } catch (error) {
      // Fallback to legacy get route if search route fails
      try {
        const fallbackRes = await api.get('/superadmin/vendors');
        return fallbackRes.data;
      } catch (e) {
        const message = error.response?.data?.message || 'Failed to fetch vendors list.';
        return rejectWithValue(message);
      }
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

// 17. Create Vendor API
export const createVendor = createAsyncThunk(
  'vendor/createVendor',
  async (vendorData, { dispatch, rejectWithValue }) => {
    try {
      const formattedData = {
        vendorName: vendorData.vendorName || vendorData.name,
        ownerName: vendorData.ownerName || '',
        category: vendorData.category || '',
        contactNo: vendorData.contactNo || vendorData.mobile || '',
        email: vendorData.email || '',
        state: vendorData.state || '',
        city: vendorData.city || '',
        pincode: vendorData.pincode || '',
        completeAddress: vendorData.completeAddress || vendorData.address || '',
        gstin: vendorData.gstin || vendorData.gstNo || ''
      };

      const response = await api.post('/superadmin/vendors', formattedData);
      toast.success(response.data.message || 'Vendor created successfully and is pending approval.');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create vendor.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 18. Activate Vendor API
export const activateVendor = createAsyncThunk(
  'vendor/activateVendor',
  async (vendorId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/superadmin/vendors/${vendorId}/activate`);
      const emailSent = response.data.data?.emailSent;
      if (emailSent === true) {
        toast.success('Vendor activated and credentials sent successfully.');
      } else {
        toast.success(response.data.message || 'Vendor activated successfully.');
      }
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to activate vendor.';
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
      // toast.success(response.data.message || 'Vendor updated successfully');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update vendor.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkUpdateVendorStatuses = createAsyncThunk(
  'vendor/bulkUpdateStatuses',
  async (vendors, { rejectWithValue }) => {
    try {
      const response = await api.patch('/superadmin/vendors/bulk-status', { vendors });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update selected vendor statuses.';
      return rejectWithValue(message);
    }
  }
);

export const bulkDeleteVendors = createAsyncThunk(
  'vendor/bulkDelete',
  async (vendorIds, { rejectWithValue }) => {
    try {
      const response = await api.patch('/superadmin/vendors/bulk-delete', { vendorIds });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete selected vendors.';
      return rejectWithValue(message);
    }
  }
);

export const changeVendorPassword = createAsyncThunk(
  'vendor/changeVendorPassword',
  async ({ vendorId, password, newPassword, notifyVendor }, { dispatch, rejectWithValue }) => {
    const pwdToSet = newPassword || password;
    try {
      let response;
      try {
        response = await api.patch(`/superadmin/vendors/${vendorId}/password`, { newPassword: pwdToSet });
      } catch (err) {
        try {
          response = await api.patch(`/superadmin/vendors/${vendorId}/change-password`, { password: pwdToSet, newPassword: pwdToSet, notifyVendor });
        } catch (err2) {
          response = await api.patch(`/superadmin/vendors/${vendorId}`, { password: pwdToSet, newPassword: pwdToSet, notifyVendor });
        }
      }
      toast.success(response.data?.message || 'Vendor password changed successfully');
      dispatch(fetchVendors());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change vendor password.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendor/deleteVendor',
  async (vendorIdParam, { dispatch, rejectWithValue }) => {
    const vCode = typeof vendorIdParam === 'object'
      ? (vendorIdParam.vendorCode || vendorIdParam.vendorId || (typeof vendorIdParam.primaryId === 'string' && vendorIdParam.primaryId.startsWith('VEN') ? vendorIdParam.primaryId : null))
      : vendorIdParam;
    const mongoId = typeof vendorIdParam === 'object'
      ? (vendorIdParam._id || vendorIdParam.id || vendorIdParam.secondaryId || vendorIdParam.primaryId)
      : null;

    const idsToTry = Array.from(new Set([vCode, mongoId].filter(Boolean)));

    const attempts = [];
    for (const id of idsToTry) {
      attempts.push(() => api.delete(`/superadmin/vendors/${id}`));
      attempts.push(() => api.delete(`/superadmin/vendor/${id}`));
      attempts.push(() => api.delete(`/vendors/${id}`));
      attempts.push(() => api.delete(`/superadmin/vendors/delete/${id}`));
      attempts.push(() => api.post(`/superadmin/vendors/${id}/delete`));
    }

    let lastError = null;
    for (const makeAttempt of attempts) {
      try {
        const response = await makeAttempt();
        if (response.status >= 200 && response.status < 300) {
          toast.success(response.data?.message || 'Vendor deleted successfully');
          dispatch(fetchVendors());
          return response.data;
        }
      } catch (err) {
        lastError = err;
      }
    }

    const message = lastError?.response?.data?.message || 'Failed to delete vendor.';
    toast.error(message);
    return rejectWithValue(message);
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

// 20. Get Vendor Form Fields API
export const fetchVendorFormFields = createAsyncThunk(
  'vendor/fetchVendorFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/vendors/form-fields');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch vendor form fields.';
      return rejectWithValue(message);
    }
  }
);

// 21. Create Vendor Form Field API
export const createVendorFormField = createAsyncThunk(
  'vendor/createVendorFormField',
  async (fieldData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/superadmin/vendors/form-fields', fieldData);
      toast.success(response.data.message || 'Vendor form field created successfully.');
      dispatch(fetchVendorFormFields());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create vendor form field.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 22. Update Vendor Form Field API
export const updateVendorFormField = createAsyncThunk(
  'vendor/updateVendorFormField',
  async ({ fieldId, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/superadmin/vendors/form-fields/${fieldId}`, updateData);
      toast.success(response.data.message || 'Vendor form field updated successfully.');
      dispatch(fetchVendorFormFields());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update vendor form field.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 23. Delete Vendor Form Field API
export const deleteVendorFormField = createAsyncThunk(
  'vendor/deleteVendorFormField',
  async (fieldId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/superadmin/vendors/form-fields/${fieldId}`);
      toast.success(response.data.message || 'Vendor form field removed successfully.');
      dispatch(fetchVendorFormFields());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete vendor form field.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  vendors: [],
  deletedVendorIds: [],
  formFields: [],
  totalVendors: 0,
  totalPages: 1,
  currentPage: 1,
  selectedVendor: null,
  loading: false,
  formFieldsLoading: false,
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
      // Fetch Vendors (19)
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        const raw = action.payload.data || action.payload.vendors || (Array.isArray(action.payload) ? action.payload : []);
        state.vendors = Array.isArray(raw) ? raw.filter((v) =>
          !v.isDeleted &&
          v.status !== 'Deleted' &&
          !state.deletedVendorIds.includes(v._id) &&
          !state.deletedVendorIds.includes(v.vendorId) &&
          !state.deletedVendorIds.includes(v.vendorCode) &&
          !state.deletedVendorIds.includes(v.id)
        ) : [];
        const pag = action.payload.pagination;
        state.totalVendors = pag?.total || action.payload.totalVendors || state.vendors.length;
        state.totalPages = pag?.totalPages || action.payload.totalPages || 1;
        state.currentPage = pag?.page || action.payload.currentPage || 1;
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
        state.selectedVendor = action.payload?.data || action.payload || null;
      })
      .addCase(fetchVendorDetail.rejected, (state) => {
        state.detailLoading = false;
      })
      // Create Vendor (17)
      .addCase(createVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createVendor.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(createVendor.rejected, (state) => {
        state.isSaving = false;
      })
      // Activate Vendor (18)
      .addCase(activateVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(activateVendor.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(activateVendor.rejected, (state) => {
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
      // Change Vendor Password
      .addCase(changeVendorPassword.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(changeVendorPassword.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(changeVendorPassword.rejected, (state) => {
        state.isSaving = false;
      })
      // Delete Vendor
      .addCase(deleteVendor.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.isSaving = false;
        const resData = action.payload?.data;
        const arg = action.meta.arg;
        const primaryId = typeof arg === 'object' ? (arg.primaryId || arg.vendorId) : arg;
        const secondaryId = typeof arg === 'object' ? arg.secondaryId : null;
        const deletedVendorId = resData?.vendorId || action.payload?.vendorId;

        const idsToRemove = [primaryId, secondaryId, deletedVendorId].filter(Boolean);
        state.deletedVendorIds = Array.from(new Set([...state.deletedVendorIds, ...idsToRemove]));

        if (state.vendors && Array.isArray(state.vendors)) {
          state.vendors = state.vendors.filter((v) => {
            if (idsToRemove.some((id) => v.vendorId === id || v.vendorCode === id || v._id === id || v.id === id)) {
              return false;
            }
            return true;
          });
        }
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
      })
      // Fetch Form Fields (20)
      .addCase(fetchVendorFormFields.pending, (state) => {
        state.formFieldsLoading = true;
      })
      .addCase(fetchVendorFormFields.fulfilled, (state, action) => {
        state.formFieldsLoading = false;
        state.formFields = action.payload.data || action.payload || [];
      })
      .addCase(fetchVendorFormFields.rejected, (state) => {
        state.formFieldsLoading = false;
      });
  },
});

export const { clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
