import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users.';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/users', payload);
      toast.success(response.data.message || 'User created successfully');
      dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}`, payload);
      toast.success(response.data.message || 'User updated successfully');
      dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${id}`);
      toast.success(response.data.message || 'User deleted successfully');
      dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  totalUsers: 0,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.totalUsers = action.payload.totalUsers || 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
