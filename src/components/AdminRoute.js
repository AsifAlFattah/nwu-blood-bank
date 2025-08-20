// src/components/AdminRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Your AuthContext hook
import LoadingSpinner from './LoadingSpinner'; // Optional: for loading state

function AdminRoute({ children }) {
  const { currentUser, userRole, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // If auth state is still loading, show a spinner or null
    return <LoadingSpinner message="Verifying access..." size="lg" />; 
  }

  if (!currentUser) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser && userRole !== 'admin') {
    // If user is logged in but not an admin, redirect to a 'Not Authorized' page or homepage
    // For now, let's redirect to the homepage.
    console.warn("User is not an admin. Redirecting to home.");
    return <Navigate to="/" replace />; 
  }

  // If user is logged in and is an admin, render the children components
  return children;
}

export default AdminRoute;