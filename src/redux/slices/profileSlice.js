import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Update Vendor Profile (API 29)
export const updateVendorProfile = createAsyncThunk(
  'profile/updateVendorProfile',
  async ({ fullName, phone, designation, regionalJurisdiction }, { rejectWithValue }) => {
    try {
      // Send ONLY the supported profile update fields
      const response = await api.put('/profile', {
        fullName,
        phone,
        designation,
        regionalJurisdiction
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile details.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Update Password (API 30)
export const updateVendorPassword = createAsyncThunk(
  'profile/updateVendorPassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update password.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Update Preferences (API 31)
export const updateVendorPreferences = createAsyncThunk(
  'profile/updateVendorPreferences',
  async ({ twoFactorAuth, emailAlerts, syncFrequency }, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/preferences', {
        twoFactorAuth: Boolean(twoFactorAuth),
        emailAlerts: Boolean(emailAlerts),
        syncFrequency: String(syncFrequency)
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update preferences.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  profile: null,
  preferences: {
    twoFactorAuth: true,
    emailAlerts: true,
    syncFrequency: 'Hourly Sync'
  },
  profileUpdating: false,
  passwordUpdating: false,
  preferencesUpdating: false,
  error: null,
  successMessage: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileSuccess: (state) => {
      state.successMessage = null;
    },
    setLocalPreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // 1. updateVendorProfile (API 29)
    builder
      .addCase(updateVendorProfile.pending, (state) => {
        state.profileUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVendorProfile.fulfilled, (state, action) => {
        state.profileUpdating = false;
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully!';
        state.error = null;
      })
      .addCase(updateVendorProfile.rejected, (state, action) => {
        state.profileUpdating = false;
        state.error = action.payload || 'Failed to update profile';
      });

    // 2. updateVendorPassword (API 30)
    builder
      .addCase(updateVendorPassword.pending, (state) => {
        state.passwordUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVendorPassword.fulfilled, (state, action) => {
        state.passwordUpdating = false;
        state.successMessage = action.payload?.message || 'Password updated successfully!';
        state.error = null;
      })
      .addCase(updateVendorPassword.rejected, (state, action) => {
        state.passwordUpdating = false;
        state.error = action.payload || 'Failed to update password';
      });

    // 3. updateVendorPreferences (API 31)
    builder
      .addCase(updateVendorPreferences.pending, (state) => {
        state.preferencesUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVendorPreferences.fulfilled, (state, action) => {
        state.preferencesUpdating = false;
        state.preferences = {
          ...state.preferences,
          ...action.payload
        };
        state.successMessage = 'Account settings preferences updated!';
        state.error = null;
      })
      .addCase(updateVendorPreferences.rejected, (state, action) => {
        state.preferencesUpdating = false;
        state.error = action.payload || 'Failed to update preferences';
      });
  }
});

export const {
  clearProfileError,
  clearProfileSuccess,
  setLocalPreferences
} = profileSlice.actions;

export default profileSlice.reducer;
