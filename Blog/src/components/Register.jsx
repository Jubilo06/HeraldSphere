// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext'; 
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({  
    username: '', 
    password: '',
    email:'',
    firstName:'',
    lastName:'', 
  });
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register: registerAuthContext  } =useContext(AuthContext) ; // For auto-login

  const handleChange = (e) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file)); // Generate preview URL
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dataToSend = new FormData();
      for (const key in formData) {
        dataToSend.append(key, formData[key]);
      }
      if (profilePic) {
        dataToSend.append('profilePic', profilePic); // Append the file
      }
      dataToSend.append('role', 'writer');
      const response = await  registerAuthContext (dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
       const data = response?.data || response;

      console.log("Registration attempt finished. Data received:", data);
    if (response?.data?.token || response?.token) {
        // Auto-logged in
        navigate('/'); 
      } else {
        // Needs manual login
        navigate('/login', { state: { message: "Account created! Please log in." } });
      }
    } catch (err) {
      // setError(err.response?.data?.message || 'Registration failed');
      console.error("Full Registration Error caught in Register.jsx handleSubmit:", err);
      if (err.response) {
        // Server responded with a status other than 2xx
        setError(err.response.data?.message || `Registration failed: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received (e.g., network error)
        setError('Network Error: Could not reach the server.');
      } else {
        // Something else happened while setting up the request
        setError(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden py-12 px-4">
      
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse transition-delay-1000"></div>

      <div className="relative w-full max-w-2xl">
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.4em] mb-3">Join the Guild</h2>
            <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm mt-2">Become a contributor to the Herald Sphere</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PROFILE PICTURE UPLOAD */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/50 p-1 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-indigo-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label htmlFor="profilePic" className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-500 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" id="profilePic" name="profilePic" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">Profile Photo</p>
            </div>

            {/* FORM FIELDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <input name="username" value={formData.username} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
  <div className="relative">
    <input 
      type={showPassword ? "text" : "password"} 
      name="password" value={formData.password} onChange={handleChange} required 
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
    />
    <button 
      type="button" 
      onClick={() => setShowPassword(!showPassword)} 
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
    >
      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
    </button>
  </div>
</div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4 flex justify-center items-center">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Forging Identity...
                </>
              ) : 'Sign up'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-gray-400 text-sm font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/20 hover:decoration-indigo-400 transition-all">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;