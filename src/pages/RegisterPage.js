// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import { auth } from '../firebase'; 
import { createUserWithEmailAndPassword } from "firebase/auth";

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setError(null); 
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
      console.log("User registered successfully:", userCredential.user);
      // Note: Additional user profile information (name, blood group etc.) 
      // would typically be saved to Firestore in a separate step after successful auth registration.
      setLoading(false);
      navigate('/dashboard'); // Redirect after successful registration
    } catch (err) {
      console.error("Error registering user:", err);
      setError(err.message); // Display Firebase error message
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Create Account</h1>
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
              placeholder="•••••••• (min. 6 characters)" // Added hint for password length
            />
          </div>

          {/* Displays registration error messages */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              // Updated button classes for primary action (blue)
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        {/* Link to Login Page */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          {/* Changed <a> to <Link> for client-side navigation */}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;