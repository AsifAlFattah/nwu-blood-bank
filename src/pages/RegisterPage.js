import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import { auth } from '../firebase'; // Import auth from your firebase.js
import { createUserWithEmailAndPassword } from "firebase/auth";

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors
    setLoading(true);

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered successfully:", userCredential.user);
      // TODO: You might want to store additional user info in Firestore here (e.g., name, blood group)
      // For now, we'll just redirect.
      setLoading(false);
      navigate('/dashboard'); // Redirect to dashboard or login page after successful registration
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
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
         {/* Optional: Link to Login Page */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;