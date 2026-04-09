import React from 'react'
import { useContext } from 'react';
import { AuthContext } from './AuthContext'
import { Link } from 'react-router-dom'

function WriterDashboard() {
const { user } = useContext(AuthContext);
  return (
    <div>
        <h2>Writer Dashboard - Welcome, {user?.username}!</h2>
      <p>This is where you can manage your contributions.</p>
      <nav>
        <ul>
          <li><Link to="/my-posts">View My Posts</Link></li>
          <li><Link to="/submit-post">Submit New Post</Link></li>
        </ul>
      </nav>
      {/* Content writer specific functionality */}
    </div>
  )
}

export default WriterDashboard