import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();

  if (!isLoggedIn) {
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
