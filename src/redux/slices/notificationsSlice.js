import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Notifications List (API 32)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1 } = filterParams;
      const response = await api.get('/notifications', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch notifications.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Mark Notification as Read (API 33)
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      // Must use MongoDB _id for this endpoint as documented
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark notification as read.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Mark All Notifications as Read (API 34)
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark all notifications as read.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  page: 1,
  pages: 1,
  totalNotifications: 0,
  loading: false,
  markingRead: false,
  markingReadId: null,
  markingAllRead: false,
  error: null,
  successMessage: null
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
    clearNotificationsSuccess: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchNotifications (API 32)
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload?.notifications)
          ? action.payload.notifications
          : [];
        state.unreadCount = Number(action.payload?.unreadCount) || 0;
        state.page = Number(action.payload?.page) || 1;
        state.pages = Number(action.payload?.pages) || 1;
        state.totalNotifications = Number(action.payload?.totalNotifications) || 0;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      });

    // 2. markNotificationAsRead (API 33)
    builder
      .addCase(markNotificationAsRead.pending, (state, action) => {
        state.markingRead = true;
        state.markingReadId = action.meta.arg;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.markingRead = false;
        state.markingReadId = null;
        const updated = action.payload;
        if (updated && (updated._id || updated.notificationId)) {
          const index = state.notifications.findIndex(
            (n) =>
              (updated._id && n._id === updated._id) ||
              (updated.notificationId && n.notificationId === updated.notificationId)
          );
          if (index !== -1) {
            const prevStatus = state.notifications[index].status;
            state.notifications[index] = {
              ...state.notifications[index],
              ...updated,
              status: updated.status || 'Read'
            };
            if (prevStatus === 'Unread' || prevStatus === undefined) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.markingRead = false;
        state.markingReadId = null;
        state.error = action.payload || 'Failed to mark notification as read';
      });

    // 3. markAllNotificationsAsRead (API 34)
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.markingAllRead = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.markingAllRead = false;
        state.notifications.forEach((n) => {
          n.status = 'Read';
        });
        state.unreadCount = 0;
        state.successMessage = action.payload?.message || 'All notifications marked as read';
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.markingAllRead = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      });
  }
});

export const {
  clearNotificationsError,
  clearNotificationsSuccess
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
