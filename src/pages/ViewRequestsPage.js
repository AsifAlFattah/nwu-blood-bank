// src/pages/ViewRequestsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Your Firestore instance
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'; // Firestore functions
import { Link } from 'react-router-dom'; // For linking to post request page if no requests

function ViewRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestsRef = collection(db, "bloodRequests");
        // Query for active requests, ordered by most recent first
        const q = query(
          requestsRef,
          where("status", "==", "active"),
          orderBy("requestedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const activeRequests = [];
        querySnapshot.forEach((doc) => {
          activeRequests.push({ id: doc.id, ...doc.data() });
        });

        setRequests(activeRequests);
        if (activeRequests.length === 0) {
          console.log("No active blood requests found.");
        } else {
          console.log("Fetched active requests:", activeRequests);
        }
      } catch (err) {
        console.error("Error fetching active blood requests: ", err);
        setError("Failed to fetch blood requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRequests();
  }, []); // Empty dependency array to run once on mount

  // Helper function to format Firestore Timestamp
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'Date not available';
  };

  // Helper function to get urgency label
  const getUrgencyLabel = (urgencyValue) => {
    const urgencyMap = {
        'urgent': 'Urgent (Immediate Need)',
        'moderate': 'Moderate (Within 24-48 hours)',
        'low': 'Low (Planned / Stock Up)'
    };
    return urgencyMap[urgencyValue] || urgencyValue;
  };


  if (loading) {
    return <p className="p-4 text-center text-gray-600">Loading active blood requests...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-8">Active Blood Requests</h1>

        {requests.length === 0 ? (
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ViewRequestsPage;