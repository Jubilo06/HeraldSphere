// src/pages/HomePage.js
import React from 'react';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router-dom';
import Particles from './Particles';
import Orb from './Orb';
import PublicPostList from './PublicPostList';
import Footer from './Footer';

function Home() {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  return (
    <div className='w-full h-screen'>
      
    <div className='block'>
      
      {isAuthenticated ? (
        <>
          {/* <p className='mb-4'>Hello, {user.username} ({user.role})</p> */}
          {isAdmin && <p><Link className='border border-white shadow-2xs bg-gray-700 rounded hover:shadow-xl 
          hover:-translate-y-1 transition-all duration-300  
          text-white w-auto p-2 hover:border-indigo-100 ' to="/admin/posts">Go to Admin Dashboard</Link></p>}
          {/* <button onClick={logout}>Logout</button> */}
        </>
      ) : (
        <p><Link to="/login">Login</Link> or <Link to="/register">Register</Link> to get started.</p>
      )}
      <h1 className='text-white'>Welcome to the Herald Sphere</h1>
      <div className="relative w-full h-150 overflow-hidden bg-black">
  {/* 1. The Orb Background */}
  <div className="absolute inset-0 z-0">
    <Orb
      hoverIntensity={2}
      rotateOnHover
      hue={0}
      forceHoverState={false}
      backgroundColor="#000000"
    />
  </div>

  {/* 2. The Content Overlay (Centered on the Orb) */}
  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
    
    {/* Glassmorphic Container for Readability */}
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl max-w-3xl shadow-2xl">
      
      {/* Small Badge */}
      <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-indigo-400 uppercase bg-indigo-400/10 rounded-full border border-indigo-400/20">
        Dispatch from the Future
      </span>

      {/* Main Heading */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
        Herald <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">Sphere</span>
      </h1>

      {/* Enticing Subtext */}
      <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
        Where global insights meet the digital pulse. Stay ahead with the stories that define our era.
      </p>

      {/* Call to Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-indigo-50 transition-all shadow-lg shadow-white/10 transform hover:-translate-y-1">
          Explore Articles
        </button>
        <button className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-md">
          Join the Circle
        </button>
      </div>

    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-10 animate-bounce">
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
      </svg>
    </div>
    
  </div>
</div>
    </div>
    <div className='w-full pt-10'>
      <PublicPostList />
    </div>
    </div>
  );
}
export default Home;