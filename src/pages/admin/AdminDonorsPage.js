// src/pages/admin/AdminDonorsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust path if firebase.js is elsewhere
// Ensure doc and updateDoc are imported for updating verification status
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner'; // Adjust path

function AdminDonorsPage() {
  const [allDonors, setAllDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [errorDonors, setErrorDonors] = useState(null);
  const [actionError, setActionError] = useState(null); // For feedback on actions
  const [actionSuccess, setActionSuccess] = useState(''); // For feedback on actions

  // Helper function to format Firestore Timestamp objects
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  // Helper function to get a displayable label for university roles
  const getRoleLabel = (roleValue) => {
    const roleMap = {
        'student': 'Student',
        'faculty': 'Faculty',
        'staff': 'Staff / Employee'
    };
    return roleMap[roleValue] || (roleValue ? roleValue.charAt(0).toUpperCase() + roleValue.slice(1) : 'N/A');
  };

  // Fetches all donor profiles from Firestore
  const fetchAllDonors = async () => {
    setLoadingDonors(true);
    setErrorDonors(null);
    setActionError(null); // Clear action messages on re-fetch
    setActionSuccess(''); // Clear action messages on re-fetch
    try {
      const donorsRef = collection(db, "donors");
      const q = query(donorsRef, orderBy("registeredAt", "desc")); 
      
      const querySnapshot = await getDocs(q);
      const donorsList = [];
      querySnapshot.forEach((doc) => {
        donorsList.push({ id: doc.id, ...doc.data() });
      });
      setAllDonors(donorsList);
      console.log("Fetched all donor profiles:", donorsList);
    } catch (err) {
      console.error("Error fetching all donor profiles: ", err);
      setErrorDonors("Failed to fetch donor profiles. Please try again.");
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []); // Runs once on component mount

  // Handles toggling the verification status of a donor
  const handleToggleVerification = async (donorId, currentVerifiedStatus) => {
    setActionError(null);
    setActionSuccess('');
    const newVerifiedStatus = !currentVerifiedStatus;
    if (!window.confirm(`Are you sure you want to mark this donor as ${newVerifiedStatus ? 'VERIFIED' : 'NOT VERIFIED'}?`)) {
        return;
    }
    try {
        const donorDocRef = doc(db, "donors", donorId);
        await updateDoc(donorDocRef, {
            isVerified: newVerifiedStatus // Update the isVerified field
        });
        setActionSuccess(`Donor has been successfully marked as ${newVerifiedStatus ? 'Verified' : 'Not Verified'}.`);
        fetchAllDonors(); // Refresh the list to show the updated status
    } catch (error) {
        console.error("Error updating verification status:", error);
        setActionError("Failed to update verification status. Please try again.");
    }
  };

  // Render loading state
  if (loadingDonors) {
    return <LoadingSpinner message="Loading all donor profiles..." />;
  }

  // Render error state for fetching
  if (errorDonors) {
    return <p className="text-red-500 text-center p-4">{errorDonors}</p>;
  }

  return (
    <div> {/* Removed outer p-4 md:p-6 lg:p-8 as AdminLayout provides padding */}
      {/* Changed main title of this page */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage All Donor Profiles</h2>
      
      {/* Display messages for actions like verification */}
      {actionError && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">{actionError} <button onClick={() => setActionError(null)} className="ml-2 font-semibold">Dismiss</button></div>}
      {actionSuccess && <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md text-center">{actionSuccess} <button onClick={() => setActionSuccess('')} className="ml-2 font-semibold">Dismiss</button></div>}

      {allDonors.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No donors have registered yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available (Self)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified (Admin)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Univ. ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Visible</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allDonors.map(donor => (
                <tr key={donor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{donor.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">{donor.bloodGroup}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {donor.isAvailable ? "Yes" : "No"}
                      </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center"> {/* Verified Status */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                          {donor.isVerified ? "Verified" : "Not Verified"}
                      </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{donor.universityId || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(donor.universityRole)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{donor.department || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.allowContactVisibility ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {donor.allowContactVisibility ? "Yes" : "No"}
                      </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(donor.registeredAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleToggleVerification(donor.id, donor.isVerified)}
                      className={`text-xs px-3 py-1 rounded-md shadow-sm font-semibold ${donor.isVerified ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      {donor.isVerified ? 'Mark Unverified' : 'Mark Verified'}
                    </button>
                    {/* Deactivate button will be added later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Removed the "Other Management Sections" placeholder as this page is now specific to donors */}
    </div>
  );
}

export default AdminDonorsPage;