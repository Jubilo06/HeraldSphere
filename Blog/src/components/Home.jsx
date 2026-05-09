import React from 'react';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router-dom';
import Orb from './Orb';
import PublicPostList from './PublicPostList';

function Home() {
  const { user, isAuthenticated, isAdmin } = useContext(AuthContext);

  return (
    <div className='w-full min-h-screen bg-white'>
      
      {/* 1. HERO SECTION (THE ORB) */}
      <div className="relative w-full h-150 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Orb
            hoverIntensity={2}
            rotateOnHover
            hue={0}
            forceHoverState={false}
            backgroundColor="#000000"
          />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-3xl shadow-2xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase bg-indigo-400/10 rounded-full border border-indigo-400/20">
              Dispatch from the Future
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
              Herald <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">Sphere</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Where global insights meet the digital pulse. Stay ahead with the stories that define our era.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.scrollTo({top: 1100, behavior: 'smooth'})} className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-indigo-50 transition-all transform hover:-translate-y-1">
                Explore Articles
              </button>
              {!isAuthenticated && (
                <Link to="/register" className="px-8 py-3 bg-transparent border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-white/10 transition-all backdrop-blur-md">
                  Join the Circle
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. ENTICING WRITER'S CALL (The New Section) */}
      {!isAuthenticated && (
        <section className="relative py-20 bg-slate-950 overflow-hidden">
          {/* Subtle background detail */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-indigo-900/20 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">The Contributor's Guild</h2>
                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-6">
                  Have a Story the <br/> 
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Sphere Needs to Hear?</span>
                </h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg font-medium">
                  Herald Sphere is looking for thinkers, analysts, and visionaries. We provide the platform; you provide the perspective. Join our global network of contributors today.
                </p>
                <div className="flex flex-wrap gap-8 mb-10">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">25k+</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Readers</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">Global</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reach & Impact</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">Verified</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Editorial Status</span>
                  </div>
                </div>
                <Link to="/register" className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all group">
                  Apply to Write
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>

              {/* Decorative "Newsroom" Card */}
              <div className="hidden lg:block relative">
                 <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full"></div>
                 <div className="relative bg-white/5 border border-white/10 p-8 rounded-4xl backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white">H</div>
                      <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-white/5 rounded-lg"></div>
                      <div className="h-4 w-5/6 bg-white/5 rounded-lg"></div>
                      <div className="h-4 w-4/6 bg-white/5 rounded-lg"></div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                       <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-md bg-white/5"></div>
                         <div className="w-8 h-8 rounded-md bg-white/5"></div>
                       </div>
                       <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest">Authorized Dispatch</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST POSTS LIST */}
      <div className="w-full bg-white pt-10">
        <PublicPostList />
      </div>

      {/* ADMIN SHORTCUT (Optional visibility) */}
      {isAuthenticated && isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link to="/admin/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl border border-white/10 hover:bg-indigo-600 transition-all block">
            Admin Console
          </Link>
        </div>
      )}

    </div>
  );
}
export default Home;