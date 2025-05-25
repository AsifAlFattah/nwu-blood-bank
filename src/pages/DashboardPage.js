// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate is imported but not used, can be removed if not needed
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Keep if you plan to add navigation from here, e.g. after an action

  // States for Donor Profile section
  const [isDonor, setIsDonor] = useState(false);
  const [donorData, setDonorData] = useState(null);
  const [loadingDonorStatus, setLoadingDonorStatus] = useState(true);

  // States for "My Posted Blood Requests" section
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(true);
  const [errorMyRequests, setErrorMyRequests] = useState(null); // For errors fetching requests
  const [actionError, setActionError] = useState(null); // <--- NEW: For errors from update/delete actions on this page

  const fetchUserSpecificData = async () => {
    if (!currentUser) {
      setLoadingDonorStatus(false);
      setLoadingMyRequests(false);
      // Clear data if no user
      setIsDonor(false);
      setDonorData(null);
      setMyRequests([]);
      setErrorMyRequests(null);
      setActionError(null);
      return;
    }

    setActionError(null); // Clear previous action errors on new fetch

    // Fetch Donor Status
    setLoadingDonorStatus(true);
    const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
    try {
      const querySnapshot = await getDocs(donorQuery);
      if (!querySnapshot.empty) {
        setIsDonor(true);
        setDonorData(querySnapshot.docs[0].data());
      } else {
        setIsDonor(false);
        setDonorData(null);
      }
    } catch (error) {
      console.error("Error checking donor status:", error);
      // setErrorMyRequests or a new error state for donor status could be set here
    } finally {
      setLoadingDonorStatus(false);
    }

    // Fetch User's Blood Requests
    setLoadingMyRequests(true);
    setErrorMyRequests(null); // Clear fetch error for requests
    const requestsQuery = query(
      collection(db, "bloodRequests"),
      where("userId", "==", currentUser.uid),
      orderBy("requestedAt", "desc")
    );
    try {
      const querySnapshot = await getDocs(requestsQuery);
      const userRequests = [];
      querySnapshot.forEach((doc) => {
        userRequests.push({ id: doc.id, ...doc.data() });
      });
      setMyRequests(userRequests);
    } catch (error) {
      console.error("Error fetching user's blood requests:", error);
      setErrorMyRequests("Failed to load your blood requests. (Ensure Firestore indexes are created if prompted in console)");
    } finally {
      setLoadingMyRequests(false);
    }
  };

  useEffect(() => {
    fetchUserSpecificData();
  }, [currentUser]);


  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    setActionError(null); // Clear previous action error
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await updateDoc(requestDocRef, { status: newStatus });
      fetchUserSpecificData(); // Refresh data
    } catch (err) {
      console.error(`Error updating request status for ${requestId}: `, err);
      setActionError(`Failed to update request status. Please try again.`); // Set on-page error
    }
  };

  const handleDeleteRequest = async (requestId) => {
    setActionError(null); // Clear previous action error
    if (!window.confirm("Are you sure you want to permanently delete this blood request? This action cannot be undone.")) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await deleteDoc(requestDocRef);
      console.log(`Request ${requestId} deleted successfully from dashboard.`);
      fetchUserSpecificData(); // Re-fetch user data to update the list
    } catch (err) {
      console.error(`Error deleting request ${requestId} from dashboard: `, err);
      setActionError(`Failed to delete blood request. Please try again.`); // Set on-page error
    }
  };

  // Helper functions
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  const getUrgencyLabel = (urgencyValue) => { 
    const urgencyMap = {
        'urgent': 'Urgent',
        'moderate': 'Moderate',
        'low': 'Low'
    };
    return urgencyMap[urgencyValue] || urgencyValue.charAt(0).toUpperCase() + urgencyValue.slice(1);
  };

  const getStatusClass = (status) => {
    switch (status) {
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'fulfilled': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Combined loading state for initial display
  if (loadingDonorStatus && loadingMyRequests && !currentUser) { 
    return <p className="p-4 text-center">Loading user data...</p>;
  }
  if (!currentUser && !loadingDonorStatus && !loadingMyRequests) { 
    return <p className="p-4 text-center">Please log in to view your dashboard.</p>;
  }
  // If currentUser is loaded, but other data is still loading for the first time
  if (currentUser && (loadingDonorStatus || loadingMyRequests) && (donorData === null && myRequests.length === 0) ) {
     return <p className="p-4 text-center">Loading dashboard data...</p>;
  }


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Donor Status Section */}
      <section className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-red-700 mb-4">My Donor Profile</h2>
        {loadingDonorStatus ? (
          <p>Loading donor status...</p>
        ) : isDonor && donorData ? (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-green-700">You are a Registered Donor!</h3>
                <Link 
                to="/edit-donor-profile" 
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg shadow"
                >
                Edit Profile
                </Link>
            </div>
            <p><strong>Name:</strong> {donorData.fullName}</p>
            <p><strong>Blood Group:</strong> <span className="font-bold text-red-600">{donorData.bloodGroup}</span></p>
            <p><strong>Availability:</strong> {donorData.isAvailable ? "Available" : "Not Currently Available"}</p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <p className="mb-3 text-gray-700">You are not yet registered as a blood donor.</p>
            <Link
              to="/register-donor"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
            >
              Become a Blood Donor Now
            </Link>
          </div>
        )}
      </section>

      {/* My Blood Requests Section */}
      <section className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-red-700">My Posted Blood Requests</h2>
            <Link 
                to="/post-request" 
                className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg shadow"
            >
                Post New Request
            </Link>
        </div>

        {/* Display action error messages for this section */}
        {actionError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {actionError}
            <button 
              onClick={() => setActionError(null)} 
              className="ml-4 px-2 py-0.5 text-xs bg-red-200 hover:bg-red-300 rounded-md font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {loadingMyRequests ? (
          <p>Loading your requests...</p>
        ) : errorMyRequests ? ( // This is for fetch errors
          <p className="text-red-500 text-center">{errorMyRequests}</p>
        ) : myRequests.length === 0 ? (
          <p className="text-gray-600 text-center">You have not posted any blood requests yet.</p>
        ) : (
          <ul className="space-y-4">
            {myRequests.map(req => (
              <li key={req.id} className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-medium text-gray-800">
                        Patient: {req.patientName} (Need: <span className="font-semibold text-red-600">{req.requiredBloodGroup}</span>)
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                </div>
                <p className="text-sm text-gray-600">Hospital: {req.hospitalName}</p>
                <p className="text-sm text-gray-600">Urgency: {getUrgencyLabel(req.urgency)}</p>
                <p className="text-xs text-gray-500 mt-1">Requested: {formatDate(req.requestedAt)}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    {req.status === 'active' && (
                        <>
                            <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'fulfilled')}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm"
                            >
                                Mark Fulfilled
                            </button>
                            <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'cancelled')}
                                className="px-3 py-1 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm"
                            >
                                Mark Cancelled
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => handleDeleteRequest(req.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-700 rounded-md shadow-sm"
                    >
                        Delete Request
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;