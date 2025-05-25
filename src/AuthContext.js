// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase'; // Import db
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // NEW: State for user role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Make async
      setCurrentUser(user);
      if (user) {
        // User is signed in, try to fetch their role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().role); // Assuming role is stored in 'role' field
            console.log("User role fetched:", userDocSnap.data().role);
          } else {
            // User document doesn't exist in 'users' collection, so no specific role
            setUserRole(null); 
            console.log("No user document found in 'users' collection for role.");
          }
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole(null); // Default to no role on error
        }
      } else {
        // User is signed out
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole, // NEW: Provide userRole in the context
    loadingAuth: loading, // Renamed loading to be more specific
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
}