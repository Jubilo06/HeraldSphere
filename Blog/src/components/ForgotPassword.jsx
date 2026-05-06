import React, { useState } from 'react';
import api from './Api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', { email });
      setMsg("If an account exists, a reset link has been dispatched.");
    } catch (err) {
      setMsg("Error processing request.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Recover Access</h2>
        <p className="text-gray-400 text-sm mb-8 font-medium">Enter your email to receive a secure reset link.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="email@example.com"
          />
          <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-white uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
            Send Link
          </button>
        </form>
        {msg && <p className="mt-6 text-center text-xs font-bold text-indigo-400 uppercase">{msg}</p>}
      </div>
    </div>
  );
}
export default ForgotPassword;