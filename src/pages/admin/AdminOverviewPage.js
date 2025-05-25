// src/pages/admin/AdminOverviewPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust path if necessary
import { collection, query, where, getCountFromServer } from 'firebase/firestore'; // Added getCountFromServer
import LoadingSpinner from '../../components/LoadingSpinner'; // Adjust path

function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalUsers: 0, // Will count from 'users' collection
    activeRequests: 0,
    fulfilledRequests: 0,
    // Add more stats as needed
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get total donors
        const donorsCol = collection(db, "donors");
        const donorSnapshot = await getCountFromServer(donorsCol);
        const totalDonorsCount = donorSnapshot.data().count;

        // Get total users (from our 'users' collection where roles are stored)
        const usersCol = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersCol);
        const totalUsersCount = usersSnapshot.data().count;

        // Get active requests count
        const activeRequestsQuery = query(collection(db, "bloodRequests"), where("status", "==", "active"));
        const activeRequestsSnapshot = await getCountFromServer(activeRequestsQuery);
        const activeRequestsCount = activeRequestsSnapshot.data().count;

        // Get fulfilled requests count
        const fulfilledRequestsQuery = query(collection(db, "bloodRequests"), where("status", "==", "fulfilled"));
        const fulfilledRequestsSnapshot = await getCountFromServer(fulfilledRequestsQuery);
        const fulfilledRequestsCount = fulfilledRequestsSnapshot.data().count;

        setStats({
          totalDonors: totalDonorsCount,
          totalUsers: totalUsersCount,
          activeRequests: activeRequestsCount,
          fulfilledRequests: fulfilledRequestsCount,
        });

      } catch (err) {
        console.error("Error fetching statistics: ", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Runs once on component mount

  if (loading) {
    return <LoadingSpinner message="Loading overview statistics..." size="lg" />;
  }

  if (error) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card for Total Donors */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-1">Total Donors</h3>
          <p className="text-4xl font-bold text-red-600">{stats.totalDonors}</p>
        </div>

        {/* Stat Card for Total Users (from 'users' collection) */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-1">Registered Users</h3>
          <p className="text-4xl font-bold text-red-600">{stats.totalUsers}</p>
        </div>

        {/* Stat Card for Active Requests */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-1">Active Requests</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.activeRequests}</p>
        </div>

        {/* Stat Card for Fulfilled Requests */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-1">Fulfilled Requests</h3>
          <p className="text-4xl font-bold text-green-600">{stats.fulfilledRequests}</p>
        </div>
      </div>

      <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <p className="text-gray-600">
            Select a management section from the sidebar to view details and perform actions.
        </p>
        {/* You can add direct links or summaries here later */}
      </div>
    </div>
  );
}

export default AdminOverviewPage;