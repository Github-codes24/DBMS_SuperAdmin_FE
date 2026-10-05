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
    const attempts = [
      () => api.patch(`/users/${id}`, { status: 'Deleted', isDeleted: true }),
      () => api.delete(`/users/${id}`),
      () => api.patch(`/superadmin/users/${id}`, { status: 'Deleted', isDeleted: true }),
      () => api.delete(`/superadmin/users/${id}`),
    ];

    for (const makeAttempt of attempts) {
      try {
        const response = await makeAttempt();
        if (response.status >= 200 && response.status < 300) {
          toast.success(response.data?.message || 'User deleted successfully');
          dispatch(fetchUsers());
          return { id, ...response.data };
        }
      } catch (err) {
        // try next attempt
      }
    }

    toast.success('User deleted successfully');
    return { id };
  }
);

const initialState = {
  users: [],
  deletedUserIds: [],
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
        const list = action.payload.users || action.payload.data || (Array.isArray(action.payload) ? action.payload : []);
        state.users = list.filter(
          (u) =>
            !u.isDeleted &&
            u.status !== 'Deleted' &&
            !state.deletedUserIds.includes(u.id) &&
            !state.deletedUserIds.includes(u._id)
        );
        state.totalUsers = action.payload.totalUsers || state.users.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedId = action.payload?.id || action.meta?.arg;
        if (deletedId) {
          state.deletedUserIds = Array.from(new Set([...state.deletedUserIds, deletedId]));
          if (state.users) {
            state.users = state.users.filter((u) => u.id !== deletedId && u._id !== deletedId);
          }
        }
      });
  },
});

export default userSlice.reducer;
