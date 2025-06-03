// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`If an account exists for ${email}, a password reset link has been sent. Please check your inbox (and spam folder).`);
      setEmail(''); // Clear the email field
    } catch (err) {
      console.error("Error sending password reset email:", err);
      // Firebase often doesn't reveal if an email doesn't exist for security reasons.
      // So, a generic error or the same success message can be shown.
      // For more specific errors, you might check err.code if needed.
      setError("Failed to send password reset email. Please try again, or ensure the email is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Reset Password</h1>

        {successMessage && (
          <div className="p-3 my-2 text-sm text-center text-green-700 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-3 my-2 text-sm text-center text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Show form only if no success message, or allow resend */}
        {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Enter your account's email address
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;