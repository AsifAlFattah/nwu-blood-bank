// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
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
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; // Import the Footer component

// Note: Authentication-related hooks (useAuth, useNavigate) and functions (signOut) 
// are now primarily managed within components like Navbar.js, LoginPage.js, etc.

function App() {
  return (
    // Main application container using flexbox to position footer correctly.
    // min-h-screen ensures it takes at least the full viewport height.
    // pt-0 means content will start at the very top, potentially under a sticky navbar.
    // Individual pages might need internal padding if navbar overlap is not desired for their content.
    <div className="App flex flex-col min-h-screen bg-gray-100 pt-0"> 
      <Navbar /> 
      
      {/* Main content area that expands to fill available space */}
      <main className="container mx-auto p-4 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
        </Routes>
      </main>
      
      <Footer /> {/* Footer component placed after the main content */}
    </div>
  );
}

export default App; 