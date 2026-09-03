import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Reports List (API 26)
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, search = '' } = filterParams;
      const params = {};

      if (page) params.page = page;
      if (search && search.trim()) params.search = search.trim();

      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch sales reports.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Save Report Settings (API 27)
export const updateReportSettings = createAsyncThunk(
  'reports/updateReportSettings',
  async ({ reportId, name, period, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}`, {
        name,
        period,
        status
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update report settings.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Export Reports CSV (API 28)
export const exportReportsCsv = createAsyncThunk(
  'reports/exportReportsCsv',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/export-csv', {
        responseType: 'blob'
      });

      let filename = `lts_vendor_reports_${new Date().toISOString().slice(0, 10)}.csv`;
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
      let message = 'Failed to export sales reports CSV.';
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
  reports: [],
  page: 1,
  pages: 1,
  totalReports: 0,
  loading: false,
  updating: false,
  exporting: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchReports (API 26)
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = Array.isArray(action.payload?.reports) ? action.payload.reports : [];
        state.page = Number(action.payload?.page) || 1;
        state.pages = Number(action.payload?.pages) || 1;
        state.totalReports = Number(action.payload?.totalReports) || 0;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch sales reports';
      });

    // 2. updateReportSettings (API 27)
    builder
      .addCase(updateReportSettings.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateReportSettings.fulfilled, (state, action) => {
        state.updating = false;
        const updatedReport = action.payload;
        if (updatedReport && (updatedReport.reportId || updatedReport._id)) {
          const index = state.reports.findIndex(
            (r) =>
              (updatedReport.reportId && r.reportId === updatedReport.reportId) ||
              (updatedReport._id && r._id === updatedReport._id)
          );
          if (index !== -1) {
            state.reports[index] = { ...state.reports[index], ...updatedReport };
          }
        }
        state.error = null;
      })
      .addCase(updateReportSettings.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update report settings';
      });

    // 3. exportReportsCsv (API 28)
    builder
      .addCase(exportReportsCsv.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportReportsCsv.fulfilled, (state) => {
        state.exporting = false;
        state.error = null;
      })
      .addCase(exportReportsCsv.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload || 'Failed to export sales reports CSV';
      });
  }
});

export const { clearReportsError } = reportsSlice.actions;
export default reportsSlice.reducer;
