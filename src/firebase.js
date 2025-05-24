import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// If you plan to use Analytics and have REACT_APP_FIREBASE_MEASUREMENT_ID in your .env
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // This will be undefined if not in .env, which is fine for Firebase
};

// Initialize Firebase
// We should check if all required config values are present before initializing
// For example, apiKey and projectId are usually essential.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase config values (REACT_APP_FIREBASE_API_KEY or REACT_APP_FIREBASE_PROJECT_ID) are missing. " +
    "Make sure you have them set in your .env file and have restarted the development server."
  );
}

const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Example for Analytics, if you decide to use it:
// let analytics;
// if (firebaseConfig.measurementId) { // Check if measurementId is actually available
//   analytics = getAnalytics(app);
// }

// Export the services you'll need
export { app, auth, db };
// If using analytics: export { app, auth, db, analytics };