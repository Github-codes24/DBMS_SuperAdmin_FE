import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Orders List (API 15)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', deliveryStatus = '' } = filterParams;
      const params = {};

      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (search && search.trim()) params.search = search.trim();
      if (deliveryStatus && deliveryStatus !== 'All' && deliveryStatus.trim()) {
        params.deliveryStatus = deliveryStatus.trim();
      }

      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch orders list.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Fetch Recent Orders for Dashboard (API 16)
export const fetchRecentOrders = createAsyncThunk(
  'orders/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/recent');
      // Returns an array directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch recent orders.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Fetch Single Order Details (API 17)
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch order details.';
      return rejectWithValue(message);
    }
  }
);

// 4. Async Thunk: Update Order Delivery Status (API 18)
export const updateOrderDeliveryStatus = createAsyncThunk(
  'orders/updateOrderDeliveryStatus',
  async ({ orderId, deliveryStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/delivery-status`, {
        deliveryStatus
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update order delivery status.';
      return rejectWithValue(message);
    }
  }
);

// 5. Async Thunk: Export Orders CSV (API 19)
export const exportOrdersCsv = createAsyncThunk(
  'orders/exportOrdersCsv',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/export-csv', {
        responseType: 'blob'
      });

      let filename = `lts_vendor_orders_${new Date().toISOString().slice(0, 10)}.csv`;
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
      let message = 'Failed to export orders CSV.';
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
  orders: [],
  recentOrders: [],
  selectedOrder: null,
  pagination: {
    page: 1,
    pages: 1,
    totalOrders: 0
  },
  loading: false,
  recentLoading: false,
  detailLoading: false,
  updateStatusLoading: false,
  exportLoading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchOrders (API 15)
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload?.orders) ? action.payload.orders : [];
        state.pagination = {
          page: Number(action.payload?.page) || 1,
          pages: Number(action.payload?.pages) || 1,
          totalOrders: Number(action.payload?.totalOrders) || 0
        };
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      });

    // 2. fetchRecentOrders (API 16)
    builder
      .addCase(fetchRecentOrders.pending, (state) => {
        state.recentLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentOrders = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.recentLoading = false;
        state.error = action.payload || 'Failed to fetch recent orders';
      });

    // 3. fetchOrderById (API 17)
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to fetch order details';
      });

    // 4. updateOrderDeliveryStatus (API 18)
    builder
      .addCase(updateOrderDeliveryStatus.pending, (state) => {
        state.updateStatusLoading = true;
        state.error = null;
      })
      .addCase(updateOrderDeliveryStatus.fulfilled, (state, action) => {
        state.updateStatusLoading = false;
        const updatedOrder = action.payload;
        if (updatedOrder && updatedOrder.orderId) {
          // Update in main orders list by matching orderId
          const index = state.orders.findIndex((o) => o.orderId === updatedOrder.orderId || o._id === updatedOrder._id);
          if (index !== -1) {
            state.orders[index] = { ...state.orders[index], ...updatedOrder };
          }
          // Update in recent orders list by matching orderId
          const recentIndex = state.recentOrders.findIndex((o) => o.orderId === updatedOrder.orderId || o._id === updatedOrder._id);
          if (recentIndex !== -1) {
            state.recentOrders[recentIndex] = { ...state.recentOrders[recentIndex], ...updatedOrder };
          }
          // Update selectedOrder if open
          if (state.selectedOrder && (state.selectedOrder.orderId === updatedOrder.orderId || state.selectedOrder._id === updatedOrder._id)) {
            state.selectedOrder = { ...state.selectedOrder, ...updatedOrder };
          }
        }
        state.error = null;
      })
      .addCase(updateOrderDeliveryStatus.rejected, (state, action) => {
        state.updateStatusLoading = false;
        state.error = action.payload || 'Failed to update order delivery status';
      });

    // 5. exportOrdersCsv (API 19)
    builder
      .addCase(exportOrdersCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportOrdersCsv.fulfilled, (state) => {
        state.exportLoading = false;
        state.error = null;
      })
      .addCase(exportOrdersCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload || 'Failed to export orders CSV';
      });
  }
});

export const { clearOrdersError, setSelectedOrder, clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
