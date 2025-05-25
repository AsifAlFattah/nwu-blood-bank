// src/pages/admin/AdminOverviewPage.js
import React from 'react';

function AdminOverviewPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Overview</h2>
      <p className="text-gray-600">Welcome to the admin area. Select a management section from the sidebar.</p>
      {/* Statistics or quick summary can go here later */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Donors</h3>
            <p className="text-3xl font-bold text-red-600">_</p> {/* Placeholder for actual data */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Active Requests</h3>
            <p className="text-3xl font-bold text-red-600">_</p> {/* Placeholder for actual data */}
        </div>
        {/* Add more summary cards as needed */}
      </div>
    </div>
  );
}

export default AdminOverviewPage;