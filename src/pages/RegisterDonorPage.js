// src/pages/RegisterDonorPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

function RegisterDonorPage() {
  const { currentUser, isEmailVerified } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    universityId: '',
    universityRole: '',
    department: '',
    bloodGroup: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    isAvailable: true,
    lastDonationDate: '',
    allowContactVisibility: true, 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genderOptions = ["Male", "Female"];

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        setLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFormData(prevData => ({
              ...prevData,
              fullName: userData.fullName || '',
              universityId: userData.universityId || '',
              department: userData.department || '', 
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Could not load your profile data. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

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
    
    if (!isEmailVerified) {
      setError("Please verify your email address before registering as a donor.");
      return;
    }

    setLoading(true);

    if (!formData.fullName || !formData.universityId || !formData.department || !formData.bloodGroup || !formData.contactNumber || !formData.dateOfBirth || !formData.gender) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(donorQuery);
      if (!querySnapshot.empty) {
        setError("You are already registered as a donor.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "donors"), {
        userId: currentUser.uid,
        email: currentUser.email, 
        fullName: formData.fullName,
        universityId: formData.universityId,
        universityRole: formData.universityRole,
        department: formData.department,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        isAvailable: formData.isAvailable,
        lastDonationDate: formData.lastDonationDate,
        allowContactVisibility: formData.allowContactVisibility,
        isVerified: false,
        isProfileActive: true,
        registeredAt: serverTimestamp(),
      });

      console.log("Donor registered successfully!");
      setLoading(false);
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Error registering donor: ", err);
      setError("Failed to register donor. Please try again. " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." size="lg" />;
  }
  
  if (currentUser && !isEmailVerified) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-red-600 mb-4">Email Verification Required</h1>
                <p className="text-gray-700">
                    Please verify your email address to register as a donor.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-nav bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Become a Blood Donor</h1>
        <p className="text-center text-sm text-gray-600">
          Your details from registration have been pre-filled. Please complete the remaining fields.
        </p>
        
        {error && <p className="p-3 my-2 text-sm text-center text-red-700 bg-red-100 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pre-filled fields */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">University ID (Student/Employee ID)</label>
            <input type="text" name="universityId" id="universityId" required value={formData.universityId} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department / Position</label>
            <input type="text" name="department" id="department" required value={formData.department} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>
          
          {/* New and existing donor-specific fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="dateOfBirth" id="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" id="gender" required value={formData.gender} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
                  <option value="">Select Gender</option>
                  {genderOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div>
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isEmailVerified ? "Please verify your email to register as a donor." : ""}
            >
              {loading ? 'Submitting...' : 'Complete Donor Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterDonorPage;