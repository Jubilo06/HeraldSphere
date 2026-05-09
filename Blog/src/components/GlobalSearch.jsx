import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import api from './Api'

function GlobalSearch() {
     const [query, setQ] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    // --- DEBOUNCE LOGIC ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const res = await api.get(`/api/posts/search/suggestions?q=${query}`);
          setSuggestions(res.data);
          setIsOpen(true);
        } catch (err) { console.error(err); }
      } else {
        setSuggestions([]);
      }
    }, 300); // Wait 300ms after last keystroke

    return () => clearTimeout(timer); // Clean up if user types again before 300ms
  }, [query]);

   // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
     <div className="relative w-full max-w-lg mx-auto" ref={searchRef}>
      {/* SEARCH INPUT */}
      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the Sphere..."
          className="w-full bg-slate-100 border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      {/* SUGGESTIONS DROPDOWN */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-100 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Matches</p>
          </div>
          {suggestions.map((post) => (
            <Link 
              key={post._id}
              to={`/posts/${post.slug}`}
              onClick={() => {setIsOpen(false); setQ("")}}
              className="flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors group"
            >
              <img 
                src={post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `http://localhost:5014${post.mainImageUrl}`} 
                className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="" 
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {post.title}
                </h4>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Dispatch Article</p>
              </div>
            </Link>
          ))}
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={() => navigate(`/posts?search=${query}`)}
              className="w-full text-center py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              View all results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch