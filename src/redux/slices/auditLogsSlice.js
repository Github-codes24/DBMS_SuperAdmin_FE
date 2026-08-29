import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAuditLogs',
  async (searchVal, { rejectWithValue }) => {
    try {
      const params = {};
      if (searchVal && searchVal.trim()) {
        params.search = searchVal.trim();
      }
      const response = await api.get('/superadmin/audit-logs', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch audit logs.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  logs: [],
  totalLogs: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs || [];
        state.totalLogs = action.payload.totalLogs || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default auditLogsSlice.reducer;
