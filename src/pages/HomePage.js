// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Assuming AuthContext.js is in src/

// Simple animated arrow icon for Call to Action buttons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-200 ease-in-out" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// SVG Icons for Social Links
const WebIcon = () => <span className="text-xl">🌐</span>;
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"> {/* Adjusted size to h-5 w-5 */}
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
    </svg>
);
const LinkedInIcon = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"> {/* Adjusted size to h-5 w-5 */}
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.499 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
    </svg>
);

function HomePage() {
  const { currentUser } = useAuth();

  const comptronInfo = {
    name: "Comptron",
    tagline: "Creativity Assembled",
    about: "Comptron is the official computer club of North Western University, dedicated to fostering innovation, technical skills, and a vibrant tech community on campus.",
    logoUrl: "/images/Comptron.png", 
    website: "https://www.comptron.nwu.ac.bd", 
    facebook: "https://www.facebook.com/comptron.nwu", 
    linkedin: "https://www.linkedin.com/company/nwucomptron"
  };

  return (
    <div className="min-h-screen-nav bg-gray-100">
      
      {/* Hero Section */}
      <section className="bg-white text-gray-800 py-20 md:py-28 px-4 text-center">
        {/* ... Hero content remains the same ... */}
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-red-700">
            Give the Gift of Life.
            <br className="hidden sm:block" /> Donate Blood Today.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join the NWU Blood Bank community. Your contribution empowers us to save lives and support those in need within our university.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center items-center">
            {currentUser ? (
              <>
                <Link 
                  to="/find-donors"
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Find a Donor <ArrowRightIcon />
                </Link>
                <Link 
                  to="/post-request"
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border-2 border-red-600 text-base font-semibold rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Post a Request <ArrowRightIcon />
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Become a Donor <ArrowRightIcon />
                </Link>
                <Link 
                  to="/login"
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border-2 border-gray-300 text-base font-semibold rounded-lg text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Login / Need Blood <ArrowRightIcon />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Managed by Comptron Section */}
      <section className="py-16 md:py-20 bg-gray-50 px-4">
        <div className="container mx-auto max-w-3xl text-center">
            <div className="mb-8">
                <img 
                    src={process.env.PUBLIC_URL + comptronInfo.logoUrl} 
                    alt="Comptron Logo" 
                    className="h-20 md:h-24 w-auto mx-auto mb-4" 
                    onError={(e) => { 
                        e.currentTarget.style.display = 'none'; 
                        const placeholder = document.createElement('p');
                        placeholder.textContent = '[Comptron Logo Unavailable]';
                        placeholder.className = 'text-gray-500 mb-4';
                        if(e.currentTarget.parentNode) { 
                           e.currentTarget.parentNode.insertBefore(placeholder, e.currentTarget.nextSibling);
                        }
                    }}
                />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Managed By <span className="text-red-600">{comptronInfo.name}</span>
                </h2>
                {/* <p className="text-lg font-semibold text-indigo-600 mb-4">{comptronInfo.tagline}</p> */}
            </div>
            
            <p className="text-md text-gray-700 mb-8 leading-relaxed max-w-xl mx-auto">
                {comptronInfo.about}
            </p>
            
            {/* Comptron Links with icons inline with text */}
            <div className="flex justify-center items-center space-x-6">
              {comptronInfo.website && comptronInfo.website !== '#' && (
                <a href={comptronInfo.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors duration-200 inline-flex items-center" aria-label="Comptron Website">
                  <WebIcon /> <span className="ml-2 text-m">Website</span> {/* Adjusted text size and margin */}
                </a>
              )}
              {comptronInfo.facebook && comptronInfo.facebook !== '#' && (
                <a href={comptronInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors duration-200 inline-flex items-center" aria-label="Comptron Facebook">
                  <FacebookIcon /> <span className="ml-2 text-m">Facebook</span> {/* Adjusted text size and margin */}
                </a>
              )}
              {comptronInfo.linkedin && comptronInfo.linkedin !== '#' && (
                <a href={comptronInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors duration-200 inline-flex items-center" aria-label="Comptron LinkedIn">
                  <LinkedInIcon /> <span className="ml-2 text-m">LinkedIn</span> {/* Adjusted text size and margin */}
                </a>
              )}
            </div>

            {/* Final Call to Action section */}
            <div className="mt-16">
                {!currentUser && ( 
                <Link 
                    to="/register" 
                    // Changed button color to red
                    className="group inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    Join Our Lifesaving Community
                    <ArrowRightIcon />
                </Link>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;