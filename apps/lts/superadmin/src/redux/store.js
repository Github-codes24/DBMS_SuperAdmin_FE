import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import featureControlReducer from './slices/featureControlSlice';
import customerReducer from './slices/customerSlice';
import categoryReducer from './slices/categorySlice';
import vendorReducer from './slices/vendorSlice';
import telecallerReducer from './slices/telecallerSlice';
import dataManagementReducer from './slices/dataManagementSlice';
import auditLogsReducer from './slices/auditLogsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    user: userReducer,
    role: roleReducer,
    featureControl: featureControlReducer,
    customer: customerReducer,
    category: categoryReducer,
    vendor: vendorReducer,
    telecaller: telecallerReducer,
    dataManagement: dataManagementReducer,
    auditLogs: auditLogsReducer,
  },
});

export default store;
