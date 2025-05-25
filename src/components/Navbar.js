// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const HamburgerIcon = ({ onClick }) => (
  <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2"> {/* Added padding for easier click */}
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>
  </button>
);

const CloseIcon = ({ onClick }) => (
    <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2"> {/* Added padding */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>
);

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  // Refined NavLink styles
  const NavLink = ({ to, children, isButton = false, onClick }) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium"; // Common base for mobile & desktop
    const mobileClasses = "block text-red-100 hover:bg-red-700 hover:text-white";
    const desktopClasses = "text-red-100 hover:bg-red-700 hover:text-white"; // Simplified, can add more specific desktop styles

    if (isButton) {
        return (
            <button
                onClick={onClick}
                className={`${baseClasses} ${mobileClasses} ${desktopClasses} w-full text-left md:w-auto`}
            >
                {children}
            </button>
        );
    }

    return (
      <Link 
        to={to} 
        className={`${baseClasses} ${mobileClasses} ${desktopClasses}`}
        onClick={closeMobileMenu}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-red-700 shadow-lg sticky top-0 z-50"> {/* Darker red, consistent with other red elements */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Standard container padding */}
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl hover:text-red-200" onClick={closeMobileMenu}>
              NWU Blood Bank
            </Link>
          </div>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center space-x-3"> {/* Adjusted spacing */}
            <NavLink to="/">Home</NavLink>
            {currentUser && (
              <>
                <NavLink to="/find-donors">Find Donors</NavLink>
                <NavLink to="/post-request">Post Request</NavLink>
                <NavLink to="/view-requests">View Requests</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink 
                    isButton={true}
                    onClick={handleLogout}
                >
                  Logout ({currentUser.email.split('@')[0]})
                </NavLink>
              </>
            )}
            {!currentUser && (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isMobileMenuOpen ? <CloseIcon onClick={toggleMobileMenu} /> : <HamburgerIcon onClick={toggleMobileMenu} />}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Revealed when isMobileMenuOpen is true */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute bg-red-700 w-full shadow-lg py-2 z-40"> {/* Ensure it's below sticky nav if any overlap issues */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"> {/* Added padding around links */}
            <NavLink to="/">Home</NavLink>
            {currentUser && (
              <>
                <NavLink to="/find-donors">Find Donors</NavLink>
                <NavLink to="/post-request">Post Request</NavLink>
                <NavLink to="/view-requests">View Requests</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink 
                    isButton={true}
                    onClick={handleLogout} // handleLogout already closes menu
                >
                  Logout ({currentUser.email.split('@')[0]})
                </NavLink>
              </>
            )}
            {!currentUser && (
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