import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase'; // Your Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  useEffect(() => {
    // Firebase's onAuthStateChanged listener
    // This unsubscribe function will be returned and called when the component unmounts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // user will be null if not logged in, or the user object if logged in
      setLoading(false); // Done checking auth state
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  const value = {
    currentUser,
    // You can add more auth-related functions here if needed, e.g., login, logout, register
    // For now, we'll keep it simple with just currentUser
  };

  // Don't render children until initial auth check is complete to avoid flickering
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}