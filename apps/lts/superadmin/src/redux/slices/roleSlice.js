import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch roles.';
      return rejectWithValue(message);
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'role/fetchRolePermissions',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`);
      return { roleId, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permissions.';
      return rejectWithValue(message);
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  'role/updateRolePermissions',
  async ({ roleId, permissions }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
      toast.success(response.data.message || 'Permissions updated successfully');
      dispatch(fetchRolePermissions(roleId));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update permissions.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const grantAllPermissions = createAsyncThunk(
  'role/grantAllPermissions',
  async (roleId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/roles/${roleId}/permissions/quick-action`, { action: 'GRANT_ALL' });
      toast.success('Granted all permissions successfully');
      dispatch(fetchRolePermissions(roleId));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to grant all permissions.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createRole = createAsyncThunk(
  'role/createRole',
  async ({ title, description, cloneFromRole }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/roles', { title, description, cloneFromRole });
      toast.success(response.data.message || 'New role created successfully');
      dispatch(fetchRoles());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create new role.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  roles: [],
  totalRoles: 0,
  activePermissions: {},
  loading: false,
  permissionsLoading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    toggleLocalPermission: (state, action) => {
      const { resourceKey, actionKey } = action.payload;
      if (state.activePermissions[resourceKey]) {
        state.activePermissions[resourceKey][actionKey] = !state.activePermissions[resourceKey][actionKey];
      }
    },
    toggleLocalResourceAll: (state, action) => {
      const { resourceKey, value } = action.payload;
      if (state.activePermissions[resourceKey]) {
        Object.keys(state.activePermissions[resourceKey]).forEach((key) => {
          state.activePermissions[resourceKey][key] = value;
        });
      }
    },
    revokeLocalAll: (state) => {
      Object.keys(state.activePermissions).forEach((resKey) => {
        Object.keys(state.activePermissions[resKey]).forEach((actionKey) => {
          state.activePermissions[resKey][actionKey] = false;
        });
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles || [];
        state.totalRoles = action.payload.totalRoles || 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Role Permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        const moduleKeyToResourceKey = {
          CUSTOMER_DATABASE: "Customers",
          VENDOR_DATABASE: "Vendors",
          CUSTOMER_VENDOR_QUERIES: "Queries",
          ANALYTICS_REPORTS: "Reports",
          SYSTEM_AUDIT_LOGS: "AuditLogs",
          USER_MANAGEMENT: "UserManagement"
        };
        const rawPerms = action.payload.data.permissions || [];
        const mapped = {
          Customers: { view: false, edit: false, export: false, delete: false },
          Vendors: { view: false, edit: false, export: false, delete: false },
          Queries: { view: false, edit: false, export: false, delete: false },
          Reports: { view: false, edit: false, export: false, delete: false },
          AuditLogs: { view: false, edit: false, export: false, delete: false },
          UserManagement: { view: false, edit: false, export: false, delete: false }
        };
        rawPerms.forEach((p) => {
          const resKey = moduleKeyToResourceKey[p.moduleKey];
          if (resKey) {
            mapped[resKey] = {
              view: p.viewAccess,
              edit: p.editAccess,
              export: p.exportAccess,
              delete: p.deleteAccess
            };
          }
        });
        state.activePermissions = mapped;
      })
      .addCase(fetchRolePermissions.rejected, (state) => {
        state.permissionsLoading = false;
      });
  },
});

export const { toggleLocalPermission, toggleLocalResourceAll, revokeLocalAll } = roleSlice.actions;
export default roleSlice.reducer;
