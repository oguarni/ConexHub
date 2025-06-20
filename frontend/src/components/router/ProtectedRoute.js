import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppProvider';

const ProtectedRoute = ({ children, requiredRole = null, requireAuth = true }) => {
  const { user } = useAppContext();
  const location = useLocation();

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    // Redirect to home page and store the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If specific role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to home page for unauthorized access
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;