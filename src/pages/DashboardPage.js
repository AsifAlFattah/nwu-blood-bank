// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore'; // Added orderBy, doc, updateDoc

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // For navigation if needed

  // State for donor status (existing)
  const [isDonor, setIsDonor] = useState(false);
  const [donorData, setDonorData] = useState(null);
  const [loadingDonorStatus, setLoadingDonorStatus] = useState(true);

  // State for user's blood requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(true);
  const [errorMyRequests, setErrorMyRequests] = useState(null);

  const fetchUserSpecificData = async () => { // Combined fetching function
    if (!currentUser) {
      setLoadingDonorStatus(false);
      setLoadingMyRequests(false);
      return;
    }

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
    } finally {
      setLoadingDonorStatus(false);
    }

    // Fetch User's Blood Requests
    setLoadingMyRequests(true);
    setErrorMyRequests(null);
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
      setErrorMyRequests("Failed to load your blood requests.");
    } finally {
      setLoadingMyRequests(false);
    }
  };

  useEffect(() => {
    fetchUserSpecificData();
  }, [currentUser]);


  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    // This function is similar to the one in ViewRequestsPage
    // Consider abstracting it if used in many places, or keep it here for now
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await updateDoc(requestDocRef, {
        status: newStatus
      });
      // Refresh data after update
      fetchUserSpecificData(); 
    } catch (err) {
      console.error(`Error updating request status for ${requestId}: `, err);
      alert(`Failed to update request status. Please try again.`);
    }
  };

  // Helper functions (can be moved to a utils file later if needed)
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };
  const getUrgencyLabel = (urgencyValue) => { /* ... same as in ViewRequestsPage ... */ 
    const urgencyMap = {
        'urgent': 'Urgent',
        'moderate': 'Moderate',
        'low': 'Low'
    };
    return urgencyMap[urgencyValue] || urgencyValue;
  };
  const getStatusClass = (status) => {
    switch (status) {
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'fulfilled': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (!currentUser) {
    return <p className="p-4">Loading user information...</p>; // Or redirect via ProtectedRoute
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
        {loadingMyRequests ? (
          <p>Loading your requests...</p>
        ) : errorMyRequests ? (
          <p className="text-red-500">{errorMyRequests}</p>
        ) : myRequests.length === 0 ? (
          <p className="text-gray-600">You have not posted any blood requests yet.</p>
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
                {req.status === 'active' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
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
                    </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;