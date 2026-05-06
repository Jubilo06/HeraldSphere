import React from 'react'
import { useState } from 'react';
import api from './Api';

function Contact() {
    const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const response = await api.post('/api/posts/contact', formData);
      setStatus({ type: 'success', msg: response.data.message });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || 'The Sphere is currently unreachable. Try later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  
  return (
     <div className="bg-white min-h-screen pb-20">
      {/* HEADER */}
      <header className="pt-20 pb-16 px-4 text-center">
        <h2 className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-xs mb-4">Get in Touch</h2>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          Connect with the <span className="text-indigo-600">Sphere.</span>
        </h1>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT COLUMN: CONTACT INFO */}
        <div className="space-y-12">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Communication Channels</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold">@</div>
                <div>
                  <p className="font-bold text-slate-900">General Inquiries</p>
                  <p className="text-slate-500 text-sm">hello@heraldsphere.com</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold">#</div>
                <div>
                  <p className="font-bold text-slate-900">Editorial Department</p>
                  <p className="text-slate-500 text-sm">editor@heraldsphere.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-950 rounded-3xl text-white">
            <h4 className="text-lg font-bold mb-4">Global Headquarters</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Digital Nomads | Remote First <br />
              Herald Sphere Media Group <br />
              London, United Kingdom
            </p>
            <div className="h-40 bg-slate-900 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black opacity-20 text-4xl">MAP</div>
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-8 md:p-12">
          {status.type === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 text-3xl font-bold">✓</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Message delivered successfully</h3>
              <p className="text-slate-500">The Herald team will review your message shortly.</p>
              <button 
                onClick={() => setStatus({ type: null, msg: '' })}
                className="mt-8 text-indigo-600 font-bold uppercase tracking-widest text-xs underline"
              >
                New Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Temmy Abbey" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="temmy@example.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  required 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry for Herald Sphere" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
                <textarea 
                  name="message"
                  rows="5" 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your transmission..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                ></textarea>
              </div>

              {status.type === 'error' && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 italic">
                  ⚠ {status.msg}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex justify-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send Transmission'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact