// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // If you want to auto-login after register

function Register() {
  const [formData, setFormData] = useState({  
    username: '', 
    password: '',
    email:'',
    firstName:'',
    lastName:'', 
  });
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register: registerAuthContext  } =useContext(AuthContext) ; // For auto-login

  const handleChange = (e) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
  };

    const handleFileChange = (e) => {
      console.log("File selected in frontend:", e.target.files[0]);
    setProfilePic(e.target.files[0]); // Get the first file selected
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend /api/auth/register endpoint
      // const response = await axios.post('http://localhost:5014/api/auth/register', { username, password, role: 'user' });
      
      const dataToSend = new FormData();
      for (const key in formData) {
        dataToSend.append(key, formData[key]);
      }
      if (profilePic) {
        dataToSend.append('profilePic', profilePic); // Append the file
      }
      dataToSend.append('role', 'writer');
      const response = await  registerAuthContext (dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      // If registration also returns a token and user data, you can auto-login
      // if (response.data.token && response.data.user) {
      //   login(response.data.user, response.data.token);
      // } else {
      //   navigate('/login'); // Redirect to login if no auto-login
      // }
    //   if (response.status === 201) { // Explicitly check for success status
    //   // If registration also returns a token and user data, you can auto-login
    //   if (response.data.token && response.data.user) {
    //     login(response.data.user, response.data.token); // Your AuthContext should handle this
    //     navigate('/'); // Navigate to dashboard or home after successful login
    //   } else {
    //     navigate('/login'); // Redirect to login if no auto-login (or if AuthContext doesn't auto-login)
    //   }
    //   // NO setError here for success
    // } else {
    //   // If backend returns a non-201 but not an error (e.g., 200 with a different message)
    //   setError(response.data?.message || 'Unexpected registration response.');
    // }
    if (response.status === 201) {
        console.log("Registration successful! Response data:", response.data);
        // Your AuthContext's registerUser should handle calling login if it returns token/user
        // If AuthContext handles login:
        if (response.data.token && response.data.user) {
            // login(response.data.user, response.data.token); // AuthContext.registerUser should have done this
            navigate('/'); // Navigate home or dashboard
        } else {
            // If AuthContext doesn't auto-login, you might do it here or navigate to login
            navigate('/login'); 
        }
      } else {
        // This case theoretically shouldn't happen with a 201 status, but as a safeguard
        setError(response.data?.message || 'Unexpected registration response status.');
      }
    } catch (err) {
      // setError(err.response?.data?.message || 'Registration failed');
      console.error("Full Registration Error caught in Register.jsx handleSubmit:", err);
      if (err.response) {
        // Server responded with a status other than 2xx
        setError(err.response.data?.message || `Registration failed: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received (e.g., network error)
        setError('Network Error: Could not reach the server.');
      } else {
        // Something else happened while setting up the request
        setError(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input type="text" name='username' value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name='password' value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="profilePic">Profile Picture:</label>
          <input
            type="file"
            id="profilePic"
            name="profilePic"
            accept="image/*" // Only accept image files
            onChange={handleFileChange}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}> {loading ? 'Registering...' : 'Register'}</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}
export default Register;