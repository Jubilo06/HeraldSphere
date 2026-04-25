import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import axios from 'axios'
import api from "./Api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(()=>{
    try {
      const storedUser = localStorage.getItem('user');
      // Safely parse the storedUser string
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsedUser = JSON.parse(storedUser);
        // Ensure token is also present for a complete login state
        if (parsedUser.token) {
            return parsedUser;
        }
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('user'); // Clear potentially corrupted data
    }
    return null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
   const [isLoading, setIsLoading] = useState(true);
   const navigate = useNavigate();
 
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // setToken(storedToken);
          // setUser(userData);
          if (userData && storedToken && userData.token === storedToken) { // Basic consistency check
            setUser(userData);
            setToken(storedToken);
          } else {
            console.warn("AuthContext: Stored user data or token inconsistent, performing logout.");
            logout(); // Clear potentially inconsistent data
          }
        } catch (e) {
          console.error("Auth initialization failed or token invalid:", e);
          logout(); // Clear invalid data or expired token
        }
      }else {
        // If no token or user in localStorage, ensure states are null
        setUser(null);
        setToken(null);
      }
      setIsLoading(false); // <--- SET LOADING TO FALSE AFTER ATTEMPTING TO INITIALIZE
    };

    initializeAuth();
  }, []); // Run only once on mount
  
  const login = useCallback((userData, receivedToken) => {
    console.log("AuthContext: Attempting login...");
    console.log("AuthContext: Received user data:", userData);
    console.log("AuthContext: Received token:", receivedToken);

    try {
      // Combine user data and token for storage
      localStorage.setItem('token', receivedToken); // <-- NEW: Store token in its own key
      setToken(receivedToken); // <-- NEW: Update the token state
       const userToStore = { ...userData };
       userToStore.token = receivedToken;
      
      // const userWithToken = { ...userData, receivedToken };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore); // Update state

      console.log("AuthContext: User state updated and data stored in localStorage.");
      navigate('/admin/posts/new'); // Or wherever you want to navigate after login
                              // Make sure '/dashboard' is a valid route
    } catch (error) {
      console.error("AuthContext: Error during login process (localStorage set or state update):", error);
      // Re-throw the error so it can be caught by the Login.jsx component
      throw error;
    }
  }, [navigate]); // navigate is a dependency

   const logout =useCallback( () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user && user.role === 'admin';

   const register = async (userData, config = {}) => {
    console.log("3. Inside the context's register function."); 
    try {
      const response = await api.post('/api/auth/register', userData, config);
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }
      return response;
    } catch (error) {
      // console.error("Error from API call in context:", error); 
      // throw new Error(error.response?.data || 'An unknown error occurred.');
      console.error('Full Registration Error on Device:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: { url: error.config?.url, method: error.config?.method },
        origin: window.location.origin,
        userAgent: navigator.userAgent
      });
      let errorMessage = 'An unknown error occurred.';
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.response?.status === 0) {
        errorMessage = 'Network/CORS error: Request blocked. Check connection or browser settings.';
      } else if (error.response?.status === 403 || error.message.includes('CORS')) {
        errorMessage = 'CORS blocked: Origin not allowed. Update server config.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Access denied. Try incognito mode.';
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        errorMessage = error.response.data?.error || 'Invalid data. Check form.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Check Vercel logs.';
      } else {
        errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      throw new Error(errorMessage);  // Now shows specific cause
    
    }
  };

  const value = {  user, token, isAuthenticated, isAdmin, login, logout, isLoading, register};
  if (isLoading) {
    return <div>Loading Application...</div>;
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);
};
