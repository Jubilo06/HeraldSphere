import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './Api';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (password !== confirmPassword) return alert("Passwords do not match");

  try {
    const response = await api.put(`/api/auth/reset-password/${token}`, { password });
    // Success! Redirect to login with a message
    navigate('/login', { state: { message: response.data.message } });
  } catch (err) {
    alert(err.response?.data?.message || "Failed to reset password.");
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">New Password</h2>
        <input 
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter new password"
        />
        <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-white uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
          Update Password
        </button>
      </form>
    </div>
  );
}
export default ResetPassword;