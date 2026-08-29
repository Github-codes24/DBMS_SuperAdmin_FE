import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/customers');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch customer directory.';
      return rejectWithValue(message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (customerData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/superadmin/customers', customerData);
      toast.success(response.data.message || 'Customer created successfully');
      dispatch(fetchCustomers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create customer.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ customerId, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/superadmin/customers/${customerId}`, updateData);
      toast.success(response.data.message || 'Customer updated successfully');
      dispatch(fetchCustomers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update customer.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkImportCustomers = createAsyncThunk(
  'customer/bulkImportCustomers',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/superadmin/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Import completed successfully');
      dispatch(fetchCustomers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to import customer records.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  customers: [],
  totalCustomers: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  isSaving: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers || [];
        state.totalCustomers = action.payload.totalCustomers || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(createCustomer.rejected, (state) => {
        state.isSaving = false;
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(updateCustomer.rejected, (state) => {
        state.isSaving = false;
      })
      // Bulk Import
      .addCase(bulkImportCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkImportCustomers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkImportCustomers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default customerSlice.reducer;
