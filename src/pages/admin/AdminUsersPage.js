// src/pages/admin/AdminUsersPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore'; // Added updateDoc
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../AuthContext'; // To prevent admin from editing their own role easily

function AdminUsersPage() {
  const { currentUser } = useAuth(); // Get current admin user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State to manage inline editing for roles
  const [editingUserId, setEditingUserId] = useState(null); // ID of the user whose role is being edited
  const [selectedRole, setSelectedRole] = useState('');   // The new role selected in the dropdown

  const availableRoles = ['user', 'admin']; // Define available roles

  // Helper function to format Firestore Timestamp
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return 'N/A';
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    setSuccessMessage('');
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users: ", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRoleClick = (user) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role || 'user'); // Pre-fill with current role or default to 'user'
    setActionError(null);
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  const handleSaveRole = async (userIdToUpdate) => {
    if (!selectedRole) {
      setActionError("Please select a role.");
      return;
    }
    // Prevent admin from easily changing their own role to non-admin via this UI
    if (currentUser && currentUser.uid === userIdToUpdate && selectedRole !== 'admin') {
        setActionError("Admins cannot remove their own admin role through this interface.");
        // For a more robust solution, this kind of critical change might need extra confirmation or be restricted.
        return;
    }

    setActionError(null);
    setSuccessMessage('');
    // Consider adding a loading state for the specific row update if needed
    try {
      const userDocRef = doc(db, "users", userIdToUpdate);
      await updateDoc(userDocRef, {
        role: selectedRole
      });
      setSuccessMessage(`Role for user ${userIdToUpdate.substring(0,6)}... updated to ${selectedRole}.`);
      fetchUsers(); // Refresh the users list
      setEditingUserId(null); // Exit editing mode
    } catch (err) {
      console.error(`Error updating role for user ${userIdToUpdate}:`, err);
      setActionError(`Failed to update role for user ${userIdToUpdate.substring(0,6)}...`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." size="lg" />;
  }

  if (error) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Users</h2>
      </div>

      {actionError && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-4 px-2 py-0.5 text-xs bg-red-200 hover:bg-red-300 rounded-md font-semibold">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md text-center">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="ml-4 px-2 py-0.5 text-xs bg-green-200 hover:bg-green-300 rounded-md font-semibold">Dismiss</button>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No users found in the 'users' collection yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User UID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tooltip">
                    {user.id.substring(0, 10)}...
                    <span className="tooltiptext">{user.id}</span> {/* Basic tooltip for full ID */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingUserId === user.id ? (
                      <select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="p-1 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                        disabled={currentUser && currentUser.uid === user.id && user.role === 'admin'} // Prevent admin from easily changing own role to non-admin
                      >
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUserId === user.id ? (
                      <>
                        <button 
                            onClick={() => handleSaveRole(user.id)} 
                            className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                            disabled={currentUser && currentUser.uid === user.id && selectedRole !== 'admin' && user.role ==='admin'} // Extra check
                        >
                            Save
                        </button>
                        <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancel</button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEditRoleClick(user)} 
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={currentUser && currentUser.uid === user.id && users.filter(u => u.role === 'admin').length <=1 && user.role === 'admin'} // Prevent sole admin from removing their own admin status easily
                      >
                        Edit Role
                      </button>
                    )}
                    {/* Delete (Firestore record only) button can be added here later if desired */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Basic Tooltip CSS (add to your index.css or App.css) */}
      <style jsx global>{`
        .tooltip {
          position: relative;
          display: inline-block;
          cursor: help;
        }
        .tooltip .tooltiptext {
          visibility: hidden;
          width: auto;
          min-width: 200px; /* Adjust as needed */
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px 8px;
          position: absolute;
          z-index: 1;
          bottom: 125%; /* Position above the item */
          left: 50%;
          margin-left: -100px; /* Adjust to center based on min-width */
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.75rem; /* text-xs */
          white-space: normal; /* Allow wrapping */
          word-break: break-all; /* Break long UIDs */
        }
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default AdminUsersPage;