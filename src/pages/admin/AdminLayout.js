// src/components/admin/AdminLayout.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// For icons, you might install a library like Heroicons later:
// import { ChartBarIcon, UsersIcon, ClipboardListIcon, GiftIcon } from '@heroicons/react/outline'; 

function AdminLayout() {
  // Define navigation links for the admin sidebar
  const adminNavLinks = [
    { name: 'Overview', to: '/admin/overview' /* icon: ChartBarIcon */ },
    { name: 'Manage Donors', to: '/admin/donors' /* icon: GiftIcon */ },
    { name: 'Manage Requests', to: '/admin/requests' /* icon: ClipboardListIcon */ },
    { name: 'Manage Users', to: '/admin/users' }, // Placeholder for future user management
  ];

  return (
    <div className="flex h-screen bg-gray-100"> {/* Full height layout */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col"> {/* Fixed width sidebar */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-xs text-gray-400">NWU Blood Bank</p>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              // Apply active and default classes for NavLink
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ease-in-out
                ${isActive 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {/* link.icon && <link.icon className="h-5 w-5 mr-3" /> */} {/* Icon placeholder */}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          {/* Footer content for sidebar, e.g., current user or app version */}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: Top bar within the main content area if needed in future */}
        {/* <header className="bg-white shadow p-4">Header for main content</header> */}

        {/* Page content will be rendered here by <Outlet /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* This is where nested route components will render */}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;