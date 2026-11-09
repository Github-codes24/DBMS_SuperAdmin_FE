import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Inventory List (API 23)
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, search = '' } = filterParams;
      const params = {};

      if (page) params.page = page;
      if (search && search.trim()) params.search = search.trim();

      const response = await api.get('/inventory', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch inventory records.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Update Stock Level (API 24)
export const updateInventoryStock = createAsyncThunk(
  'inventory/updateInventoryStock',
  async ({ sku, stock }, { rejectWithValue }) => {
    try {
      // Send ONLY stock as required by backend (backend automatically calculates status)
      const response = await api.put(`/inventory/${sku}`, {
        stock: Number(stock)
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update stock level.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Export Inventory CSV (API 25)
export const exportInventoryCsv = createAsyncThunk(
  'inventory/exportInventoryCsv',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/export-csv', {
        responseType: 'blob'
      });

      let filename = `lts_vendor_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
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
      let message = 'Failed to export inventory CSV.';
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
  inventory: [],
  page: 1,
  pages: 1,
  totalRecords: 0,
  loading: false,
  updateLoading: false,
  exportLoading: false,
  error: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchInventory (API 23)
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = Array.isArray(action.payload?.inventory) ? action.payload.inventory : [];
        state.page = Number(action.payload?.page) || 1;
        state.pages = Number(action.payload?.pages) || 1;
        state.totalRecords = Number(action.payload?.totalRecords) || 0;
        state.error = null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch inventory';
      });

    // 2. updateInventoryStock (API 24)
    builder
      .addCase(updateInventoryStock.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateInventoryStock.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedItem = action.payload;
        if (updatedItem && (updatedItem.sku || updatedItem._id)) {
          const index = state.inventory.findIndex(
            (item) =>
              (updatedItem.sku && item.sku === updatedItem.sku) ||
              (updatedItem._id && item._id === updatedItem._id)
          );
          if (index !== -1) {
            state.inventory[index] = { ...state.inventory[index], ...updatedItem };
          }
        }
        state.error = null;
      })
      .addCase(updateInventoryStock.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || 'Failed to update stock level';
      });

    // 3. exportInventoryCsv (API 25)
    builder
      .addCase(exportInventoryCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportInventoryCsv.fulfilled, (state) => {
        state.exportLoading = false;
        state.error = null;
      })
      .addCase(exportInventoryCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload || 'Failed to export inventory CSV';
      });
  }
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
