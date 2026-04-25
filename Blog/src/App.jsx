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
import EditProfile from './components/EditProfile'
import WriterDashboard from './components/WriterDashboard'
import WriterPostForm from './components/WriterPostForm'
import MyPost from './components/MyPost'
import AdminDashboard from './components/AdminDashboard'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/AuthContext'
import './App.css'
import Nav from './components/Nav'


function Navigation() {
  const { isAuthenticated, isAdmin, logout, user, register, login } = useContext(AuthContext);

  return (
    <div>
      <Nav />
    </div>
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
            <Route path="/posts/category/:categoryName" element={<PublicPostList />} />
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute  />}>
              {/* These routes are only accessible to authenticated admins */}
              <Route path="/writer/dashboard" element={<WriterDashboard />} />
              <Route path="/edit-profile" element={<EditProfile />}
        />
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
