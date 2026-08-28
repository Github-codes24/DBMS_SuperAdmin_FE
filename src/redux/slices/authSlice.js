import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Retrieve cached credentials
const cachedToken = localStorage.getItem('lts_telecaller_token') || null;
let cachedUser = null;
try {
  const userJson = localStorage.getItem('lts_telecaller_user');
  if (userJson) {
    cachedUser = JSON.parse(userJson);
  }
} catch (e) {
  console.error('Failed to parse cached user', e);
}

const initialState = {
  token: cachedToken,
  user: cachedUser,
  isAuthenticated: !!cachedToken,
  loading: false,
  error: null,
};

// Async thunk for telecaller registration
export const signupTelecaller = createAsyncThunk(
  'auth/signupTelecaller',
  async (signupData, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/telecaller/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });


      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      // data contains { success, message, token, data: user }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Server error occurred');
    }
  }
);

// Async thunk for telecaller login
export const loginTelecaller = createAsyncThunk(
  'auth/loginTelecaller',
  async (loginData, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/telecaller/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // data contains { success, message, token, data: user }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Server error occurred');
    }
  }
);

// Async thunk for fetching telecaller profile
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (!token) {
        return rejectWithValue('No token found');
      }
      if (token === 'mock-token') {
        return {
          success: true,
          data: state.auth.user
        };
      }
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/telecaller/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Server error occurred');
    }
  }
);

// Async thunk for updating telecaller profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (!token) {
        return rejectWithValue('No token found');
      }
      if (token === 'mock-token') {
        return {
          success: true,
          data: {
            ...state.auth.user,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            profileImage: profileData.photoUrl || profileData.profileImage || '',
          }
        };
      }
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profileImage: profileData.photoUrl || profileData.profileImage || '',
      };

      const response = await fetch(`${baseUrl}/api/telecaller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update profile');
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Server error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('lts_telecaller_token');
      localStorage.removeItem('lts_telecaller_user');
    },
    // Supporting offline/mock/manual login state injection
    loginSuccess(state, action) {
      const { user, token } = action.payload;
      state.token = token || 'mock-token';
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('lts_telecaller_token', state.token);
      localStorage.setItem('lts_telecaller_user', JSON.stringify(user));
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          avatar: action.payload.name ? action.payload.name.charAt(0).toUpperCase() : state.user.avatar || 'T'
        };
        localStorage.setItem('lts_telecaller_user', JSON.stringify(state.user));
      }
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupTelecaller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupTelecaller.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('lts_telecaller_token', action.payload.token);
        localStorage.setItem('lts_telecaller_user', JSON.stringify(action.payload.data));
      })
      .addCase(signupTelecaller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginTelecaller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTelecaller.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('lts_telecaller_token', action.payload.token);
        localStorage.setItem('lts_telecaller_user', JSON.stringify(action.payload.data));
      })
      .addCase(loginTelecaller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Profile cases
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload.data,
          photoUrl: action.payload.data.profileImage || action.payload.data.photoUrl || '',
          avatar: action.payload.data.name ? action.payload.data.name.charAt(0).toUpperCase() : 'T'
        };
        state.error = null;
        localStorage.setItem('lts_telecaller_user', JSON.stringify(state.user));
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload.data,
          photoUrl: action.payload.data.profileImage || action.payload.data.photoUrl || '',
          avatar: action.payload.data.name ? action.payload.data.name.charAt(0).toUpperCase() : 'T'
        };
        state.error = null;
        localStorage.setItem('lts_telecaller_user', JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, loginSuccess, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;

