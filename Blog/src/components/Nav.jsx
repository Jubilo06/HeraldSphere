import React from 'react'
import { useState, useContext } from 'react'
import { AuthContext } from './AuthContext';
import { Link, NavLink } from 'react-router-dom';

function Nav() {
    const { isAuthenticated, isAdmin, logout, user, register, login } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const categories = ['Science', 'Business', 'Technology', 'Health', 'Sports', 'Opinion', 'Other'];
    const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;
    // Helper for user image
  const userImage = user?.profilePic 
    ? (user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:5014${user.profilePic}`)
    : null;
return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LEFT: Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img 
                src="/logo.webp" 
                alt="Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:rotate-6" 
              />
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-lg md:text-xl font-black tracking-tighter leading-none text-slate-900">
                  HERALD<span className="text-indigo-600">SPHERE</span>
                </span>
                <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-1">
                  Global Dispatch
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/posts" className={navLinkClass}>Trending Articles</NavLink>

              {/* Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center px-3 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Topics
                  <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 w-52 bg-white border border-slate-100 shadow-2xl rounded-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 mb-1 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Browse by Category</p>
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/posts/category/${cat}`}
                        className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Auth / User */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-600 overflow-hidden border-2 border-white shadow-sm">
                  {userImage ? (
                    <img src={userImage} alt={user?.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-white font-bold text-xs">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter leading-none">
                    {user?.role}
                  </span>
                  {isAdmin ? (
                    <Link to="/admin/dashboard" className="text-xs font-bold text-slate-900 hover:text-indigo-600">Command Center</Link>
                  ) : (
                    <Link to="/writer/dashboard" className="text-xs font-bold text-slate-900 hover:text-indigo-600">Writer's Desk</Link>
                  )}
                </div>

                <button 
                  onClick={logout}
                  className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition">Log In</Link>
                <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Register</Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-6 animate-in slide-in-from-right duration-300">
          <div className="grid grid-cols-2 gap-2">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>Home</NavLink>
            <NavLink to="/posts" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>Trending Article</NavLink>
          </div>
          
          <div>
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topic Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {/* FIXED: Removed .slice(0, 4) to show all, including OTHER */}
              {categories.map(cat => (
                <Link 
                  key={cat} 
                  to={`/posts/category/${cat}`} 
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-3">
                   <img src={userImage || '/logo.webp'} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="User" />
                   <div>
                     <p className="text-sm font-black text-slate-900">{user?.username}</p>
                     <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{user?.role}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link to={isAdmin ? "/admin/dashboard" : "/writer/dashboard"} className="text-center py-3 bg-slate-900 text-white rounded-xl font-bold text-sm" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <button onClick={logout} className="py-3 text-red-500 font-bold text-sm bg-red-50 rounded-xl transition">Log Out</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" className="text-center py-3 border border-slate-200 rounded-xl font-bold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="text-center py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;