import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// 1. Async Thunk: Login Vendor
export const loginVendor = createAsyncThunk(
  "auth/loginVendor",
  async (credentials, { rejectWithValue }) => {
    try {
      const email =
        credentials.email || credentials.vendorId || credentials.loginId;
      const response = await api.post("/auth/login", {
        email,
        password: credentials.password,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please verify your credentials.";
      return rejectWithValue(message);
    }
  },
);

// 2. Async Thunk: Fetch Vendor Profile
export const fetchVendorProfile = createAsyncThunk(
  "auth/fetchVendorProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load vendor profile.";
      return rejectWithValue({
        message,
        status: error.response?.status,
      });
    }
  },
);

// 3. Async Thunk: Logout Vendor
export const logoutVendor = createAsyncThunk(
  "auth/logoutVendor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout");
      localStorage.removeItem("token");
      return response.data;
    } catch (error) {
      // Even if backend fails, clear frontend token
      localStorage.removeItem("token");
      const message =
        error.response?.data?.message ||
        error.message ||
        "Logout API call failed, session cleared locally.";
      return rejectWithValue(message);
    }
  },
);

const initialToken = localStorage.getItem("token") || null;

const initialState = {
  loading: false,
  profileLoading: false,
  logoutLoading: false,
  error: null,
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.loading = false;
      state.profileLoading = false;
      state.logoutLoading = false;
      state.error = null;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // loginVendor
    builder
      .addCase(loginVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginVendor.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload || "Login failed";
      });

    // fetchVendorProfile
    builder
      .addCase(fetchVendorProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.isAuthenticated = true;
        state.user = {
          ...state.user,
          ...action.payload,
        };
      })
      .addCase(fetchVendorProfile.rejected, (state, action) => {
        state.profileLoading = false;
        if (action.payload?.status === 401) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
        state.error = action.payload?.message || "Failed to fetch profile";
      });

    // logoutVendor
    builder
      .addCase(logoutVendor.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutVendor.fulfilled, (state) => {
        state.logoutLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutVendor.rejected, (state) => {
        state.logoutLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      });

    // Handle updateVendorProfile fulfilled to keep auth.user in sync
    builder.addCase(
      "profile/updateVendorProfile/fulfilled",
      (state, action) => {
        if (action.payload) {
          state.user = {
            ...state.user,
            ...action.payload,
          };
        }
      },
    );
  },
});

export const { clearAuthError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
