// src/pages/admin/AdminRequestsPage.js
import React from 'react';

function AdminRequestsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Blood Requests</h2>
      <p className="text-gray-600">Listing of all blood requests (active, fulfilled, cancelled) will appear here.</p>
      {/* TODO: Fetch and display all requests */}
    </div>
  );
}
export default AdminRequestsPage;