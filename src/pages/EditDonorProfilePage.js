// src/pages/EditDonorProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

function EditDonorProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    // University specific fields
    universityId: '',        // NEW
    universityRole: '',      // NEW
    department: '',          // NEW
    // Existing fields
    bloodGroup: '',
    contactNumber: '',
    isAvailable: true,
    lastDonationDate: '',
    allowContactVisibility: false,
  });
  const [donorDocId, setDonorDocId] = useState(null);
  const [loading, setLoading] = useState(true); // For initial data load
  const [updating, setUpdating] = useState(false); // For submission load
  const [error, setError] = useState(null); // For data fetching errors
  const [formError, setFormError] = useState(null); // For form submission errors
  const [successMessage, setSuccessMessage] = useState('');

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const universityRoles = [ // NEW: Options for the role dropdown
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty (Teacher/Professor)' },
    { value: 'staff', label: 'Staff / Employee' },
  ];

  // Fetches existing donor data when component mounts or currentUser changes
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
            setDonorDocId(donorDoc.id);
            const data = donorDoc.data();
            // Set form data with fetched values, including new university fields
            setFormData({
              fullName: data.fullName || '',
              universityId: data.universityId || '',        // NEW
              universityRole: data.universityRole || '',      // NEW
              department: data.department || '',          // NEW
              bloodGroup: data.bloodGroup || '',
              contactNumber: data.contactNumber || '',
              isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
              lastDonationDate: data.lastDonationDate || '',
              allowContactVisibility: data.allowContactVisibility !== undefined ? data.allowContactVisibility : false,
            });
          } else {
            setError("No donor profile found to edit. Please register as a donor first.");
          }
        } catch (err) {
          console.error("Error fetching donor data:", err);
          setError("Failed to fetch donor data. (Ensure Firestore indexes are created if prompted in console)");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("You must be logged in to edit a donor profile.");
      }
    };
    fetchDonorData();
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
    setFormError(null);
    setSuccessMessage('');
    setUpdating(true);

    if (!donorDocId) {
      setFormError("Donor profile not found. Cannot update.");
      setUpdating(false);
      return;
    }

    // Updated validation to include new required university fields
    if (!formData.fullName || !formData.universityId || !formData.universityRole || !formData.department || !formData.bloodGroup || !formData.contactNumber) {
      setFormError("Please fill in all required fields: Full Name, University ID, Role, Department, Blood Group, and Contact Number.");
      setUpdating(false);
      return;
    }

    try {
      const donorDocRef = doc(db, "donors", donorDocId);
      // Include new university fields in the data to update
      await updateDoc(donorDocRef, {
        fullName: formData.fullName,
        universityId: formData.universityId,        // NEW
        universityRole: formData.universityRole,    // NEW
        department: formData.department,            // NEW
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber,
        isAvailable: formData.isAvailable,
        lastDonationDate: formData.lastDonationDate,
        allowContactVisibility: formData.allowContactVisibility,
        // registeredAt and email typically don't change on profile edit
      });
      setSuccessMessage("Profile updated successfully!");
      console.log("Donor profile updated!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000); 
    } catch (err) {
      console.error("Error updating donor profile:", err);
      setFormError("Failed to update profile. " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Initial loading display
  if (loading) { 
    return <LoadingSpinner message="Loading donor profile..." size="lg" />;
  }

  // Error display if fetching data failed
  if (error) { 
    return (
        <div className="p-4 text-center">
            <p className="text-red-600">{error}</p>
            {error.includes("No donor profile found") && (
                 <button onClick={() => navigate('/register-donor')} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
                    Register as Donor
                </button>
            )}
             <button onClick={() => navigate('/dashboard')} className="mt-4 ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                Back to Dashboard
            </button>
        </div>
    );
  }
  
  // If no donor document ID found after loading (and no error occurred to show above)
  if (!donorDocId && !loading && !error) { 
     return (
        <div className="p-4 text-center">
            <p className="text-gray-700">No donor profile available to edit.</p>
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
            <button type="submit" disabled={updating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {updating ? 'Updating Profile...' : 'Save Changes'}
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