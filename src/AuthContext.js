// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth'; // Ensure sendEmailVerification is imported
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsEmailVerified(user.emailVerified); 

        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role); 
            console.log("User role fetched:", userData.role);

            if (userData.emailVerified !== user.emailVerified) {
              await setDoc(userDocRef, { emailVerified: user.emailVerified }, { merge: true });
              console.log("Updated emailVerified status in Firestore for user:", user.uid);
            }
          } else {
            setUserRole(null); 
            console.log("No user document found in 'users' collection for role. User might need to complete profile or an admin might need to assign a role.");
          }
        } catch (error) {
            console.error("Error fetching user role or updating emailVerified status:", error);
            setUserRole(null);
        }
      } else {
        setUserRole(null);
        setIsEmailVerified(false);
      }
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  // Function to allow users to resend their verification email
  const resendVerificationEmail = async () => {
    if (currentUser) { // Check if there is a current user logged in
      try {
        await sendEmailVerification(currentUser);
        console.log("Verification email resent.");
        return true; // Indicate success
      } catch (error) {
        console.error("Error resending verification email:", error);
        return false; // Indicate failure
      }
    }
    return false; // No user logged in, so cannot send
  };

  // The value provided to consuming components by the context
  const value = {
    currentUser,
    userRole,
    isEmailVerified,
    loadingAuth,
    resendVerificationEmail, // <--- MAKE SURE THIS IS INCLUDED HERE
  };

  // Render children only after the initial authentication check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
}