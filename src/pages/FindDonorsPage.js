// src/pages/FindDonorsPage.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { useAuth } from '../AuthContext'; // Import useAuth to get the current user
import LoadingSpinner from '../components/LoadingSpinner';

// Helper function to calculate age from a date of birth string (YYYY-MM-DD)
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format date strings for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

function FindDonorsPage() {
  const { currentUser } = useAuth(); // Get the currently logged-in user
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const adminContactInfo = "01XXXXXXXXX"; // ** IMPORTANT: Replace with actual admin/Comptron contact number **

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
      // Query remains the same, we will filter the results in the app
      const q = query(
        donorsRef,
        where("bloodGroup", "==", searchBloodGroup),
        where("isProfileActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      let foundDonors = [];
      querySnapshot.forEach((doc) => {
        foundDonors.push({ id: doc.id, ...doc.data() });
      });

      // Filter out the currently logged-in user from the search results
      if (currentUser) {
        foundDonors = foundDonors.filter(donor => donor.userId !== currentUser.uid);
      }

      setDonors(foundDonors);
    } catch (err) {
      console.error("Error fetching donors: ", err);
      setError("Failed to fetch donors. Please try again.");
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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
        {loading && <LoadingSpinner message="Searching for donors..." />} 
        {!loading && searched && donors.length === 0 && !error && searchBloodGroup && (
          <div className="text-center py-8">
            <p className="text-gray-600">No other donors found for blood group: {searchBloodGroup}.</p>
            <p className="text-sm text-gray-500 mt-2">Please check again later or post a blood request.</p>
          </div>
        )}

        {!loading && donors.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Donor Search Results ({searchBloodGroup})</h2>
            <ul className="space-y-4">
              {donors.map(donor => {
                const age = calculateAge(donor.dateOfBirth);
                return (
                  <li key={donor.id} className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-red-700">{donor.fullName}</h3>
                        <p className="text-xs text-gray-500">ID: {donor.universityId || 'N/A'}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                          {donor.isVerified ? "Verified" : "Not Verified"}
                        </span>
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {donor.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      <p><strong>Blood Group:</strong> <span className="font-bold">{donor.bloodGroup}</span></p>
                      {age && <p><strong>Age:</strong> {age}</p>}
                      {donor.gender && <p><strong>Gender:</strong> {donor.gender}</p>}
                      {donor.department && <p><strong>Dept/Position:</strong> {donor.department}</p>}
                      {donor.lastDonationDate && (
                        <p className="col-span-2 text-xs text-gray-500 mt-1">
                          <strong>Last Donated:</strong> {formatDate(donor.lastDonationDate)}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {donor.allowContactVisibility ? (
                        <p className="text-sm"><strong>Contact:</strong> {donor.contactNumber}</p>
                      ) : (
                        <p className="text-sm italic text-gray-600">
                          Contact info is private. To connect, please reach out to an admin at 
                          <strong className="text-red-600 not-italic"> {adminContactInfo} </strong> 
                          and provide the donor's name and ID.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindDonorsPage;