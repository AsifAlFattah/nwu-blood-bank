// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase'; // Your Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';

function DashboardPage() {
  const { currentUser } = useAuth();
  const [isDonor, setIsDonor] = useState(false);
  const [donorData, setDonorData] = useState(null); // To store donor-specific data if found
  const [loadingDonorStatus, setLoadingDonorStatus] = useState(true);

  useEffect(() => {
    const checkDonorStatus = async () => {
      if (currentUser) {
        setLoadingDonorStatus(true);
        const donorQuery = query(collection(db, "donors"), where("userId", "==", currentUser.uid));
        try {
          const querySnapshot = await getDocs(donorQuery);
          if (!querySnapshot.empty) {
            // User is a donor
            setIsDonor(true);
            // Get the first document (should be only one per user)
            const docData = querySnapshot.docs[0].data();
            setDonorData(docData); 
            console.log("User is a registered donor:", docData);
          } else {
            // User is not a donor
            setIsDonor(false);
            setDonorData(null);
            console.log("User is not a registered donor.");
          }
        } catch (error) {
          console.error("Error checking donor status:", error);
          // Handle error appropriately, maybe set an error state
        } finally {
          setLoadingDonorStatus(false);
        }
      } else {
        // No current user, so not a donor and not loading
        setIsDonor(false);
        setDonorData(null);
        setLoadingDonorStatus(false);
      }
    };

    checkDonorStatus();
  }, [currentUser]); // Re-run this effect if currentUser changes

  if (!currentUser) {
    // This should ideally be handled by ProtectedRoute, but as a fallback
    return <p className="p-4">Please log in to view your dashboard.</p>;
  }

  if (loadingDonorStatus) {
    return <p className="p-4 text-center">Loading your donor status...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-red-700 mb-6">Dashboard</h1>
      <p className="mb-4 text-lg text-gray-700">Welcome, {currentUser.email}!</p>

      {isDonor ? (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Thank You for Being a Donor!</h2>
          {donorData && (
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {donorData.fullName}</p>
              <p><strong>Blood Group:</strong> <span className="font-bold text-red-600">{donorData.bloodGroup}</span></p>
              <p><strong>Contact:</strong> {donorData.contactNumber}</p>
              <p><strong>Availability:</strong> {donorData.isAvailable ? "Available" : "Not Currently Available"}</p>
              {donorData.lastDonationDate && <p><strong>Last Donated:</strong> {donorData.lastDonationDate}</p>}
            </div>
          )}
          {/* TODO: Add a link to "Edit Donor Profile" page here later */}
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <p className="mb-3 text-gray-700">You are not yet registered as a blood donor.</p>
          <Link
            to="/register-donor"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition duration-150 ease-in-out"
          >
            Become a Blood Donor Now
          </Link>
        </div>
      )}
      {/* More dashboard content can go here */}
    </div>
  );
}

export default DashboardPage;