// src/pages/admin/AdminDonorsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminDonorsPage() {
  const [allDonors, setAllDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [errorDonors, setErrorDonors] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  const getRoleLabel = (roleValue) => {
    const roleMap = {
        'student': 'Student',
        'faculty': 'Faculty',
        'staff': 'Staff / Employee'
    };
    return roleMap[roleValue] || (roleValue ? roleValue.charAt(0).toUpperCase() + roleValue.slice(1) : 'N/A');
  };

  const fetchAllDonors = async () => {
    setLoadingDonors(true);
    setErrorDonors(null);
    setActionError(null);
    setActionSuccess('');
    try {
      const donorsRef = collection(db, "donors");
      const q = query(donorsRef, orderBy("registeredAt", "desc"));
      const querySnapshot = await getDocs(q);
      const donorsList = [];
      querySnapshot.forEach((doc) => {
        donorsList.push({ id: doc.id, ...doc.data() });
      });
      setAllDonors(donorsList);
    } catch (err) {
      console.error("Error fetching all donor profiles: ", err);
      setErrorDonors("Failed to fetch donor profiles. Please try again.");
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []);

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
            isVerified: newVerifiedStatus
        });
        setActionSuccess(`Donor has been successfully marked as ${newVerifiedStatus ? 'Verified' : 'Not Verified'}.`);
        fetchAllDonors(); 
    } catch (error) {
        console.error("Error updating verification status:", error);
        setActionError("Failed to update verification status.");
    }
  };

  const handleToggleProfileActiveStatus = async (donorId, currentProfileActiveStatus) => {
    setActionError(null);
    setActionSuccess('');
    const isActiveNow = currentProfileActiveStatus === undefined ? true : currentProfileActiveStatus;
    const newProfileActiveStatus = !isActiveNow;

    if (!window.confirm(`Are you sure you want to ${newProfileActiveStatus ? 'ACTIVATE' : 'DEACTIVATE'} this donor's profile? ${newProfileActiveStatus ? '' : 'They will not appear in searches.'}`)) {
        return;
    }
    try {
        const donorDocRef = doc(db, "donors", donorId);
        await updateDoc(donorDocRef, {
            isProfileActive: newProfileActiveStatus 
        });
        setActionSuccess(`Donor profile has been successfully ${newProfileActiveStatus ? 'activated' : 'deactivated'}.`);
        fetchAllDonors();
    } catch (error) {
        console.error("Error updating donor profile active status:", error);
        setActionError("Failed to update donor profile active status.");
    }
  };

  if (loadingDonors) return <LoadingSpinner message="Loading all donor profiles..." />;
  if (errorDonors) return <p className="text-red-500 text-center p-4">{errorDonors}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage All Donor Profiles</h2>
      {actionError && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">{actionError} <button onClick={() => setActionError(null)} className="ml-2 font-semibold hover:text-red-900">Dismiss</button></div>}
      {actionSuccess && <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md text-center">{actionSuccess} <button onClick={() => setActionSuccess('')} className="ml-2 font-semibold hover:text-green-900">Dismiss</button></div>}

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
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Available (Self)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Verified (Admin)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Profile Active (Admin)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Univ. ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Contact Visible</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allDonors.map(donor => {
                // Determine the effective profile status for display and button logic,
                // treating undefined as active (true) for older records.
                const isProfileEffectivelyActive = donor.isProfileActive === undefined ? true : donor.isProfileActive;
                return (
                <tr key={donor.id} className={`hover:bg-gray-50 ${!isProfileEffectivelyActive ? 'bg-gray-100 opacity-70' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{donor.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">{donor.bloodGroup}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {donor.isAvailable ? "Yes" : "No"}
                      </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                          {donor.isVerified ? "Verified" : "Not Verified"}
                      </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isProfileEffectivelyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isProfileEffectivelyActive ? "Active" : "Inactive"}
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1"> {/* Reduced space for more buttons */}
                    <button 
                      onClick={() => handleToggleVerification(donor.id, donor.isVerified)}
                      className={`text-xs px-2 py-1 rounded-md shadow-sm font-semibold ${donor.isVerified ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                      title={donor.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                    >
                      {donor.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleToggleProfileActiveStatus(donor.id, donor.isProfileActive)}
                      className={`text-xs px-2 py-1 rounded-md shadow-sm font-semibold ${isProfileEffectivelyActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                      title={isProfileEffectivelyActive ? 'Deactivate Profile' : 'Activate Profile'}
                    >
                      {isProfileEffectivelyActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDonorsPage;