import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const lookupVendors = createAsyncThunk(
  'dataManagement/lookupVendors',
  async ({ search, state, city }, { rejectWithValue }) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (state && state !== 'All') params.state = state;
      if (city && city !== 'All') params.city = city;

      const response = await api.get('/superadmin/data-management/vendors', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search vendor directory.';
      return rejectWithValue(message);
    }
  }
);

export const lookupVendorDetail = createAsyncThunk(
  'dataManagement/lookupVendorDetail',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/superadmin/data-management/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch vendor details.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  vendors: [],
  totalVendors: 0,
  availableStates: [],
  availableCities: [],
  selectedVendor: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const dataManagementSlice = createSlice({
  name: 'dataManagement',
  initialState,
  reducers: {
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Lookup Vendors
      .addCase(lookupVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lookupVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.vendors || [];
        state.totalVendors = action.payload.totalVendors || 0;
        state.availableStates = action.payload.availableStates || [];
        state.availableCities = action.payload.availableCities || [];
      })
      .addCase(lookupVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Lookup Vendor Detail
      .addCase(lookupVendorDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(lookupVendorDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        const v = action.payload;
        if (v) {
          state.selectedVendor = {
            id: v.vendorCode || v.rawVendor?.vendorId || '',
            transNo: v.transNo || v.rawVendor?.transNo || '',
            name: v.businessAndOwnerProfile?.shopName || v.rawVendor?.vendorName || '',
            ownerName: v.businessAndOwnerProfile?.ownerName || v.rawVendor?.ownerName || '',
            category: v.businessAndOwnerProfile?.category || v.rawVendor?.category || '',
            contactNo: v.contactAndCommunication?.contactNo || v.rawVendor?.contactNo || '',
            email: v.contactAndCommunication?.email || v.rawVendor?.email || '',
            gstNo: v.businessAndOwnerProfile?.gstin || v.rawVendor?.gstin || '',
            address: v.locationAndAddressDetails?.completeAddress || v.rawVendor?.completeAddress || '',
            pincode: v.locationAndAddressDetails?.pincode || v.rawVendor?.pincode || '',
            city: v.locationAndAddressDetails?.city || v.rawVendor?.city || '',
            state: v.locationAndAddressDetails?.state || v.rawVendor?.state || '',
            verificationDateTime: v.systemMetricsAndMappings?.verificationDateTime || (v.rawVendor?.verificationDateTime ? new Date(v.rawVendor.verificationDateTime).toLocaleString() : ''),
            status: v.status || v.rawVendor?.status || 'Active',
            mappedCustomers: v.systemMetricsAndMappings?.mappedCustomersCount || v.rawVendor?.mappedCustomers || 0,
          };
        }
      })
      .addCase(lookupVendorDetail.rejected, (state) => {
        state.detailLoading = false;
      });
  },
});

export const { clearSelectedVendor } = dataManagementSlice.actions;
export default dataManagementSlice.reducer;
