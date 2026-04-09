import { useState, useContext } from 'react'
import Home from './components/Home'
import PublicPostList from './components/PublicPostList'
import PublicPostDetail from './components/PublicPostDetail'
import NotFoundPage from './components/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import PostForm from './components/PostForm'
import PostList from './components/PostList'
import Login from './components/Login'
import WriterDashboard from './components/WriterDashboard'
import WriterPostForm from './components/WriterPostForm'
import MyPost from './components/MyPost'
import AdminDashboard from './components/AdminDashboard'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/AuthContext'
import './App.css'


function Navigation() {
  const { isAuthenticated, isAdmin, logout, user, register, login } = useContext(AuthContext);

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '15px' }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/posts">Blog Posts</Link></li> {/* Public blog list */}
        {isAuthenticated ? (
          <>
            <li style={{ marginLeft: 'auto', marginRight: '10px', fontWeight: 'bold' }}>
              Welcome, {user?.username}! ({user?.role})
            </li>
            {isAdmin && <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>}
            {/* Link for non-admin content writers to their dashboard */}
            {!isAdmin && <li><Link to="/writer/dashboard">My Contributions</Link></li>} 
            <li><button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap your entire app with AuthProvider */}
        <Navigation /> {/* Global navigation */}
        <div className="App" style={{ padding: '20px' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/posts" element={<PublicPostList />} />
            <Route path="/posts/:id" element={<PublicPostDetail />} /> {/* Route for single public post */}

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute  />}>
              {/* These routes are only accessible to authenticated admins */}
              <Route path="/writer/dashboard" element={<WriterDashboard />} />
              <Route path="/my-posts" element={<MyPost />} /> {/* List posts by the current user */}
              {/* <Route path="/admin/posts" element={<PostList />} /> */}
              <Route path="/submit-post" element={<WriterPostForm />} />
              <Route path="/edit-post/:id" element={<WriterPostForm />} />
            </Route>

            {/* Protected Admin Routes */}
            {/* Uses ProtectedRoute WITH adminOnly prop */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/posts" element={<PostList />} /> {/* Admin can see ALL posts */}
              <Route path="/admin/posts/new" element={<WriterPostForm />} /> {/* Admin can create posts */}
              <Route path="/admin/posts/edit/:id" element={<WriterPostForm />} /> {/* Admin can edit ANY post */}
            </Route>


            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
