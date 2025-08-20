// src/App.js
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterDonorPage from './pages/RegisterDonorPage';
import EditDonorProfilePage from './pages/EditDonorProfilePage';
import FindDonorsPage from './pages/FindDonorsPage'; 
import PostRequestPage from './pages/PostRequestPage';
import ViewRequestsPage from './pages/ViewRequestsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

// Admin specific imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout'; // The new layout for the admin section
import AdminOverviewPage from './pages/admin/AdminOverviewPage'; // New placeholder for admin overview
import AdminDonorsPage from './pages/admin/AdminDonorsPage'; // Your existing page for listing donors
import AdminRequestsPage from './pages/admin/AdminRequestsPage'; // New placeholder
import AdminUsersPage from './pages/admin/AdminUsersPage'; // New placeholder for admin users management

// This component will conditionally render layouts based on the path
function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    // For admin paths, render only the AdminRoute and its children (which will include AdminLayout)
    return (
      <Routes>
        <Route 
          path="/admin/*" // Use /* to match all nested admin routes
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Nested routes within AdminLayout's <Outlet /> */}
          {/* Default admin page redirects to overview */}
          <Route index element={<Navigate to="overview" replace />} /> 
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="donors" element={<AdminDonorsPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          {/* Add more admin sub-pages here later, e.g., path="users" */}
        </Route>
        {/* Fallback or redirect for non-matched admin paths if necessary, or a 404 component */}
        {/* <Route path="/admin/*" element={<Navigate to="/admin/overview" />} />  // Simplified fallback for now */}
      </Routes>
    );
  }

  // For non-admin paths, render the standard layout with Navbar, content, and Footer
  return (
    // Main application container for non-admin pages
    // pt-0 based on your preference for navbar overlap
    <div className="flex flex-col min-h-screen bg-gray-100 pt-0"> 
      <Navbar /> 
      <main className="container mx-auto p-4 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/register-donor"
            element={<ProtectedRoute><RegisterDonorPage /></ProtectedRoute>}
          />
          <Route
            path="/edit-donor-profile"
            element={<ProtectedRoute><EditDonorProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/find-donors" 
            element={<ProtectedRoute><FindDonorsPage /></ProtectedRoute>}
          />
          <Route
            path="/post-request" 
            element={<ProtectedRoute><PostRequestPage /></ProtectedRoute>}
          />
          <Route
            path="/view-requests" 
            element={<ProtectedRoute><ViewRequestsPage /></ProtectedRoute>}
          />
          {/* If /admin routes are not matched above, this could lead to a blank page or 404 if not handled */}
          {/* Consider a catch-all 404 route for non-admin paths */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Basic catch-all for non-admin, non-matched routes */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// App component now just sets up the Router context (if not already in index.js)
// and renders AppContent which handles layout conditional logic.
// Since your index.js already has <Router>, App can simply be AppContent.
function App() {
  // BrowserRouter should be in index.js wrapping <App />
  // This App component now assumes it's already within a Router context.
  return <AppContent />;
}

export default App;