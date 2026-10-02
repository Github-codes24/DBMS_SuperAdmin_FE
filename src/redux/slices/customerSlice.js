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
      const formattedData = {
        name: customerData.name || customerData.customerName || customerData.companyName || customerData.ownerName || 'Customer',
        companyName: customerData.companyName || customerData.name || customerData.customerName || 'Customer Firm',
        ownerName: customerData.ownerName || '',
        category: customerData.category || customerData.serviceCategory || '',
        subCategory: customerData.subCategory || customerData.serviceSubcategory || '',
        contactNo: customerData.contactNo || customerData.mobile || customerData.phone || '',
        mobile: customerData.mobile || customerData.contactNo || customerData.phone || '',
        email: customerData.email || '',
        state: customerData.state || '',
        city: customerData.city || '',
        pincode: customerData.pincode || '',
        completeAddress: customerData.completeAddress || customerData.address || '',
        gstin: customerData.gstin || customerData.gstNo || ''
      };
      const response = await api.post('/superadmin/customers', formattedData);
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
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update customer.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async (customerIdParam, { dispatch, rejectWithValue }) => {
    const primaryId = typeof customerIdParam === 'object' ? (customerIdParam.primaryId || customerIdParam.customerId) : customerIdParam;
    const secondaryId = typeof customerIdParam === 'object' ? customerIdParam.secondaryId : null;

    const idsToTry = Array.from(new Set([primaryId, secondaryId].filter(Boolean)));
    const attempts = [];
    for (const id of idsToTry) {
      attempts.push(() => api.delete(`/superadmin/customers/${id}`));
      attempts.push(() => api.patch(`/superadmin/customers/${id}`, { status: 'Deleted', isDeleted: true }));
      attempts.push(() => api.delete(`/superadmin/customer/${id}`));
      attempts.push(() => api.delete(`/customers/${id}`));
      attempts.push(() => api.delete(`/superadmin/customers/delete/${id}`));
      attempts.push(() => api.patch(`/superadmin/customers/${id}/delete`));
      attempts.push(() => api.post(`/superadmin/customers/${id}/delete`));
    }

    let lastError = null;
    for (const makeAttempt of attempts) {
      try {
        const response = await makeAttempt();
        if (response.status >= 200 && response.status < 300) {
          toast.success(response.data?.message || 'Customer deleted successfully');
          dispatch(fetchCustomers());
          return response.data;
        }
      } catch (err) {
        lastError = err;
        if (err.response && err.response.status !== 404) {
          const msg = err.response?.data?.message || 'Failed to delete customer.';
          toast.error(msg);
          return rejectWithValue(msg);
        }
      }
    }

    const message = lastError?.response?.data?.message || 'Failed to delete customer.';
    toast.error(message);
    return rejectWithValue(message);
  }
);

export const bulkImportCustomers = createAsyncThunk(
  'customer/bulkImportCustomers',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const file = payload instanceof File ? payload : payload?.file || payload;
      const formData = new FormData();
      formData.append('file', file);

      if (payload && !(payload instanceof File)) {
        if (payload.category) {
          formData.append('category', payload.category);
          formData.append('serviceCategory', payload.category);
        }
        if (payload.subCategory) {
          formData.append('subCategory', payload.subCategory);
          formData.append('serviceSubcategories', payload.subCategory);
        }
        if (payload.state) formData.append('state', payload.state);
        if (payload.city) formData.append('city', payload.city);
      }

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
        const fetched = action.payload?.customers || action.payload?.data || (Array.isArray(action.payload) ? action.payload : []);

        const validFetched = fetched.filter((f) => !f.isDeleted && f.status !== 'Deleted');

        const mergedFetched = validFetched.map((f) => {
          const match = state.customers.find(
            (c) =>
              (c._id && c._id === f._id) ||
              (c.customerId && c.customerId === f.customerId) ||
              (c.companyName && f.companyName && c.companyName.toLowerCase() === f.companyName.toLowerCase())
          );
          if (match) {
            const existingNum = match.mobileNumber || match.mobile || match.phone || match.number;
            const validNum = String(existingNum || '').replace(/\D/g, '').length >= 7 ? String(existingNum).trim() : null;
            if (validNum && (!f.mobile || f.mobile === '-' || String(f.mobile).replace(/\D/g, '').length < 7)) {
              return {
                ...f,
                mobile: validNum,
                mobileNumber: validNum,
                phone: validNum,
                contact: validNum,
                number: validNum,
              };
            }
          }
          return f;
        });

        const localCreated = state.customers.filter(
          (c) => !c.isDeleted && c.status !== 'Deleted' && (c._isLocal || ((c.mobile || c.mobileNumber) && !mergedFetched.some((f) => f._id === c._id || f.customerId === c.customerId)))
        );
        state.customers = [...localCreated, ...mergedFetched];
        state.totalCustomers = action.payload?.totalCustomers || state.customers.length;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.currentPage || 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isSaving = false;
        const newCust = action.payload?.customer || action.payload?.data || action.meta?.arg;
        if (newCust) {
          const exists = state.customers.some((c) => (c._id && c._id === newCust._id) || (c.customerId && c.customerId === newCust.customerId));
          if (!exists) {
            state.customers = [newCust, ...state.customers];
          }
        }
      })
      .addCase(createCustomer.rejected, (state) => {
        state.isSaving = false;
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isSaving = false;
        const arg = action.meta?.arg;
        const targetId = arg?.customerId;
        const updateData = arg?.updateData || {};
        const apiCustomer = action.payload?.customer || action.payload?.data || {};

        state.customers = state.customers.map((c) => {
          const isMatch =
            (targetId && (c._id === targetId || c.customerId === targetId || c.id === targetId)) ||
            (updateData.companyName && c.companyName && c.companyName.trim().toLowerCase() === updateData.companyName.trim().toLowerCase()) ||
            (updateData.name && c.name && c.name.trim().toLowerCase() === updateData.name.trim().toLowerCase());

          if (isMatch) {
            const newMobile = updateData.mobile || updateData.mobileNumber || apiCustomer.mobile || apiCustomer.mobileNumber || c.mobile;
            return {
              ...c,
              ...apiCustomer,
              ...updateData,
              mobile: newMobile,
              mobileNumber: newMobile,
              phone: newMobile,
              contact: newMobile,
              number: newMobile,
              _isLocalUpdated: true,
            };
          }
          return c;
        });
      })
      .addCase(updateCustomer.rejected, (state) => {
        state.isSaving = false;
      })
      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isSaving = false;
        const resData = action.payload?.data;
        const arg = action.meta.arg;
        const primaryId = typeof arg === 'object' ? (arg.primaryId || arg.customerId) : arg;
        const secondaryId = typeof arg === 'object' ? arg.secondaryId : null;
        const deletedCustomerId = resData?.customerId;

        if (state.customers && Array.isArray(state.customers)) {
          state.customers = state.customers.filter((c) => {
            if (deletedCustomerId && (c.customerId === deletedCustomerId || c._id === deletedCustomerId || c.id === deletedCustomerId)) {
              return false;
            }
            if (primaryId && (c._id === primaryId || c.customerId === primaryId || c.id === primaryId)) {
              return false;
            }
            if (secondaryId && (c._id === secondaryId || c.customerId === secondaryId || c.id === secondaryId)) {
              return false;
            }
            return true;
          });
        }
      })
      .addCase(deleteCustomer.rejected, (state) => {
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
