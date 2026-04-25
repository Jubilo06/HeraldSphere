import React from 'react'
import { useContext } from 'react';
import { AuthContext } from './AuthContext'
import { Link } from 'react-router-dom'

function WriterDashboard() {
const { user } = useContext(AuthContext);
  return (
    <div className='bg-yellow-500 h-screen w-full justify-items-center-safe place-content-center'>
        <h2 className='text-3xl font-bold mb-20 ml-4 '>Welcome to your desk, {user?.username}!</h2>
      <p className='text-gray-700 mb-10 ml-4'>This is where you can manage your contributions and profile.</p>
      <nav className='ml-4'>
        <ul className='flex flex-wrap gap-4 mb-10'>
          <li><Link className='border-black border rounded p-1  bg-black text-yellow-500' to="/my-posts">View My Posts</Link></li>
          <li><Link className='border-black border rounded p-1 bg-black text-yellow-500' to="/submit-post">Submit New Post</Link></li>
        </ul>
        <Link className='border-black border rounded p-1 bg-black text-yellow-500 ' to="/edit-profile">Edit your profile</Link>
      </nav>
      {/* Content writer specific functionality */}
    </div>
  )
}

export default WriterDashboard