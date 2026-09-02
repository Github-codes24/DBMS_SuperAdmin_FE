import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Customers List (API 20)
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, search = '' } = filterParams;
      const params = {};

      if (page) params.page = page;
      if (search && search.trim()) params.search = search.trim();

      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch customers list.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Update Customer Details (API 21)
export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ customerId, name, mobile, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/customers/${customerId}`, {
        name,
        mobile,
        status
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update customer details.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Export Customers CSV (API 22)
export const exportCustomersCsv = createAsyncThunk(
  'customers/exportCustomersCsv',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customers/export-csv', {
        responseType: 'blob'
      });

      let filename = `lts_vendor_customers_${new Date().toISOString().slice(0, 10)}.csv`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return { filename };
    } catch (error) {
      let message = 'Failed to export customers CSV.';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) message = json.message;
        } catch (_) {}
      } else {
        message = error.response?.data?.message || error.message || message;
      }
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  customers: [],
  pagination: {
    page: 1,
    pages: 1,
    totalCustomers: 0
  },
  loading: false,
  updateLoading: false,
  exportLoading: false,
  error: null
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomersError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchCustomers (API 20)
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = Array.isArray(action.payload?.customers) ? action.payload.customers : [];
        state.pagination = {
          page: Number(action.payload?.page) || 1,
          pages: Number(action.payload?.pages) || 1,
          totalCustomers: Number(action.payload?.totalCustomers) || 0
        };
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch customers';
      });

    // 2. updateCustomer (API 21)
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedCustomer = action.payload;
        if (updatedCustomer && (updatedCustomer.customerId || updatedCustomer._id)) {
          const index = state.customers.findIndex(
            (c) =>
              (updatedCustomer.customerId && c.customerId === updatedCustomer.customerId) ||
              (updatedCustomer._id && c._id === updatedCustomer._id)
          );
          if (index !== -1) {
            state.customers[index] = { ...state.customers[index], ...updatedCustomer };
          }
        }
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || 'Failed to update customer';
      });

    // 3. exportCustomersCsv (API 22)
    builder
      .addCase(exportCustomersCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportCustomersCsv.fulfilled, (state) => {
        state.exportLoading = false;
        state.error = null;
      })
      .addCase(exportCustomersCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload || 'Failed to export customers CSV';
      });
  }
});

export const { clearCustomersError } = customersSlice.actions;
export default customersSlice.reducer;
