// src/pages/admin/AdminDonorsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust path if firebase.js is elsewhere
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner'; // Adjust path

function AdminDonorsPage() {
  const [allDonors, setAllDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [errorDonors, setErrorDonors] = useState(null);

  // Helper function to format Firestore Timestamp objects
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  // Helper function to get a displayable label for university roles
  const getRoleLabel = (roleValue) => {
    const roleMap = {
        'student': 'Student',
        'faculty': 'Faculty',
        'staff': 'Staff / Employee'
    };
    return roleMap[roleValue] || (roleValue ? roleValue.charAt(0).toUpperCase() + roleValue.slice(1) : 'N/A');
  };


  useEffect(() => {
    const fetchAllDonors = async () => {
      setLoadingDonors(true);
      setErrorDonors(null);
      try {
        const donorsRef = collection(db, "donors");
        // Query to get all donors, ordered by registration date (newest first) or by name
        const q = query(donorsRef, orderBy("registeredAt", "desc")); 
        // Alternatively, order by fullName: const q = query(donorsRef, orderBy("fullName"));

        const querySnapshot = await getDocs(q);
        const donorsList = [];
        querySnapshot.forEach((doc) => {
          donorsList.push({ id: doc.id, ...doc.data() });
        });
        setAllDonors(donorsList);
        console.log("Fetched all donor profiles:", donorsList);
      } catch (err) {
        console.error("Error fetching all donor profiles: ", err);
        setErrorDonors("Failed to fetch donor profiles. Please try again.");
      } finally {
        setLoadingDonors(false);
      }
    };

    fetchAllDonors();
  }, []); // Runs once on component mount

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-red-700 mb-8">Admin Dashboard</h1>

      {/* Section for All Donor Profiles */}
      <section className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Registered Donors</h2>
        {loadingDonors ? (
          <LoadingSpinner message="Loading all donor profiles..." />
        ) : errorDonors ? (
          <p className="text-red-500 text-center">{errorDonors}</p>
        ) : allDonors.length === 0 ? (
          <p className="text-gray-600 text-center">No donors have registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Univ. ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Visible</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  {/* Add more headers for other actions like Edit/Delete later */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDonors.map(donor => (
                  <tr key={donor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.universityId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(donor.universityRole)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{donor.bloodGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.contactNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {donor.isAvailable ? "Yes" : "No"}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.allowContactVisibility ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {donor.allowContactVisibility ? "Yes" : "No"}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(donor.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Placeholder for other admin sections */}
      <section className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Other Management Sections</h2>
        <p className="text-gray-600">User Management and Blood Request Management sections will be added here.</p>
      </section>
    </div>
  );
}

export default AdminDonorsPage;