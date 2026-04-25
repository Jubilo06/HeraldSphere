// src/pages/EditProfile.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'

function EditProfile() {
  const { user, login } = useContext(AuthContext); // Get current user and login function to update context
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '', // Password field is typically left blank and only submitted if user wants to change it
  });
  const [profilePicFile, setProfilePicFile] = useState(null); // For new file upload
  const [currentProfilePicUrl, setCurrentProfilePicUrl] = useState(user?.profilePic ? `http://localhost:5014${user.profilePic}` : ''); // Display current pic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // If user context changes (e.g., after login/refresh), update form data
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',
      });
      setCurrentProfilePicUrl(user.profilePic ? `http://localhost:5014${user.profilePic}` : '');
    } else {
      // If no user, redirect to login or show error
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setProfilePicFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSend = new FormData();
    for (const key in formData) {
      // Only append password if it's not empty, indicating user wants to change it
      if (key === 'password' && formData[key] === '') {
        continue;
      }
      dataToSend.append(key, formData[key]);
    }
    if (profilePicFile) {
      dataToSend.append('profilePic', profilePicFile);
    }

    try {
      // Your backend /api/auth/profile PUT endpoint
      const token = localStorage.getItem('token'); // Get token from local storage
      const response = await axios.put('http://localhost:5014/api/auth/profile', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          'Authorization': `Bearer ${token}`, // Send the JWT token
        },
      });

      setSuccess(response.data.message || 'Profile updated successfully!');
      // Update the user context with the new data
      login(response.data.user, token); // Ensure login updates local storage & context
      setProfilePicFile(null); // Clear file input after successful upload
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field for security
      setCurrentProfilePicUrl(response.data.user.profilePic ? `http://localhost:5014${response.data.user.profilePic}` : '');

    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading user data...</div>; // Or redirect
  if (loading) return <div>Updating profile...</div>;

  return (
    <div className="edit-profile-container h-screen  bg-[url('/editProfile3.webp')] bg-cover bg-center">
      <div className='w-full p-8 rounded bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl justify-self-center h-screen'>
        <h2 className='text-5xl font-extrabold mb-10 justify-self-center'>Edit your Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form w-[60%]  md:w-[40%]">
        <div className="form-group grid grid-cols-2 gap-0 mb-4">
          <label className=' w-auto p-2' htmlFor="username">Username:</label>
          <input
          className='border border-amber-50 rounded-2xl p-2 ml-2 '
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2' htmlFor="email">Email:</label>
          <input
          className='border border-amber-50 rounded-2xl p-2 ml-2'
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2' htmlFor="firstName">First Name:</label>
          <input
            className='border border-amber-50 rounded-2xl p-2 ml-2'
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2' htmlFor="lastName">Last Name:</label>
          <input
            className='border border-amber-50 rounded-2xl p-2 ml-2'
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2' htmlFor="password">New Password (leave blank to keep current):</label>
          <input
            className='border border-amber-50 rounded-2xl p-2 ml-2'
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
          />
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2'>Current Profile Picture:</label>
          {currentProfilePicUrl ? (
            <img src={currentProfilePicUrl} alt="Current Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <p className=' w-auto p-2'>No profile picture uploaded.</p>
          )}
        </div>
        <div className="form-group grid grid-cols-2 mb-4">
          <label className=' w-auto p-2'  htmlFor="profilePic">Upload New Profile Picture:</label>
          <input
            type="file"
            id="profilePic"
            name="profilePic"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" disabled={loading} 
        className="save-profile-button ml-4 border bg-black text-white p-2 rounded hover:cursor-pointer hover:bg-amber-50 hover:text-green-900">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      </div>
      
    </div>
  );
}

export default EditProfile;