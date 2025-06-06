// src/pages/ViewRequestsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function ViewRequestsPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Stores errors related to the initial fetching of requests
  const [actionError, setActionError] = useState(null); // Stores errors from user actions like updating or deleting requests

  // Fetches active blood requests from Firestore, ordered by most recent
  const fetchActiveRequests = async () => {
    setLoading(true);
    setError(null); 
    setActionError(null); // Clear any previous action errors on refresh/re-fetch
    try {
      const requestsRef = collection(db, "bloodRequests");
      const q = query(
        requestsRef,
        where("status", "==", "active"), // Only fetch active requests
        orderBy("requestedAt", "desc")  // Show newest requests first
      );
      const querySnapshot = await getDocs(q);
      const activeRequests = [];
      querySnapshot.forEach((doc) => {
        activeRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(activeRequests);
    } catch (err) {
      console.error("Error fetching active blood requests: ", err);
      setError("Failed to fetch blood requests. Please try again. (Ensure Firestore indexes are created if prompted in console).");
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch requests when the component mounts
  useEffect(() => {
    fetchActiveRequests();
  }, []); // Empty dependency array ensures this runs once on mount

  // Handles updating the status of a specific blood request
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    setActionError(null); 
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await updateDoc(requestDocRef, { status: newStatus });
      fetchActiveRequests(); // Re-fetch active requests to update the UI
    } catch (err) {
      console.error(`Error updating request status for ${requestId}: `, err);
      setActionError(`Failed to update status for request. Please try again.`);
    }
  };

  // Handles the permanent deletion of a specific blood request
  const handleDeleteRequest = async (requestId) => {
    setActionError(null);
    if (!window.confirm("Are you sure you want to permanently delete this blood request? This action cannot be undone.")) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await deleteDoc(requestDocRef);
      console.log(`Request ${requestId} deleted successfully.`);
      fetchActiveRequests(); // Re-fetch active requests to update the UI
    } catch (err) {
      console.error(`Error deleting request ${requestId}: `, err);
      setActionError(`Failed to delete blood request. Please try again.`);
    }
  };

  // Helper function to format Firestore Timestamp objects into a readable date string
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'Date not available'; // Fallback for missing or invalid timestamps
  };
  
  // Helper function to get a display-friendly label for urgency levels
  const getUrgencyLabel = (urgencyValue) => {
    const urgencyMap = {
        'urgent': 'Urgent (Immediate Need)',
        'moderate': 'Moderate (Within 24-48 hours)',
        'low': 'Low (Planned / Stock Up)'
    };
    return urgencyMap[urgencyValue] || (urgencyValue ? urgencyValue.charAt(0).toUpperCase() + urgencyValue.slice(1) : 'N/A');
  };

  // Displays a loading spinner while requests are being fetched
  if (loading) {
    return <LoadingSpinner message="Loading active blood requests..." size="lg" />;
  }

  // Displays an error message if the initial fetch fails and no requests are loaded
  if (error && requests.length === 0) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">Active Blood Requests</h1>

        {/* Displays error messages from user actions (update/delete) */}
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
        
        {/* Displays a general fetch error if present, but not if a more specific actionError is shown */}
        {error && !actionError && (
             <p className="mb-4 p-3 text-sm text-yellow-700 bg-yellow-100 rounded-md text-center">
                Note: There was an issue fetching all data: {error}
             </p>
        )}

        {/* Displays a message if no active requests are found */}
        {requests.length === 0 && !loading ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">No active blood requests at the moment.</p>
            <Link 
                to="/post-request" 
                className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition duration-150 ease-in-out"
            >
                Be the first to Post a Request
            </Link>
          </div>
        ) : (
          // Renders the list of active blood requests
          <ul className="space-y-6">
            {requests.map(req => (
              <li key={req.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-red-700 mb-1 sm:mb-0">
                        Patient: {req.patientName} (Need: <span className="font-bold">{req.requiredBloodGroup}</span>)
                    </h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full self-start
                        ${req.urgency === 'urgent' ? 'bg-red-100 text-red-800' : 
                          req.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                      {getUrgencyLabel(req.urgency)}
                    </span>
                </div>
                
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Units Required:</strong> {req.unitsRequired}</p>
                  <p><strong>Hospital:</strong> {req.hospitalName} {req.hospitalLocation && `(${req.hospitalLocation})`}</p>
                  <p><strong>Contact Person:</strong> {req.contactPerson}</p>
                  <p><strong>Contact Number:</strong> <a href={`tel:${req.contactNumber}`} className="text-blue-600 hover:underline">{req.contactNumber}</a></p>
                  {req.additionalInfo && <p><strong>Additional Info:</strong> {req.additionalInfo}</p>}
                  <p className="text-xs text-gray-500 pt-1">Requested by: {req.userEmail} on {formatDate(req.requestedAt)}</p>
                </div>

                {/* Action buttons for the owner of an active request */}
                {currentUser && currentUser.uid === req.userId && req.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleUpdateRequestStatus(req.id, 'fulfilled')}
                      className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm"
                    >
                      Mark Fulfilled
                    </button>
                    <button
                      onClick={() => handleUpdateRequestStatus(req.id, 'cancelled')}
                      className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm"
                    >
                      Mark Cancelled
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-700 rounded-md shadow-sm"
                    >
                      Delete Request
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ViewRequestsPage;