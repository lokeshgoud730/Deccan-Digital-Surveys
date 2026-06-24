import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  
  if (!isAdmin) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
