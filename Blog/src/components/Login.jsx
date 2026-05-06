// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa'; // Added icons

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
   const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); // Get the login function from AuthContext
  const navigate = useNavigate();
  const location = useLocation();

   const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5014/api/auth/login', { username, password },
        {
        withCredentials: true // <--- IMPORTANT: Ensure this is set for your login request if your backend relies on cookies.
      }
      );
      const {  _id, username: loggedInUsername, role, token, profilePic, firstName, lastName, email } = response.data;
      login({ _id, username: loggedInUsername, role,profilePic, firstName, lastName, email }, token); // Call the login function from AuthContext
      // Redirect handled by AuthContext
    } catch (err) {
       console.error("Login component: Error caught during login:", err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      
      {/* BACKGROUND DECORATION (Subtle Glows) */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20"></div>
        
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10">
           {/* SUCCESS MESSAGE FROM REGISTRATION */}
          {successMsg && !error && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400 animate-in fade-in zoom-in duration-300">
              <FaCheckCircle className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight">{successMsg}</p>
            </div>
          )}
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.4em] mb-3">
              Herald Sphere
            </h2>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">
                Username
              </label>
              <input 
                type="text" 
                id='login-user' 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Enter your username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1">Password</label>
               <Link to="/forgot-password" size={18} className="text-[10px] ml-4 font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-tighter transition">
                Forgot?
              </Link>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} // Dynamic type
                  value={password} onChange={(e) => setPassword(e.target.value)} required 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                {/* EYE ICON */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-lg flex items-center space-x-2 animate-shake">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group overflow-hidden bg-indigo-600 disabled:bg-indigo-800 py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all"
            >
              <div className="absolute inset-0 w-1/4 h-full bg-white/20 -skew-x-30 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700"></div>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-400">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
export default Login;