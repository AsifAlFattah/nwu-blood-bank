// src/components/Footer.js
import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-gray-100 text-gray-700 py-6 border-t border-gray-300">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs sm:text-sm"> {/* Base text size, slightly larger on sm screens */}
          <span>&copy; {currentYear} NWU Blood Bank. All Rights Reserved.</span>
          <span className="mx-1 sm:mx-2 hidden md:inline-block">|</span> {/* Separator, hidden on small, visible on medium+ */}
          <span className="block md:inline-block mt-1 md:mt-0"> {/* Stacks on small, inline on medium+ */}
            Developed by{' '}
            <a 
              href="https://www.linkedin.com/in/asif-al-fattah/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
              Asif Al Fattah
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;