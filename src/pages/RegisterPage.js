// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase'; // Ensure db is imported
// Import sendEmailVerification from firebase/auth
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // For success/info messages after registration
  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setError(null); 
    setSuccessMessage(''); // Clear previous messages
    setLoading(true);

    // Basic password length validation
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered with Firebase Auth:", user);

      // Send email verification if user object exists
      if (user) {
        await sendEmailVerification(user);
        setSuccessMessage("Registration successful! A verification email has been sent to your email address. Please check your inbox (and spam folder) and click the link to verify your email.");
        console.log("Verification email sent.");

        // Create a user document in Firestore 'users' collection
        const userDocRef = doc(db, "users", user.uid); // Use user's UID as document ID
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: 'user', // Default role for new users
          createdAt: serverTimestamp(),
          emailVerified: user.emailVerified, // Store initial verification status (will be false)
        });
        console.log("User document created in Firestore 'users' collection");
      }
      
      setLoading(false);
      // Do not navigate immediately; let the user see the successMessage.
      // User will typically log in after verifying their email.
      // navigate('/login'); // Or navigate to a page that says "Please check your email"
      
    } catch (err) {
      console.error("Error registering user or sending verification email:", err);
      setError(err.message); 
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Create Account</h1>
        
        {/* Display success/info messages */}
        {successMessage && (
          <div className="p-3 my-2 text-sm text-center text-green-700 bg-green-100 rounded-md">
            {successMessage}
            <p className="mt-2">After verifying, you can <Link to="/login" className="font-semibold text-green-800 hover:underline">sign in</Link>.</p>
          </div>
        )}
        {/* Display error messages */}
        {error && <p className="p-3 my-2 text-sm text-center text-red-700 bg-red-100 rounded-md">{error}</p>}

        {/* Hide form after successful registration and message display */}
        {!successMessage && (
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="•••••••• (min. 6 characters)"
              />
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
        
        {/* Link to Login Page - shown if form is visible or if no success message */}
        {!successMessage && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;