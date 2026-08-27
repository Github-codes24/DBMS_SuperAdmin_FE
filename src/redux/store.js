import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import featureControlReducer from './slices/featureControlSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    user: userReducer,
    role: roleReducer,
    featureControl: featureControlReducer,
  },
});

export default store;
