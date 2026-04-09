// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // If you want to auto-login after register

function Register() {
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({  username: '', password: '', role:'user' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } =useContext(AuthContext) ; // For auto-login

  const handleChange = (e) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend /api/auth/register endpoint
      // const response = await axios.post('http://localhost:5014/api/auth/register', { username, password, role: 'user' });
      const response = await register(formData)
      // If registration also returns a token and user data, you can auto-login
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      } else {
        navigate('/login'); // Redirect to login if no auto-login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" name='username' value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name='password' value={formData.password} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}
export default Register;