// src/pages/admin/AdminOverviewPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom'; // Import Link

function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalUsers: 0,
    activeRequests: 0,
    fulfilledRequests: 0,
    cancelledRequests: 0, // NEW: Cancelled Requests
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

        // Get total users (from 'users' collection)
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

        // NEW: Get cancelled requests count
        const cancelledRequestsQuery = query(collection(db, "bloodRequests"), where("status", "==", "cancelled"));
        const cancelledRequestsSnapshot = await getCountFromServer(cancelledRequestsQuery);
        const cancelledRequestsCount = cancelledRequestsSnapshot.data().count;

        setStats({
          totalDonors: totalDonorsCount,
          totalUsers: totalUsersCount,
          activeRequests: activeRequestsCount,
          fulfilledRequests: fulfilledRequestsCount,
          cancelledRequests: cancelledRequestsCount, // NEW
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

  // Reusable StatCard component
  const StatCard = ({ title, value, to, bgColorClass = 'bg-white', textColorClass = 'text-red-600' }) => (
    <Link to={to} className={`block p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow ${bgColorClass}`}>
        <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
            <p className={`text-4xl font-bold ${textColorClass}`}>{value}</p>
        </div>
    </Link>
  );


  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid for 5 items */}
        <StatCard title="Total Donors" value={stats.totalDonors} to="/admin/donors" textColorClass="text-red-600" />
        <StatCard title="Registered Users" value={stats.totalUsers} to="/admin/users" textColorClass="text-red-600" />
        <StatCard title="Active Requests" value={stats.activeRequests} to="/admin/requests" textColorClass="text-blue-600" />
        <StatCard title="Fulfilled Requests" value={stats.fulfilledRequests} to="/admin/requests" textColorClass="text-green-600" />
        <StatCard title="Cancelled Requests" value={stats.cancelledRequests} to="/admin/requests" textColorClass="text-yellow-600" />
      </div>

      <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <p className="text-gray-600">
            Select a management section from the sidebar or click on the cards above to view details and perform actions.
        </p>
      </div>
    </div>
  );
}

export default AdminOverviewPage;