import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import dashboardReducer from "./slices/dashboardSlice.js";
import productsReducer from "./slices/productsSlice.js";
import ordersReducer from "./slices/ordersSlice.js";
import customersReducer from "./slices/customersSlice.js";
import inventoryReducer from "./slices/inventorySlice.js";
import reportsReducer from "./slices/reportsSlice.js";
import profileReducer from "./slices/profileSlice.js";
import notificationsReducer from "./slices/notificationsSlice.js";
import ticketsReducer from "./slices/ticketsSlice.js";
import telecallerReducer from "./slices/telecallerSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer,
    inventory: inventoryReducer,
    reports: reportsReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
    tickets: ticketsReducer,
    telecaller: telecallerReducer,
  },
});

export default store;
