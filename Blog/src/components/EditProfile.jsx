// src/pages/EditProfile.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'
import { FaCamera, FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';

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
  const [previewUrl, setPreviewUrl] = useState(null); 
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
      // setCurrentProfilePicUrl(user.profilePic ? `http://localhost:5014${user.profilePic}` : '');
      const picUrl = user.profilePic 
        ? (user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:5014${user.profilePic}`)
        : '';
      setCurrentProfilePicUrl(picUrl);
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
  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  return (
    // <div className="edit-profile-container h-screen  bg-[url('/editProfile3.webp')] bg-cover bg-center">
    //   <div className='w-full p-8 rounded bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl justify-self-center h-screen'>
    //     <h2 className='text-5xl font-extrabold mb-10 justify-self-center'>Edit your Profile</h2>
    //   <form onSubmit={handleSubmit} className="edit-profile-form w-[60%]  md:w-[40%]">
    //     <div className="form-group grid grid-cols-2 gap-0 mb-4">
    //       <label className=' w-auto p-2' htmlFor="username">Username:</label>
    //       <input
    //       className='border border-amber-50 rounded-2xl p-2 ml-2 '
    //         type="text"
    //         id="username"
    //         name="username"
    //         value={formData.username}
    //         onChange={handleChange}
    //         required
    //       />
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2' htmlFor="email">Email:</label>
    //       <input
    //       className='border border-amber-50 rounded-2xl p-2 ml-2'
    //         type="email"
    //         id="email"
    //         name="email"
    //         value={formData.email}
    //         onChange={handleChange}
    //         required
    //       />
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2' htmlFor="firstName">First Name:</label>
    //       <input
    //         className='border border-amber-50 rounded-2xl p-2 ml-2'
    //         type="text"
    //         id="firstName"
    //         name="firstName"
    //         value={formData.firstName}
    //         onChange={handleChange}
    //         required
    //       />
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2' htmlFor="lastName">Last Name:</label>
    //       <input
    //         className='border border-amber-50 rounded-2xl p-2 ml-2'
    //         type="text"
    //         id="lastName"
    //         name="lastName"
    //         value={formData.lastName}
    //         onChange={handleChange}
    //         required
    //       />
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2' htmlFor="password">New Password (leave blank to keep current):</label>
    //       <input
    //         className='border border-amber-50 rounded-2xl p-2 ml-2'
    //         type="password"
    //         id="password"
    //         name="password"
    //         value={formData.password}
    //         onChange={handleChange}
    //         placeholder="Enter new password"
    //       />
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2'>Current Profile Picture:</label>
    //       {currentProfilePicUrl ? (
    //         <img src={currentProfilePicUrl} alt="Current Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
    //       ) : (
    //         <p className=' w-auto p-2'>No profile picture uploaded.</p>
    //       )}
    //     </div>
    //     <div className="form-group grid grid-cols-2 mb-4">
    //       <label className=' w-auto p-2'  htmlFor="profilePic">Upload New Profile Picture:</label>
    //       <input
    //         type="file"
    //         id="profilePic"
    //         name="profilePic"
    //         accept="image/*"
    //         onChange={handleFileChange}
    //       />
    //     </div>

    //     {error && <p className="error-message">{error}</p>}
    //     {success && <p className="success-message">{success}</p>}
    //     <button type="submit" disabled={loading} 
    //     className="save-profile-button ml-4 border bg-black text-white p-2 rounded hover:cursor-pointer hover:bg-amber-50 hover:text-green-900">
    //       {loading ? 'Saving...' : 'Save Changes'}
    //     </button>
    //   </form>
    //   </div>
      
    // </div>
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/editProfile3.webp')] bg-cover bg-center py-12 px-4">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          
          {/* LEFT SIDEBAR: PROFILE IMAGE MANAGEMENT */}
          <div className="p-8 lg:p-12 bg-white/5 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center justify-center text-center">
            <div className="relative group mb-6">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-indigo-500/30 p-1.5 overflow-hidden shadow-2xl">
                <img 
                  src={previewUrl || currentProfilePicUrl || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <label htmlFor="profilePic" className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full cursor-pointer shadow-xl hover:bg-indigo-500 transition-all transform hover:scale-110 border-2 border-white/20">
                <FaCamera className="text-white" />
                <input type="file" id="profilePic" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{formData.firstName} {formData.lastName}</h3>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-2">{user?.role || 'Writer'}</p>
          </div>

          {/* RIGHT SIDE: FORM FIELDS */}
          <div className="col-span-2 p-8 lg:p-12">
            <header className="mb-10">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Identity Management</h2>
              <p className="text-slate-400 text-sm mt-1">Update your personal details and digital credentials.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <FaUser className="text-indigo-500" /> Username
                  </label>
                  <input name="username" value={formData.username} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <FaEnvelope className="text-indigo-500" /> Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <FaLock className="text-indigo-500" /> Change Password
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600" />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter italic">* Leave blank to maintain current password</p>
              </div>

              {/* STATUS MESSAGES */}
              {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">{error}</div>}
              {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-3"><FaCheckCircle /> {success}</div>}

              {/* ACTIONS */}
              <div className="flex items-center gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase text-xs tracking-widest">
                  {loading ? 'Transmitting Data...' : 'Save Profile Changes'}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="px-6 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;