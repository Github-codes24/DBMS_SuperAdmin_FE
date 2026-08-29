import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

const storedToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');
const storedUser = localStorage.getItem('user');

let parsedUser = null;
try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  parsedUser = null;
}

const initialState = {
  loading: false,
  profileLoading: false,
  logoutLoading: false,
  error: null,
  user: parsedUser,
  accessToken: storedToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: !!storedToken,
  tokenExpired: false,
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken, message } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.fullName);
      localStorage.setItem('userRole', user.role === 'SuperAdmin' ? 'Super Admin' : user.role);

      toast.success(message || 'Login successful');
      return { user, accessToken, refreshToken, message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'auth/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userName', user.fullName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role === 'SuperAdmin' ? 'Super Admin' : user.role);

      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile.';
      const status = error.response?.status;
      return rejectWithValue({ message, status });
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/logout');
      const message = response.data?.message || 'Logged out successfully';
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');

      toast.success(message);
      return message;
    } catch (error) {
      // Even if API request fails, local session must be cleared
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');

      const message = error.response?.data?.message || 'Logout failed.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTokenExpired: (state) => {
      state.tokenExpired = false;
    },
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.tokenExpired = false;
      state.error = null;
    },
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.tokenExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.tokenExpired = false;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.tokenExpired = false;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload?.message || 'Profile loading failed';
        if (action.payload?.status === 401) {
          state.tokenExpired = true;
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
        }
      })
      // Logout
      .addCase(logoutAdmin.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.logoutLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.tokenExpired = false;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.logoutLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpired = false;
      });
  },
});

export const { clearError, clearTokenExpired, resetAuth, updateTokens } = authSlice.actions;
export default authSlice.reducer;
