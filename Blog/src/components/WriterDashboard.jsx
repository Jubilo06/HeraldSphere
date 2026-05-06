import React from 'react'
import { useContext } from 'react';
import { AuthContext } from './AuthContext'
import { Link } from 'react-router-dom'

function WriterDashboard() {
const { user } = useContext(AuthContext);

const getProfilePic = () => {
  if (!user || !user.profilePic) {
    return 'https://via.placeholder.com/150';
  }

  if (user.profilePic.startsWith('http')) {
    return user.profilePic;
  }
  const cleanPath = user.profilePic.replace(/^\//, '');
  if (cleanPath.startsWith('uploads')) {
    return `http://localhost:5014/${cleanPath}`;
  }
  return `http://localhost:5014/uploads/profile_pics/${cleanPath}`;
};

const profilePicUrl = getProfilePic();
console.log("Current User Data:", user);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
        
       {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-12 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          
          {/* PROFILE PICTURE */}
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src={profilePicUrl} 
              key={profilePicUrl}
              alt={user?.username} 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
            />
            <div className="absolute bottom-2 right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white" title="Active Writer"></div>
          </div>

          {/* USER INFO */}
          <div className="text-center md:text-left">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-[0.3em] mb-2">Writer's Desk</h2>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Welcome, {user?.username}!
            </h1>
            <p className="text-slate-500 max-w-lg leading-relaxed">
              Ready to shape the Sphere? Manage your contributions, track your impact, and craft your next global dispatch from here.
            </p>
          </div>
        </div>
      </div>
      {/* Content writer specific functionality */}

      {/* DASHBOARD CONTENT */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        
        {/* QUICK STATS (Visual Only) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Role</span>
                <p className="text-lg font-bold text-slate-800 capitalize">{user?.role || 'Contributor'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</span>
                <p className="text-lg font-bold text-emerald-600">Verified</p>
            </div>
        </div>

        {/* ACTION CARDS */}
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* VIEW POSTS */}
          <Link to="/my-posts" className="group p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">My Archives</h4>
            <p className="text-sm text-slate-500">View and manage all the articles you've published.</p>
          </Link>

          {/* SUBMIT NEW */}
          <Link to="/submit-post" className="group p-8 bg-indigo-600 border border-indigo-500 rounded-3xl shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Add New Article</h4>
            <p className="text-sm text-indigo-100">Draft a new global article for the Herald Sphere.</p>
          </Link>

          {/* EDIT PROFILE */}
          <Link to="/edit-profile" className="group p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Profile Settings</h4>
            <p className="text-sm text-slate-500">Update your bio, name, and identity.</p>
          </Link>

        </div>
      </div>
    </div>
  )
}

export default WriterDashboard