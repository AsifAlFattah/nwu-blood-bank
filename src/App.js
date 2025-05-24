// src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // BrowserRouter removed from here
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

import { useAuth } from './AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

function App() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // This will now work correctly

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    // No <Router> here anymore
    <div className="App min-h-screen bg-gray-100">
      <nav className="bg-red-600 p-4 text-white shadow-md">
        <ul className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4 items-center"> {/* Added items-center for better alignment */}
            <li>
              <Link to="/" className="hover:text-red-200 font-semibold text-lg">NWU Blood Bank</Link> {/* Made title a bit larger */}
            </li>
            <li>
              <Link to="/" className="hover:text-red-200">Home</Link>
            </li>
          </div>
          <div className="flex space-x-4 items-center"> {/* Added items-center */}
            {currentUser ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-red-200">Dashboard</Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-200 bg-transparent border-none p-0 text-white" /* Ensured button text is white */
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
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </div>
    // No </Router> here anymore
  );
}

export default App;