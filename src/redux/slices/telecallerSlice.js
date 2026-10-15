import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchTelecallers = createAsyncThunk(
  'telecaller/fetchTelecallers',
  async (params, { rejectWithValue }) => {
    try {
      const config = {};
      if (params) {
        config.params = params;
      }
      const response = await api.get('/superadmin/telecallers', config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch telecallers.';
      return rejectWithValue(message);
    }
  }
);

export const createTelecaller = createAsyncThunk(
  'telecaller/createTelecaller',
  async (telecallerData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/superadmin/telecallers', telecallerData);
      const emailSent = response.data.data?.emailSent;
      if (emailSent === true) {
        toast.success('Telecaller account created successfully. Login credentials have been sent to the registered email address.');
      } else if (emailSent === false) {
        toast.warning('Telecaller account created successfully, but credentials email could not be sent.');
      } else {
        toast.success(response.data.message || 'Telecaller created successfully');
      }
      dispatch(fetchTelecallers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create telecaller account.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTelecaller = createAsyncThunk(
  'telecaller/updateTelecaller',
  async ({ userId, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/superadmin/telecallers/${userId}`, updateData);
      // toast.success(response.data.message || 'Telecaller updated successfully');
      dispatch(fetchTelecallers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update telecaller account.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkUpdateTelecallerStatus = createAsyncThunk(
  'telecaller/bulkUpdateStatus',
  async ({ telecallers }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/superadmin/telecallers/bulk-status', {
        telecallers,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update selected telecallers.';
      return rejectWithValue(message);
    }
  }
);

export const deleteTelecaller = createAsyncThunk(
  'telecaller/deleteTelecaller',
  async (telecallerParam, { dispatch, rejectWithValue }) => {
    let mongoId = null;
    let userId = null;

    if (typeof telecallerParam === 'object' && telecallerParam !== null) {
      userId = telecallerParam.userId || telecallerParam.telecallerId || (typeof telecallerParam.id === 'string' && telecallerParam.id.startsWith('TC') ? telecallerParam.id : null);
      mongoId = telecallerParam._id || telecallerParam.mongoId || telecallerParam.id;
    } else if (typeof telecallerParam === 'string') {
      if (/^[0-9a-fA-F]{24}$/.test(telecallerParam)) {
        mongoId = telecallerParam;
      } else {
        userId = telecallerParam;
      }
    }

    const idsToTry = Array.from(new Set([userId, mongoId].filter(Boolean)));

    const attempts = [];
    for (const id of idsToTry) {
      attempts.push(() => api.delete(`/superadmin/telecallers/${id}`));
      attempts.push(() => api.delete(`/users/${id}`));
      attempts.push(() => api.post(`/superadmin/telecallers/${id}/delete`));
    }

    let lastError = null;
    for (const makeAttempt of attempts) {
      try {
        const response = await makeAttempt();
        if (response.status >= 200 && response.status < 300) {
          toast.success(response.data?.message || 'Telecaller deleted successfully');
          dispatch(fetchTelecallers());
          return { mongoId, userId, targetId: idsToTry[0], data: response.data };
        }
      } catch (err) {
        lastError = err;
      }
    }

    const message = lastError?.response?.data?.message || 'Failed to delete telecaller.';
    toast.error(message);
    return rejectWithValue(message);
  }
);

export const bulkImportTelecallers = createAsyncThunk(
  'telecaller/bulkImportTelecallers',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/superadmin/telecallers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Import completed successfully');
      dispatch(fetchTelecallers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to import telecaller records.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  telecallers: [],
  deletedTelecallerIds: [],
  totalTelecallers: 0,
  activeTelecallersCount: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  isSaving: false,
  error: null,
};

const telecallerSlice = createSlice({
  name: 'telecaller',
  initialState,
  reducers: {
    clearTelecallers: (state) => {
      state.telecallers = [];
      state.totalTelecallers = 0;
      state.activeTelecallersCount = 0;
      state.totalPages = 1;
      state.currentPage = 1;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Telecallers
      .addCase(fetchTelecallers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTelecallers.fulfilled, (state, action) => {
        state.loading = false;
        const rawList = action.payload.telecallers || action.payload.data || [];
        state.telecallers = Array.isArray(rawList)
          ? rawList.filter(
              (tc) =>
                tc.status !== 'Deleted' &&
                !tc.isDeleted &&
                !state.deletedTelecallerIds.includes(tc._id) &&
                !state.deletedTelecallerIds.includes(tc.id) &&
                !state.deletedTelecallerIds.includes(tc.userId)
            )
          : [];
        state.totalTelecallers = action.payload.totalTelecallers || state.telecallers.length;
        state.activeTelecallersCount = action.payload.activeTelecallersCount || state.telecallers.filter(t => t.status === 'Active').length;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchTelecallers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Telecaller
      .addCase(createTelecaller.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createTelecaller.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(createTelecaller.rejected, (state) => {
        state.isSaving = false;
      })
      // Update Telecaller
      .addCase(updateTelecaller.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateTelecaller.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(updateTelecaller.rejected, (state) => {
        state.isSaving = false;
      })
      // Delete Telecaller
      .addCase(deleteTelecaller.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(deleteTelecaller.fulfilled, (state, action) => {
        state.isSaving = false;
        const { mongoId, userId, targetId } = action.payload || {};
        const arg = action.meta?.arg;
        const argId = typeof arg === 'object' ? (arg._id || arg.id || arg.userId) : arg;

        const idsToRemove = [mongoId, userId, targetId, argId].filter(Boolean);
        state.deletedTelecallerIds = Array.from(new Set([...state.deletedTelecallerIds, ...idsToRemove]));

        if (state.telecallers && Array.isArray(state.telecallers)) {
          state.telecallers = state.telecallers.filter((tc) => {
            if (tc.status === 'Deleted' || tc.isDeleted) return false;
            if (idsToRemove.some((id) => tc._id === id || tc.userId === id || tc.id === id)) return false;
            return true;
          });
        }
      })
      .addCase(deleteTelecaller.rejected, (state) => {
        state.isSaving = false;
      })
      // Bulk Import
      .addCase(bulkImportTelecallers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkImportTelecallers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkImportTelecallers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearTelecallers } = telecallerSlice.actions;
export default telecallerSlice.reducer;
