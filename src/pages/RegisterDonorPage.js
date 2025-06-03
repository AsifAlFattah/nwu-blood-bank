// src/pages/RegisterDonorPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Ensure this is correctly imported
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

function RegisterDonorPage() {
  // Destructure isEmailVerified from useAuth
  const { currentUser, isEmailVerified } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    universityId: '',
    universityRole: '',
    department: '',
    bloodGroup: '',
    contactNumber: '',
    isAvailable: true,
    lastDonationDate: '',
    allowContactVisibility: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // No need for successMessage here as we navigate away on success

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const universityRoles = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty (Teacher/Professor)' },
    { value: 'staff', label: 'Staff / Employee' },
  ];

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
    
    if (!currentUser) {
      setError("You must be logged in to register as a donor.");
      return;
    }

    // NEW: Check if email is verified
    if (!isEmailVerified) {
      setError("Please verify your email address before registering as a donor. Check your inbox for a verification link.");
      return;
    }

    setLoading(true); // Set loading true only after passing initial checks

    // Form validation
    if (!formData.fullName || !formData.universityId || !formData.universityRole || !formData.department || !formData.bloodGroup || !formData.contactNumber) {
      setError("Please fill in all required fields: Full Name, University ID, Role, Department, Blood Group, and Contact Number.");
      setLoading(false);
      return;
    }

    try {
      // Check if user is already registered as a donor
      const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(donorQuery);
      if (!querySnapshot.empty) {
        setError("You are already registered as a donor.");
        setLoading(false);
        return;
      }

      // Save donor information to Firestore
      await addDoc(collection(db, "donors"), {
        userId: currentUser.uid,
        email: currentUser.email, 
        fullName: formData.fullName,
        universityId: formData.universityId,
        universityRole: formData.universityRole,
        department: formData.department,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber,
        isAvailable: formData.isAvailable,
        lastDonationDate: formData.lastDonationDate,
        allowContactVisibility: formData.allowContactVisibility,
        isVerified: false, // Admin verification status
        isProfileActive: true, // Admin can deactivate profile later
        registeredAt: serverTimestamp(),
      });

      console.log("Donor registered successfully!");
      // Optionally, show an on-page success message before navigating
      // For now, directly navigate
      setLoading(false);
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Error registering donor: ", err);
      setError("Failed to register donor. Please try again. " + err.message);
      setLoading(false);
    }
  };

  // If user is logged in but email is not verified, show a message instead of the form
  // This provides a clearer UX than just disabling the button.
  if (currentUser && !isEmailVerified) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-red-600 mb-4">Email Verification Required</h1>
                <p className="text-gray-700 mb-2">
                    Please verify your email address to register as a donor.
                </p>
                <p className="text-gray-600 text-sm">
                    A verification link was sent to <strong>{currentUser.email}</strong> when you created your account.
                    If you haven't received it, check your spam folder or use the "Resend Email" option in the banner at the top of the page (if available).
                </p>
            </div>
        </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Register as a Blood Donor</h1>
        
        {/* Display error messages */}
        {error && <p className="p-3 my-2 text-sm text-center text-red-700 bg-red-100 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          {/* University ID */}
          <div>
            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">University ID (Student/Employee ID)</label>
            <input type="text" name="universityId" id="universityId" required value={formData.universityId} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          {/* University Role */}
          <div>
            <label htmlFor="universityRole" className="block text-sm font-medium text-gray-700">Your Role at University</label>
            <select name="universityRole" id="universityRole" required value={formData.universityRole} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
              <option value="">Select Role</option>
              {universityRoles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department / Faculty Name</label>
            <input type="text" name="department" id="department" required value={formData.department} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          {/* Blood Group */}
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select name="bloodGroup" id="bloodGroup" required value={formData.bloodGroup} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input type="tel" name="contactNumber" id="contactNumber" required value={formData.contactNumber} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          {/* Last Donation Date */}
          <div>
            <label htmlFor="lastDonationDate" className="block text-sm font-medium text-gray-700">Last Donation Date (Optional)</label>
            <input type="date" name="lastDonationDate" id="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          {/* Availability Checkbox */}
          <div className="flex items-center">
            <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleChange}
                   className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Currently available to donate</label>
          </div>

          {/* Contact Visibility Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
                <input 
                    type="checkbox" 
                    name="allowContactVisibility" 
                    id="allowContactVisibility" 
                    checked={formData.allowContactVisibility} 
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="allowContactVisibility" className="font-medium text-gray-700">Make contact number visible?</label>
                <p className="text-xs text-gray-500">Check this if you consent to your contact number being shown to logged-in users searching for donors.</p>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button 
                type="submit" 
                // Button is disabled if loading OR if email is not verified
                disabled={loading || (currentUser && !isEmailVerified)} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={currentUser && !isEmailVerified ? "Please verify your email to register as a donor." : ""}
            >
              {loading ? 'Submitting...' : 'Register as Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterDonorPage;