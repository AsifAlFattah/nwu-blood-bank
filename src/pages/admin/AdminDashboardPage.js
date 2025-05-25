// src/pages/admin/AdminDashboardPage.js
import React from 'react';

function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-red-700 mb-6">Admin Dashboard</h1>
      <p className="text-gray-700">Welcome to the Admin Control Panel.</p>
      <div className="mt-6 space-y-4">
        <p className="font-semibold">Management Sections (Coming Soon):</p>
        <ul className="list-disc list-inside pl-4">
          <li>User Management</li>
          <li>Donor Profile Management</li>
          <li>Blood Request Management</li>
          <li>Site Statistics</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboardPage;