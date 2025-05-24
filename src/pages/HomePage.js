// src/pages/HomePage.js (Example)
import React from 'react';
import { useAuth } from '../AuthContext';

function HomePage() {
  const { currentUser } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Welcome to NWU Blood Bank</h1>
      {currentUser ? (
        <p>You are logged in as {currentUser.email}.</p>
      ) : (
        <p>This is the home page. Please log in or register.</p>
      )}
    </div>
  );
}
export default HomePage;