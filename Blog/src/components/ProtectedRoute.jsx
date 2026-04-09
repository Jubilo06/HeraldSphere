import React from 'react'
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function ProtectedRoute({ adminOnly }) {
    const { isAuthenticated, isAdmin, isLoading, user } = useContext(AuthContext);
  // You might want a loading spinner here while auth state is determined
  console.log("ProtectedRoute: isLoading:", isLoading);
  console.log("ProtectedRoute: isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute: user:", user);
  console.log("ProtectedRoute: adminOnly:", adminOnly);
  console.log("ProtectedRoute: user role:", user?.role);
  
  if (isLoading){
    console.log("ProtectedRoute: Still loading auth, showing loading spinner.");
    return <div>Authenticating...</div>;
  }  

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    console.log("ProtectedRoute: User not authenticated, redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    console.log("ProtectedRoute: User is authenticated but not an admin, redirecting.");
    // Redirect non-admin users if the route is admin-only
    return <Navigate to="/" replace />; // Or to an unauthorized page
  }
  console.log("ProtectedRoute: User is authorized, rendering Outlet.");
  // Render the child routes if authenticated and authorized
  return <Outlet />;
}



export default ProtectedRoute