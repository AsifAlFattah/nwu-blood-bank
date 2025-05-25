// src/pages/admin/AdminRequestsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust path if necessary
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner'; // Adjust path
// We might need useAuth if admins can also be regular users and we want to avoid showing their own management buttons here, but for now, not strictly needed for just viewing.
// import { useAuth } from '../../AuthContext'; 

function AdminRequestsPage() {
  // const { currentUser } = useAuth(); // Only needed if actions are specific to current admin identity vs general admin powers
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // For errors from admin actions later

  // Helper function to format Firestore Timestamp
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  // Helper function to get urgency label
  const getUrgencyLabel = (urgencyValue) => {
    const urgencyMap = {
        'urgent': 'Urgent',
        'moderate': 'Moderate',
        'low': 'Low'
    };
    return urgencyMap[urgencyValue] || (urgencyValue ? urgencyValue.charAt(0).toUpperCase() + urgencyValue.slice(1) : 'N/A');
  };

  // Helper function to get Tailwind classes for styling request status badges
  const getStatusClass = (status) => {
    switch (status) {
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'fulfilled': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const requestsRef = collection(db, "bloodRequests");
      // Query for all requests, ordered by most recent first
      const q = query(requestsRef, orderBy("requestedAt", "desc"));

      const querySnapshot = await getDocs(q);
      const requestsList = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() });
      });

      setAllRequests(requestsList);
      console.log("Fetched all blood requests:", requestsList);
    } catch (err) {
      console.error("Error fetching all blood requests: ", err);
      setError("Failed to fetch blood requests. Please try again. (Ensure Firestore indexes are created if prompted in console)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []); // Runs once on component mount

  // Handler functions for Admin actions (can be built out further)
  const handleAdminUpdateRequestStatus = async (requestId, newStatus) => {
    setActionError(null);
    if (!window.confirm(`Admin: Are you sure you want to mark request ${requestId} as ${newStatus}?`)) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await updateDoc(requestDocRef, { status: newStatus });
      fetchAllRequests(); // Refresh the list
    } catch (err) {
      console.error(`Admin: Error updating request status for ${requestId}: `, err);
      setActionError(`Failed to update status for request ${requestId}.`);
    }
  };

  const handleAdminDeleteRequest = async (requestId) => {
    setActionError(null);
    if (!window.confirm(`Admin: Are you sure you want to PERMANENTLY DELETE request ${requestId}? This cannot be undone.`)) {
      return;
    }
    try {
      const requestDocRef = doc(db, "bloodRequests", requestId);
      await deleteDoc(requestDocRef);
      console.log(`Admin: Request ${requestId} deleted successfully.`);
      fetchAllRequests(); // Refresh the list
    } catch (err) {
      console.error(`Admin: Error deleting request ${requestId}: `, err);
      setActionError(`Failed to delete request ${requestId}.`);
    }
  };


  if (loading) {
    return <LoadingSpinner message="Loading all blood requests..." size="lg" />;
  }

  if (error) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage All Blood Requests</h2>
        {/* TODO: Add filters or search for requests later */}
      </div>

      {actionError && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {actionError}
            <button onClick={() => setActionError(null)} className="ml-4 px-2 py-0.5 text-xs bg-red-200 hover:bg-red-300 rounded-md font-semibold">Dismiss</button>
        </div>
      )}

      {allRequests.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No blood requests found in the system.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By (Email)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{req.patientName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">{req.requiredBloodGroup}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{req.unitsRequired}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{req.hospitalName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getUrgencyLabel(req.urgency)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{req.userEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(req.requestedAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    {req.status === 'active' && (
                        <>
                            <button onClick={() => handleAdminUpdateRequestStatus(req.id, 'fulfilled')} className="text-green-600 hover:text-green-900">Fulfill</button>
                            <button onClick={() => handleAdminUpdateRequestStatus(req.id, 'cancelled')} className="text-yellow-600 hover:text-yellow-900">Cancel</button>
                        </>
                    )}
                    <button onClick={() => handleAdminDeleteRequest(req.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRequestsPage;