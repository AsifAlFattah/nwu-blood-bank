// src/pages/FindDonorsPage.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

function FindDonorsPage() {
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSearch = async (e) => {
    e.preventDefault();
    setDonors([]);
    setSearched(true);

    if (!searchBloodGroup) {
      setError("Please select a blood group to search.");
      setLoading(false); 
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const donorsRef = collection(db, "donors");
      const q = query(
        donorsRef,
        where("bloodGroup", "==", searchBloodGroup),
        where("isAvailable", "==", true)
      );

      const querySnapshot = await getDocs(q);
      const foundDonors = [];
      querySnapshot.forEach((doc) => {
        foundDonors.push({ id: doc.id, ...doc.data() });
      });

      setDonors(foundDonors);
      if (foundDonors.length === 0) {
        console.log(`No available donors found for blood group: ${searchBloodGroup}`);
      } else {
        console.log(`Found donors:`, foundDonors);
      }

    } catch (err) {
      console.error("Error fetching donors: ", err);
      setError("Failed to fetch donors. Please try again. (Ensure Firestore indexes are created if prompted in console)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-8">Find Blood Donors</h1>

        <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto sm:flex-grow">
            <label htmlFor="searchBloodGroup" className="sr-only">Select Blood Group</label>
            <select 
              id="searchBloodGroup" 
              name="searchBloodGroup"
              value={searchBloodGroup}
              onChange={(e) => setSearchBloodGroup(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>
          {/* Search button */}
          <button 
            type="submit" 
            disabled={loading}
            // Updated button classes for primary action (blue)
            className="w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
        
        {loading && <LoadingSpinner message="Searching for donors..." />} 
        
        {!loading && searched && donors.length === 0 && !error && searchBloodGroup && (
          <p className="text-center text-gray-600">No available donors found for blood group: {searchBloodGroup}.</p>
        )}

        {!loading && donors.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Donors ({searchBloodGroup})</h2>
            <ul className="space-y-4">
              {donors.map(donor => (
                <li key={donor.id} className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-lg text-red-700">{donor.fullName}</h3>
                  <p className="text-sm text-gray-700">Blood Group: <span className="font-bold">{donor.bloodGroup}</span></p>
                  {donor.allowContactVisibility ? (
                    <p className="text-sm text-gray-700">Contact: {donor.contactNumber}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Contact information is private.</p>
                  )}
                  <p className={`text-sm font-medium ${donor.isAvailable ? 'text-green-600' : 'text-yellow-600'}`}>
                    Status: {donor.isAvailable ? "Available" : "Not Currently Available"}
                  </p>
                  {donor.lastDonationDate && (
                    <p className="text-xs text-gray-500">Last Donated: {donor.lastDonationDate}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindDonorsPage;