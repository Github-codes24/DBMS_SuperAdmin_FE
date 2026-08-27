import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem('accessToken');
  const location = useLocation();

  if (!isAuthenticated && !hasToken) {
    return (
      <Navigate 
        to="/" 
        state={{ message: "Please login first to access the dashboard!", from: location.pathname }} 
        replace 
      />
    );
  }

  return children;
}

export default ProtectedRoute;
