// src/components/admin/AdminLayout.js
import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom'; // Added Link for the "Back to Site"
// Example Icon (optional, if you decide to use Heroicons or similar)
// import { ArrowLeftIcon } from '@heroicons/react/outline'; 

function AdminLayout() {
  const adminNavLinks = [
    { name: 'Overview', to: '/admin/overview' },
    { name: 'Manage Donors', to: '/admin/donors' },
    { name: 'Manage Requests', to: '/admin/requests' },
    { name: 'Manage Users', to: '/admin/users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100"> {/* Full height layout */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-xs text-gray-400">NWU Blood Bank</p>
        </div>

        {/* Main Admin Navigation */}
        <nav className="flex-grow p-4 space-y-2">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ease-in-out
                ${isActive 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {/* link.icon && <link.icon className="h-5 w-5 mr-3" /> */}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer of Sidebar with "Back to Site" link */}
        <div className="p-4 border-t border-gray-700">
          <Link 
            to="/" // Link to the main homepage
            className="flex items-center px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ease-in-out"
          >
            {/* <ArrowLeftIcon className="h-5 w-5 mr-3" /> // Example icon */}
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;