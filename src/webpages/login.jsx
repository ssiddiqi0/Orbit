import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => { // No need to pass email and password here
    try {
      const response = await axios.post('http://localhost:5002/login', { email, password });
      const { token } = response.data;
  
      // Store the token (in localStorage, sessionStorage, or cookie)
      localStorage.setItem('authToken', token);
  
      // Redirect to the profile page
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : 'Server error');
    }
  };

  return (
    <div className="login-container">
        <Navbar/>
      <h2>Login</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className='button1'>Login</button>
      </form>
      <p>Don't have an account? <a href="/createProfile">Sign up</a></p>
    </div>
  );
};

export default Login;
