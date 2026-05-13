import { useState, useContext } from 'react'
import Home from './components/Home'
import PublicPostList from './components/PublicPostList'
import PublicPostDetail from './components/PublicPostDetail'
import NotFoundPage from './components/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import EditProfile from './components/EditProfile'
import WriterDashboard from './components/WriterDashboard'
import WriterPostForm from './components/WriterPostForm'
import MyPost from './components/MyPost'
import AdminDashboard from './components/AdminDashboard'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/AuthContext'
import './App.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import About from './components/About'
import Contact from './components/Contact'
import { Terms } from './components/Terms'
import { Privacy } from './components/Privacy'
import { Cookies } from './components/Cookies'
import { HelmetProvider } from 'react-helmet-async';

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
    <HelmetProvider>
      <Router>
      <AuthProvider> {/* Wrap your entire app with AuthProvider */}
        <div className="flex w-full flex-col min-h-screen bg-white">
          <Navigation /> {/* Global navigation */}
          {/* MAIN CONTENT AREA */}
          <main className="grow min-h-screen w-full ">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/posts" element={<PublicPostList />} />
            <Route path="/posts/:slug" element={<PublicPostDetail />} /> {/* Route for single public post */}
            <Route path="/posts/category/:categoryName" element={<PublicPostList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
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
              <Route path="/admin/posts" element={<AdminDashboard />} /> {/* Admin can see ALL posts */}
              <Route path="/admin/posts/new" element={<WriterPostForm />} /> {/* Admin can create posts */}
              <Route path="/admin/posts/edit/:id" element={<WriterPostForm />} /> {/* Admin can edit ANY post */}
            </Route>


            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
    </HelmetProvider>
    
  )
}

export default App
