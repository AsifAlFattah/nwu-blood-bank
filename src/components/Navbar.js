// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Provides currentUser and userRole
import { auth } from '../firebase';      // Firebase auth instance for signOut
import { signOut } from 'firebase/auth'; // Firebase signOut function

// Reusable HamburgerIcon component for mobile menu toggle
const HamburgerIcon = ({ onClick }) => (
  <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2" aria-label="Open menu">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>
  </button>
);

// Reusable CloseIcon component for mobile menu toggle
const CloseIcon = ({ onClick }) => (
    <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2" aria-label="Close menu">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>
);

// Main Navbar component
function Navbar() {
  const { currentUser, userRole } = useAuth(); // Get current user and their role
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu visibility

  // Handles user logout
  const handleLogout = async () => {
    setIsMobileMenuOpen(false); // Ensure mobile menu closes on logout
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Toggles the visibility of the mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Closes the mobile menu, typically used when a mobile nav link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  // Reusable NavLink component for consistent styling and behavior (closes mobile menu on click)
  // Renders as a Link or a button based on the 'isButton' prop
  const NavLink = ({ to, children, isButton = false, onClick }) => {
    const commonClasses = "px-3 py-2 rounded-md text-sm font-medium"; // Base styling for links/buttons
    const interactiveClasses = "text-red-100 hover:bg-red-700 hover:text-white"; // Hover/active states

    if (isButton) { // For logout or other button-like actions in the nav
        return (
            <button
                onClick={onClick} // Use passed onClick (e.g., handleLogout)
                className={`${commonClasses} ${interactiveClasses} block w-full text-left md:w-auto`}
            >
                {children}
            </button>
        );
    }

    return (
      <Link 
        to={to} 
        className={`${commonClasses} ${interactiveClasses} block md:inline-block`} // 'block' for mobile, 'md:inline-block' for desktop
        onClick={closeMobileMenu} // Close mobile menu when a link is clicked
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-red-700 shadow-lg sticky top-0 z-50"> {/* Main navbar container, sticky at the top */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Responsive container for content */}
        <div className="flex items-center justify-between h-16"> {/* Fixed height for the navbar */}
          
          {/* Logo / Brand Name - always visible */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl hover:text-red-200" onClick={closeMobileMenu}>
              NWU Blood Bank
            </Link>
          </div>

          {/* Desktop Menu Links - hidden on small screens, visible on medium and up */}
          <div className="hidden md:flex items-center space-x-3"> {/* Horizontal spacing for desktop links */}
            <NavLink to="/">Home</NavLink>
            {currentUser && ( // Links visible only when a user is logged in
              <>
                <NavLink to="/find-donors">Find Donors</NavLink>
                <NavLink to="/post-request">Post Request</NavLink>
                <NavLink to="/view-requests">View Requests</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {userRole === 'admin' && ( // Admin link, visible only if userRole is 'admin'
                  <NavLink to="/admin/dashboard">Admin</NavLink>
                )}
              </>
            )}
            {!currentUser && ( // Links visible only when no user is logged in
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
            {/* Logout button for desktop, visible only when a user is logged in */}
            {currentUser && (
                 <NavLink 
                    isButton={true}
                    onClick={handleLogout} // Uses the NavLink styled as a button
                >
                  Logout ({currentUser.email.split('@')[0]})
                </NavLink>
            )}
          </div>

          {/* Mobile Menu Button - visible only on small screens */}
          <div className="md:hidden flex items-center">
            {isMobileMenuOpen ? 
              <CloseIcon onClick={toggleMobileMenu} /> : 
              <HamburgerIcon onClick={toggleMobileMenu} />
            }
          </div>
        </div>
      </div>

      {/* Mobile Menu - shown/hidden based on isMobileMenuOpen state, only on small screens */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute bg-red-700 w-full shadow-lg py-2 z-40"> {/* Full width dropdown */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"> {/* Padding and spacing for mobile links */}
            <NavLink to="/">Home</NavLink>
            {currentUser && ( // Links for logged-in users
              <>
                <NavLink to="/find-donors">Find Donors</NavLink>
                <NavLink to="/post-request">Post Request</NavLink>
                <NavLink to="/view-requests">View Requests</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {userRole === 'admin' && ( // Admin link in mobile menu
                  <NavLink to="/admin/dashboard">Admin Panel</NavLink>
                )}
                <NavLink 
                    isButton={true}
                    onClick={handleLogout} // Logout button for mobile
                >
                  Logout ({currentUser.email.split('@')[0]})
                </NavLink>
              </>
            )}
            {!currentUser && ( // Links for non-logged-in users
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;