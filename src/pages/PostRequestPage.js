// src/pages/PostRequestPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function PostRequestPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const initialFormData = {
    patientName: '',
    requiredBloodGroup: '',
    unitsRequired: 1,
    hospitalName: '',
    hospitalLocation: '', // Optional field
    contactPerson: '',
    contactNumber: '',
    urgency: 'urgent',
    additionalInfo: '', // Optional field
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = [
    { value: 'urgent', label: 'Urgent (Immediate Need)' },
    { value: 'moderate', label: 'Moderate (Within 24-48 hours)' },
    { value: 'low', label: 'Low (Planned / Stock Up)' },
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!currentUser) {
      setError("You must be logged in to post a request.");
      return;
    }

    // Basic form validation
    if (!formData.patientName || !formData.requiredBloodGroup || !formData.hospitalName || !formData.contactPerson || !formData.contactNumber) {
        setError("Please fill in all required fields: Patient Name, Blood Group, Hospital, Contact Person, and Contact Number.");
        return;
    }
    if (formData.unitsRequired < 1) {
        setError("Units required must be at least 1.");
        return;
    }

    setLoading(true);

    try {
      const requestData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ...formData,
        status: 'active',
        requestedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "bloodRequests"), requestData);
      console.log("Blood request submitted with ID: ", docRef.id);
      
      setSuccessMessage("Blood request submitted successfully!");
      setFormData(initialFormData); // Reset form

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/dashboard'); 
      }, 2000);

    } catch (err) {
      console.error("Error submitting blood request: ", err);
      setError("Failed to submit blood request. Please try again. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fallback if ProtectedRoute somehow doesn't catch this
  if (!currentUser) {
    return <p className="p-4 text-center">Please log in to post a blood request.</p>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-8">Post a Blood Request</h1>
        
        {successMessage && <p className="p-3 my-2 text-sm text-center text-green-700 bg-green-100 rounded-md">{successMessage}</p>}
        {error && <p className="p-3 my-2 text-sm text-center text-red-700 bg-red-100 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Name / Alias</label>
            <input type="text" name="patientName" id="patientName" required value={formData.patientName} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="requiredBloodGroup" className="block text-sm font-medium text-gray-700">Required Blood Group</label>
              <select name="requiredBloodGroup" id="requiredBloodGroup" required value={formData.requiredBloodGroup} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="unitsRequired" className="block text-sm font-medium text-gray-700">Units Required</label>
              <input type="number" name="unitsRequired" id="unitsRequired" required min="1" value={formData.unitsRequired} onChange={handleChange}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">Hospital Name</label>
            <input type="text" name="hospitalName" id="hospitalName" required value={formData.hospitalName} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="hospitalLocation" className="block text-sm font-medium text-gray-700">Hospital Location / Address (Optional)</label>
            <input type="text" name="hospitalLocation" id="hospitalLocation" value={formData.hospitalLocation} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person (for this request)</label>
              <input type="text" name="contactPerson" id="contactPerson" required value={formData.contactPerson} onChange={handleChange}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number (for this request)</label>
              <input type="tel" name="contactNumber" id="contactNumber" required value={formData.contactNumber} onChange={handleChange}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">Urgency Level</label>
            <select name="urgency" id="urgency" required value={formData.urgency} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
              {urgencyLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Additional Information (Optional)</label>
            <textarea name="additionalInfo" id="additionalInfo" rows="3" value={formData.additionalInfo} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
          </div>

          {/* Submit button */}
          <div>
            <button type="submit" disabled={loading}
                    // Updated button classes for primary action (blue)
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? 'Submitting Request...' : 'Post Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostRequestPage;