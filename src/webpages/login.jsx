import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New state for error messages
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email, password });
      const { token } = response.data;
  
      // Store the token
      localStorage.setItem('authToken', token);
  
      // Redirect to the profile page
      navigate('/profile');
    } catch (error) {
      // Check if the response has an error message
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data); // Set error message from backend
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <Navbar/>
      <div className="login-container">
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

        {/* Display error message if login fails */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p>Don't have an account? <Link to="/createProfile">Sign up</Link></p>
      </div>
    </>
  );
};

export default Login;
