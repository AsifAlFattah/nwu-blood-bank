// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Used for Call to Action buttons/links
import { useAuth } from '../AuthContext';

function HomePage() {
  const { currentUser } = useAuth();
  return (
    // Main container for the page, designed to center content and fill screen height below navbar
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 min-h-screen-nav">
      
      <main className="max-w-3xl w-full"> {/* Ensures content doesn't get too wide on large screens */}
        <h1 className="text-4xl md:text-5xl font-bold text-red-700 mb-6">
          Welcome to NWU Blood Bank
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10"> {/* Increased bottom margin */}
          Connecting compassionate donors with those in urgent need within our university community. Your contribution can save a life.
        </p>
        
        {currentUser ? (
          // Content shown when a user is logged in
          <div className="space-y-4">
            <p className="text-xl text-green-700">
              You are logged in as: <span className="font-semibold">{currentUser.email}</span>
            </p>
            <p className="text-md text-gray-600">
              Use the navigation bar to find donors, post a request, or visit your dashboard to manage your profile and activities.
            </p>
            <Link 
              to="/dashboard"
              className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          // Content shown when no user is logged in (guest view)
          <div className="space-y-6">
            <p className="text-md text-gray-600 mb-8">
              Join our community of lifesavers. Register to become a donor or log in to find help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/register"
                // Using blue for primary registration call to action, consistent with other primary buttons
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
              >
                Register Now
              </Link>
              <Link 
                to="/login"
                // Secondary action style for login
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
              >
                Login
              </Link>
            </div>
          </div>
        )}

        {/* A section with more information about blood donation */}
        <div className="mt-16 border-t border-gray-300 pt-10"> {/* Added border-gray-300 */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">The Gift of Life</h2>
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
            Every blood donation is a vital contribution to our community's health. Your simple act of kindness can bring hope and healing to patients in critical need, directly impacting lives and fostering a spirit of support within NWU.
          </p>
        </div>
      </main>

    </div>
  );
}

export default HomePage;