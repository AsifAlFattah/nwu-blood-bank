// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Wrap AuthProvider (and thus App) with Router */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();