// src/pages/RegisterDonorPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // To get current user's UID
import { db } from '../firebase'; // Your Firestore instance
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

function RegisterDonorPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    bloodGroup: '', // e.g., A+, O-, AB+
    contactNumber: '',
    isAvailable: true, // Default to available
    lastDonationDate: '', // Optional
    // We can add contactVisibility later if needed
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!currentUser) {
      setError("You must be logged in to register as a donor.");
      setLoading(false);
      return;
    }

    if (!formData.fullName || !formData.bloodGroup || !formData.contactNumber) {
      setError("Please fill in all required fields: Full Name, Blood Group, and Contact Number.");
      setLoading(false);
      return;
    }

    try {
      // Optional: Check if user is already a donor to prevent duplicate entries
      const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(donorQuery);
      if (!querySnapshot.empty) {
        setError("You are already registered as a donor.");
        setLoading(false);
        // Optionally, redirect to a donor profile page or dashboard
        // navigate('/donor-profile'); 
        return;
      }

      // Add donor information to Firestore
      await addDoc(collection(db, "donors"), {
        userId: currentUser.uid, // Link donor profile to the authenticated user
        email: currentUser.email, // Store user's email for convenience
        ...formData,
        registeredAt: serverTimestamp(), // Timestamp of registration
      });

      console.log("Donor registered successfully!");
      setLoading(false);
      // TODO: Add a success message/toast
      navigate('/dashboard'); // Redirect to dashboard or a confirmation page
    } catch (err) {
      console.error("Error registering donor: ", err);
      setError("Failed to register donor. Please try again. " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Register as a Blood Donor</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select name="bloodGroup" id="bloodGroup" required value={formData.bloodGroup} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input type="tel" name="contactNumber" id="contactNumber" required value={formData.contactNumber} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="lastDonationDate" className="block text-sm font-medium text-gray-700">Last Donation Date (Optional)</label>
            <input type="date" name="lastDonationDate" id="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleChange}
                   className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Currently available to donate</label>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Register as Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterDonorPage;