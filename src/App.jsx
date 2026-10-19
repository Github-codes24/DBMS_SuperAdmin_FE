import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMyProfile } from "./redux/slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Pages/Login";
import Forgot from "./Pages/Forgot";
import Otp from "./Pages/Otp";
import Reset from "./Pages/Reset";
import Success from "./Pages/Success";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import CategorySubcategory from "./Components/CategorySubcategory";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/success" element={<Success />} />

      {/* Protected Routes - Login Required */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category-subcategory"
        element={
          <ProtectedRoute>
            <CategorySubcategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usermanagement"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="usermanagement" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="role" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feature"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="feature" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-db"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="customer-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-db"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="vendor-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-db/add"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="vendor-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-db/view/:id"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="vendor-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-db/edit/:id"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="vendor-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-db/change-password/:id"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="vendor-db" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/telecaller-mgmt"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="telecaller-mgmt" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-management"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="data-management" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <Dashboard initialTab="audit-logs" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navbar"
        element={
          <ProtectedRoute>
            <Navbar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sidebar"
        element={
          <ProtectedRoute>
            <Sidebar activeTab="dashboard" setActiveTab={() => {}} />
          </ProtectedRoute>
        }
      />

      {/* Wildcard redirect to Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;