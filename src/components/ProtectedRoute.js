import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Your AuthContext hook

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login (optional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, render the children (the protected page)
  return children;
}

export default ProtectedRoute;