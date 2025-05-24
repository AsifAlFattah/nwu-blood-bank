// src/pages/DashboardPage.js (Example of how to use it - we'll refine this)
import React from 'react';
import { useAuth } from '../AuthContext'; // Import useAuth

function DashboardPage() {
  const { currentUser } = useAuth(); // Get the current user

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {currentUser ? (
        <p>Welcome, {currentUser.email}! Your donor/request info will be here.</p>
      ) : (
        <p>Please log in to see your dashboard.</p> // This part won't be reached if we protect the route
      )}
    </div>
  );
}

export default DashboardPage;