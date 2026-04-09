// src/pages/HomePage.js
import React from 'react';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to the Blog!</h1>
      {isAuthenticated ? (
        <>
          <p>Hello, {user.username} ({user.role})</p>
          {isAdmin && <p><Link to="/admin/posts">Go to Admin Dashboard</Link></p>}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p><Link to="/login">Login</Link> or <Link to="/register">Register</Link> to get started.</p>
      )}
      <p>This is the public home page. Here you might list recent blog posts for all users.</p>
      <Link to="/posts">View All Blog Posts (Public)</Link>
    </div>
  );
}
export default Home;