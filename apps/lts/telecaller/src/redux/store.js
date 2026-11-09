import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import plansReducer from './slices/plansSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
  },
});

export default store;
