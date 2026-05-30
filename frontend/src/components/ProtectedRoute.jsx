import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
