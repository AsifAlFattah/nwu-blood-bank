// src/App.js
import React from 'react';
// We might not need Link and useNavigate here anymore if Navbar handles all nav actions
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
import Navbar from './components/Navbar'; // <--- IMPORT your new Navbar component

// useAuth, auth, signOut, and useNavigate for logout are now handled within Navbar.js
// So, we can remove them from App.js if they are not used for other purposes here.

function App() {
  // currentUser and handleLogout are no longer needed directly in App.js
  // as Navbar.js will use useAuth() and define its own handleLogout.

  return (
    // Added pt-16 (padding-top: 4rem) to account for the sticky navbar's height (h-16 = 4rem)
    // Adjust this value if your navbar height is different.
    <div className="App min-h-screen bg-gray-100 pt-0"> 
      <Navbar /> {/* <--- USE the new Navbar component here */}
      
      {/* The main content area */}
      <div className="container mx-auto p-4">
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
      </div>
    </div>
  );
}

export default App;