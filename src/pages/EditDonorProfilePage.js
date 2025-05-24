// src/pages/EditDonorProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

function EditDonorProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    bloodGroup: '',
    contactNumber: '',
    isAvailable: true,
    lastDonationDate: '',
  });
  const [donorDocId, setDonorDocId] = useState(null); // To store the ID of the donor document
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null); // For form-specific validation errors
  const [successMessage, setSuccessMessage] = useState('');


  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch existing donor data
  useEffect(() => {
    const fetchDonorData = async () => {
      if (currentUser) {
        setLoading(true);
        setError(null);
        const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
        try {
          const querySnapshot = await getDocs(donorQuery);
          if (!querySnapshot.empty) {
            const donorDoc = querySnapshot.docs[0];
            setDonorDocId(donorDoc.id); // Store the document ID
            const data = donorDoc.data();
            setFormData({
              fullName: data.fullName || '',
              bloodGroup: data.bloodGroup || '',
              contactNumber: data.contactNumber || '',
              isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
              lastDonationDate: data.lastDonationDate || '',
            });
          } else {
            setError("No donor profile found. Please register as a donor first.");
            // Optionally redirect if no donor profile exists
            // navigate('/register-donor');
          }
        } catch (err) {
          console.error("Error fetching donor data:", err);
          setError("Failed to fetch donor data.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDonorData();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage('');
    setLoading(true);

    if (!donorDocId) {
      setFormError("Donor profile not found. Cannot update.");
      setLoading(false);
      return;
    }

    if (!formData.fullName || !formData.bloodGroup || !formData.contactNumber) {
      setFormError("Please fill in all required fields: Full Name, Blood Group, and Contact Number.");
      setLoading(false);
      return;
    }

    try {
      const donorDocRef = doc(db, "donors", donorDocId);
      await updateDoc(donorDocRef, {
        // We only update fields that are part of the form
        fullName: formData.fullName,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber,
        isAvailable: formData.isAvailable,
        lastDonationDate: formData.lastDonationDate,
        // userId and email should generally not be updated here
        // registeredAt also should remain as is
      });
      setSuccessMessage("Profile updated successfully!");
      console.log("Donor profile updated!");
      setLoading(false);
      // Optionally navigate back to dashboard after a delay
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Error updating donor profile:", err);
      setFormError("Failed to update profile. " + err.message);
      setLoading(false);
    }
  };

  if (loading && !donorDocId) { // Initial loading of donor data
    return <p className="p-4 text-center">Loading donor profile...</p>;
  }

  if (error) { // Error fetching initial data
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  if (!donorDocId && !loading) { // No donor profile found after loading attempt
     return (
        <div className="p-4 text-center">
            <p className="text-red-600">No donor profile found to edit.</p>
            <button onClick={() => navigate('/register-donor')} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
                Register as Donor
            </button>
        </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-start min-h-screen-nav bg-gray-100 p-4 pt-10">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Edit Donor Profile</h1>

        {successMessage && <p className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-md text-center">{successMessage}</p>}
        {formError && <p className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-md text-center">{formError}</p>}

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

          <div>
            <button type="submit" disabled={loading && donorDocId} // disable if submitting update
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
              {loading && donorDocId ? 'Updating Profile...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-red-600 hover:text-red-500">
                Back to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
}

export default EditDonorProfilePage;