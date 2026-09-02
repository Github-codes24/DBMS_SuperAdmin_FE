import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import dashboardReducer from "./slices/dashboardSlice.js";
import productsReducer from "./slices/productsSlice.js";
import ordersReducer from "./slices/ordersSlice.js";
import customersReducer from "./slices/customersSlice.js";
import inventoryReducer from "./slices/inventorySlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer,
    inventory: inventoryReducer
  }
});

export default store;

