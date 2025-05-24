// src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; // <--- IMPORT THIS

import { useAuth } from './AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

function App() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // ... your logout logic ...
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="App min-h-screen bg-gray-100">
      <nav className="bg-red-600 p-4 text-white shadow-md">
        {/* ... your existing navbar code ... it should already be dynamic ... */}
        <ul className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="hover:text-red-200 font-semibold text-lg">NWU Blood Bank</Link>
            </li>
            <li>
              <Link to="/" className="hover:text-red-200">Home</Link>
            </li>
          </div>
          <div className="flex space-x-4 items-center">
            {currentUser ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-red-200">Dashboard</Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-200 bg-transparent border-none p-0 text-white"
                  >
                    Logout ({currentUser.email.split('@')[0]})
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-red-200">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-red-200">Register</Link>
                </li>
              </>
            )}
          </div>
        </ul>
      </nav>

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute> {/* <--- WRAP DashboardPage like this */}
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;