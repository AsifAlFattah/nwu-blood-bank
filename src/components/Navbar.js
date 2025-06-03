// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Provides currentUser, userRole, isEmailVerified, resendVerificationEmail
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// Reusable HamburgerIcon component
const HamburgerIcon = ({ onClick }) => (
  <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2" aria-label="Open menu">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>
  </button>
);

// Reusable CloseIcon component
const CloseIcon = ({ onClick }) => (
    <button onClick={onClick} className="text-white focus:outline-none md:hidden p-2 -mr-2" aria-label="Close menu">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>
);

// Main Navbar component
function Navbar() {
  // Destructure necessary values from AuthContext
  const { currentUser, userRole, isEmailVerified, resendVerificationEmail } = useAuth(); 
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState(''); // For feedback on resending email

  // Handles user logout
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

  // Toggles the mobile menu visibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Closes the mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  // Handles resending the verification email
  const handleResendVerification = async () => {
    setVerificationMessage(''); // Clear previous message
    if (resendVerificationEmail) { // Check if function exists
        const success = await resendVerificationEmail();
        if (success) {
        setVerificationMessage("Verification email resent! Please check your inbox (and spam folder).");
        } else {
        setVerificationMessage("Failed to resend verification email. You may have resent too recently, or an error occurred.");
        }
    } else {
        setVerificationMessage("Resend function not available. Please try again later.");
    }
    // Clear message after a few seconds
    setTimeout(() => setVerificationMessage(''), 7000);
  };

  // Reusable NavLink component for consistent styling and behavior
  const NavLink = ({ to, children, isButton = false, onClick }) => {
    const commonClasses = "px-3 py-2 rounded-md text-sm font-medium";
    const interactiveClasses = "text-red-100 hover:bg-red-700 hover:text-white";

    if (isButton) {
        return (
            <button
                onClick={onClick}
                className={`${commonClasses} ${interactiveClasses} block w-full text-left md:w-auto`}
            >
                {children}
            </button>
        );
    }

    return (
      <Link 
        to={to} 
        className={`${commonClasses} ${interactiveClasses} block md:inline-block`}
        onClick={closeMobileMenu}
      >
        {children}
      </Link>
    );
  };

  return (
    <> {/* Using React.Fragment to wrap Navbar and potential Banner */}
      <nav className="bg-red-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl hover:text-red-200" onClick={closeMobileMenu}>
                NWU Blood Bank
              </Link>
            </div>

            {/* Desktop Menu Links */}
            <div className="hidden md:flex items-center space-x-3">
              <NavLink to="/">Home</NavLink>
              {currentUser && (
                <>
                  <NavLink to="/find-donors">Find Donors</NavLink>
                  <NavLink to="/post-request">Post Request</NavLink>
                  <NavLink to="/view-requests">View Requests</NavLink>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  {userRole === 'admin' && (
                    <NavLink to="/admin/overview">Admin Panel</NavLink> 
                  )}
                </>
              )}
              {!currentUser && (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/register">Register</NavLink>
                </>
              )}
              {currentUser && (
                   <NavLink 
                      isButton={true}
                      onClick={handleLogout}
                  >
                    Logout ({currentUser.email.split('@')[0]})
                  </NavLink>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              {isMobileMenuOpen ? 
                <CloseIcon onClick={toggleMobileMenu} /> : 
                <HamburgerIcon onClick={toggleMobileMenu} />
              }
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute bg-red-700 w-full shadow-lg py-2 z-40">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/">Home</NavLink>
              {currentUser && (
                <>
                  <NavLink to="/find-donors">Find Donors</NavLink>
                  <NavLink to="/post-request">Post Request</NavLink>
                  <NavLink to="/view-requests">View Requests</NavLink>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  {userRole === 'admin' && (
                    <NavLink to="/admin/overview">Admin Panel</NavLink> 
                  )}
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
          </div>
        )}
      </nav>
      
      {/* Email Verification Banner */}
      {currentUser && !isEmailVerified && (
        <div className="bg-yellow-400 text-yellow-900 text-center p-3 text-sm sticky top-16 z-30 shadow-md"> {/* top-16 assumes h-16 navbar */}
          Your email address is not verified. Please check your inbox (and spam folder) for a verification link.
          <button 
            onClick={handleResendVerification}
            className="ml-3 font-semibold underline hover:text-yellow-700 focus:outline-none"
          >
            Resend Verification Email
          </button>
          {verificationMessage && <p className="mt-1 text-xs font-medium">{verificationMessage}</p>}
        </div>
      )}
    </>
  );
}

export default Navbar;