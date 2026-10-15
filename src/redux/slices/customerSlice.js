import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/customers', {
        params: { _t: Date.now() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
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
      const mobileVal =
        customerData.mobile ||
        customerData.mobileNumber ||
        customerData.contactNo ||
        customerData.phone ||
        customerData.phoneNumber ||
        customerData.mobileNo ||
        customerData.mobile_number ||
        customerData.contactNumber ||
        customerData.contact ||
        customerData.number ||
        '';

      const emailVal =
        customerData.email ||
        customerData.emailAddress ||
        customerData.emailId ||
        customerData.email_id ||
        customerData.mail ||
        customerData.userEmail ||
        '';

      const nameVal =
        (customerData.name && customerData.name.trim()) ||
        (customerData.companyName && customerData.companyName.trim()) ||
        (customerData.customerName && customerData.customerName.trim()) ||
        (customerData.ownerName && customerData.ownerName.trim()) ||
        'Customer';

      const companyVal =
        (customerData.companyName && customerData.companyName.trim()) ||
        (customerData.name && customerData.name.trim()) ||
        'Customer Firm';

      const formattedData = {
        ...customerData,
        name: nameVal,
        companyName: companyVal,
        customerName: nameVal,
        ownerName: customerData.ownerName || nameVal,
        category: customerData.category || customerData.serviceCategory || 'General',
        subCategory: customerData.subCategory || customerData.serviceSubcategory || 'General',
        contactNo: mobileVal,
        mobile: mobileVal,
        mobileNumber: mobileVal,
        mobileNo: mobileVal,
        phone: mobileVal,
        phoneNumber: mobileVal,
        phoneNo: mobileVal,
        contact: mobileVal,
        number: mobileVal,
        email: emailVal,
        emailAddress: emailVal,
        emailId: emailVal,
        mail: emailVal,
        state: customerData.state || '',
        city: customerData.city || '',
        pincode: customerData.pincode || '',
        regDate: customerData.regDate || customerData.registrationDate || new Date().toISOString().slice(0, 10),
        registrationDate: customerData.registrationDate || customerData.regDate || new Date().toISOString().slice(0, 10),
        status: customerData.status || 'Active',
        assignedTelecaller: customerData.assignedTelecaller || customerData.telecaller || '',
        telecaller: customerData.telecaller || customerData.assignedTelecaller || '',
        completeAddress: customerData.completeAddress || customerData.address || '',
        gstin: customerData.gstin || customerData.gstNo || ''
      };
      const response = await api.post('/superadmin/customers', formattedData);
      toast.success(response.data.message || 'Customer created successfully');
      dispatch(fetchCustomers());
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to create customer.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ customerId, updateData, skipRefresh = false, suppressToast = false }, { dispatch, rejectWithValue }) => {
    try {
      const mobileVal =
        updateData.mobile ||
        updateData.mobileNumber ||
        updateData.contactNo ||
        updateData.phone ||
        updateData.phoneNumber ||
        updateData.mobileNo ||
        updateData.mobile_number ||
        updateData.contactNumber ||
        updateData.contact ||
        updateData.number ||
        '';

      const emailVal =
        updateData.email ||
        updateData.emailAddress ||
        updateData.emailId ||
        updateData.email_id ||
        updateData.mail ||
        updateData.userEmail ||
        '';

      const updatePayload = {
        ...updateData,
        ...(mobileVal
          ? {
              mobile: mobileVal,
              mobileNumber: mobileVal,
              mobileNo: mobileVal,
              contactNo: mobileVal,
              phone: mobileVal,
              phoneNumber: mobileVal,
              contact: mobileVal,
              number: mobileVal,
            }
          : {}),
        ...(emailVal
          ? {
              email: emailVal,
              emailAddress: emailVal,
              emailId: emailVal,
              mail: emailVal,
            }
          : {}),
      };

      const response = await api.patch(`/superadmin/customers/${customerId}`, updatePayload);
      if (!suppressToast) {
        // toast.success(response.data.message || 'Customer updated successfully');
      }
      if (!skipRefresh) {
        dispatch(fetchCustomers());
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update customer.';
      if (!suppressToast) {
        toast.error(message);
      }
      return rejectWithValue(message);
    }
  }
);

export const bulkUpdateCustomers = createAsyncThunk(
  'customer/bulkUpdateCustomers',
  async (customers, { rejectWithValue }) => {
    try {
      const response = await api.patch('/superadmin/customers/bulk', { customers });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update selected customers.';
      return rejectWithValue(message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async (customerIdParam, { dispatch, rejectWithValue }) => {
    const options = typeof customerIdParam === 'object' ? customerIdParam : {};
    const custId = typeof customerIdParam === 'object'
      ? (customerIdParam.customerId || customerIdParam.customerCode || (typeof customerIdParam.primaryId === 'string' && customerIdParam.primaryId.startsWith('CUST') ? customerIdParam.primaryId : null))
      : customerIdParam;
    const mongoId = typeof customerIdParam === 'object'
      ? (customerIdParam._id || customerIdParam.id || customerIdParam.secondaryId || customerIdParam.primaryId)
      : null;

    const idsToTry = Array.from(new Set([custId, mongoId].filter(Boolean)));
    const attempts = [];
    for (const id of idsToTry) {
      attempts.push(() => api.delete(`/superadmin/customers/${id}`));
      attempts.push(() => api.delete(`/superadmin/customer/${id}`));
      attempts.push(() => api.delete(`/customers/${id}`));
      attempts.push(() => api.delete(`/superadmin/customers/delete/${id}`));
      attempts.push(() => api.post(`/superadmin/customers/${id}/delete`));
    }

    let lastError = null;
    for (const makeAttempt of attempts) {
      try {
        const response = await makeAttempt();
        if (response.status >= 200 && response.status < 300) {
          if (!options.suppressToast) {
            toast.success(response.data?.message || 'Customer deleted successfully');
          }
          if (!options.skipRefresh) {
            dispatch(fetchCustomers());
          }
          return response.data;
        }
      } catch (err) {
        lastError = err;
      }
    }

    const message = lastError?.response?.data?.message || 'Failed to delete customer.';
    if (!options.suppressToast) {
      toast.error(message);
    }
    return rejectWithValue(message);
  }
);

export const bulkImportCustomers = createAsyncThunk(
  'customer/bulkImportCustomers',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const file = payload instanceof File ? payload : payload?.file || payload;
      if (!(file instanceof File)) {
        throw new Error('Select a CSV or Excel file before importing..');
      }

      const formData = new FormData();
      formData.append('file', file);

      if (payload && !(payload instanceof File)) {
        if (payload.projectName) 
        {
          formData.append('projectName', payload.projectName);
        }
        if (payload.projectId) {
          formData.append('projectId', payload.projectId);
        }
        if (payload.category) {
          formData.append('category', payload.category);
        }
        if (payload.categoryId) {
          formData.append('categoryId', payload.categoryId);
        }
        if (payload.subCategory) {
          formData.append('subCategory', payload.subCategory);
        }
        if (payload.subCategoryId) {
          formData.append('subCategoryId', payload.subCategoryId);
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
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to import customer records.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const extractMobileNumber = (obj) => {
  if (!obj) return '';
  const candidates = [
    obj.mobile,
    obj.mobileNumber,
    obj.mobile_number,
    obj.mobileNo,
    obj.mobile_no,
    obj.contactNo,
    obj.contact_no,
    obj.contactNumber,
    obj.contact_number,
    obj.contact,
    obj.phone,
    obj.phoneNumber,
    obj.phone_number,
    obj.phoneNo,
    obj.phone_no,
    obj.number,
    obj.userMobile,
    obj.userPhone,
    obj.userContact,
    obj.primaryMobile,
    obj.cell,
    obj.phone1,
    obj.customerPhone,
    obj.customerMobile,
    obj.customerNumber,
  ];
  for (const val of candidates) {
    if (val !== undefined && val !== null) {
      const strVal = String(val).trim();
      const cleanDigits = strVal.replace(/\D/g, '');
      if (
        strVal &&
        strVal !== '-' &&
        strVal !== '—' &&
        strVal !== 'null' &&
        strVal !== 'undefined' &&
        !strVal.toUpperCase().startsWith('CUST') &&
        cleanDigits.length >= 7
      ) {
        return strVal;
      }
    }
  }
  if (obj.name) {
    const strName = String(obj.name).trim();
    const cleanDigits = strName.replace(/\D/g, '');
    if (cleanDigits.length >= 7) {
      return strName;
    }
  }
  return '';
};

export const extractEmail = (obj) => {
  if (!obj) return '';
  const candidates = [
    obj.email,
    obj.emailAddress,
    obj.email_address,
    obj.emailId,
    obj.email_id,
    obj.mail,
    obj.userEmail,
    obj.contactEmail,
    obj.companyEmail,
    obj.customerEmail,
  ];
  for (const val of candidates) {
    if (val !== undefined && val !== null) {
      const strVal = String(val).trim();
      if (
        strVal &&
        strVal !== '-' &&
        strVal !== '—' &&
        strVal !== 'null' &&
        strVal !== 'undefined' &&
        strVal.includes('@')
      ) {
        return strVal;
      }
    }
  }
  if (obj.name && String(obj.name).includes('@')) {
    return String(obj.name).trim();
  }
  return '';
};

const getStoredCustomers = () => {
  try {
    const saved = localStorage.getItem('lts_customer_database_cache');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    return [];
  }
};

const saveStoredCustomers = (customers) => {
  try {
    if (Array.isArray(customers)) {
      localStorage.setItem('lts_customer_database_cache', JSON.stringify(customers));
    }
  } catch (err) {
    console.error('Failed to save customers cache to localStorage', err);
  }
};

const initialState = {
  customers: getStoredCustomers(),
  deletedCustomerIds: [],
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

        const validFetched = fetched.filter(
          (f) =>
            !f.isDeleted &&
            f.status !== 'Deleted' &&
            !state.deletedCustomerIds.includes(f._id) &&
            !state.deletedCustomerIds.includes(f.customerId) &&
            !state.deletedCustomerIds.includes(f.id)
        );

        const mergedFetched = validFetched.map((f) => {
          const match = state.customers.find(
            (c) =>
              (c._id && c._id === f._id) ||
              (c.customerId && c.customerId === f.customerId) ||
              (c.companyName && f.companyName && c.companyName.toLowerCase() === f.companyName.toLowerCase())
          );

          const fetchedMobile = extractMobileNumber(f) || extractMobileNumber(match);
          const fetchedEmail = extractEmail(f) || extractEmail(match);

          return {
            ...f,
            mobile: fetchedMobile || f.mobile,
            mobileNumber: fetchedMobile || f.mobileNumber || f.mobile,
            contactNo: fetchedMobile || f.contactNo || f.mobile,
            phone: fetchedMobile || f.phone || f.mobile,
            contact: fetchedMobile || f.contact || f.mobile,
            number: fetchedMobile || f.number || f.mobile,
            email: fetchedEmail || f.email,
            emailAddress: fetchedEmail || f.emailAddress || f.email,
            emailId: fetchedEmail || f.emailId || f.email,
            mail: fetchedEmail || f.mail || f.email,
          };
        });

        const localCreated = state.customers.filter(
          (c) =>
            c._isLocal &&
            !c.isDeleted &&
            c.status !== 'Deleted' &&
            !state.deletedCustomerIds.includes(c._id) &&
            !state.deletedCustomerIds.includes(c.customerId) &&
            !state.deletedCustomerIds.includes(c.id) &&
            !mergedFetched.some((f) => f._id === c._id || f.customerId === c.customerId)
        );
        state.customers = [...localCreated, ...mergedFetched];
        state.totalCustomers = action.payload?.totalCustomers || state.customers.length;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.currentPage || 1;
        saveStoredCustomers(state.customers);
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
            const mobVal = extractMobileNumber(newCust) || extractMobileNumber(action.meta?.arg) || '';
            const emailVal = extractEmail(newCust) || extractEmail(action.meta?.arg) || '';
            const normalized = {
              ...newCust,
              _isLocal: true,
              mobile: mobVal,
              mobileNumber: mobVal,
              contactNo: mobVal,
              phone: mobVal,
              contact: mobVal,
              number: mobVal,
              email: emailVal,
              emailAddress: emailVal,
              emailId: emailVal,
              mail: emailVal,
            };
            state.customers = [normalized, ...state.customers];
            saveStoredCustomers(state.customers);
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
            const newMobile = extractMobileNumber(updateData) || extractMobileNumber(apiCustomer) || extractMobileNumber(c);
            const newEmail = extractEmail(updateData) || extractEmail(apiCustomer) || extractEmail(c);
            return {
              ...c,
              ...apiCustomer,
              ...updateData,
              mobile: newMobile,
              mobileNumber: newMobile,
              phone: newMobile,
              contact: newMobile,
              number: newMobile,
              email: newEmail,
              emailAddress: newEmail,
              emailId: newEmail,
              mail: newEmail,
              _isLocalUpdated: true,
            };
          }
          return c;
        });
        saveStoredCustomers(state.customers);
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
        const deletedCustomerId = resData?.customerId || action.payload?.customerId;

        const idsToRemove = [primaryId, secondaryId, deletedCustomerId].filter(Boolean);
        state.deletedCustomerIds = Array.from(new Set([...state.deletedCustomerIds, ...idsToRemove]));

        if (state.customers && Array.isArray(state.customers)) {
          state.customers = state.customers.filter((c) => {
            if (idsToRemove.some((id) => c.customerId === id || c._id === id || c.id === id || c.customerCode === id)) {
              return false;
            }
            return true;
          });
          saveStoredCustomers(state.customers);
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
