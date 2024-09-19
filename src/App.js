import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './navbar/navbar';
import axios from 'axios';
import pinkplanet from './photos/pink-planet.png';
import './App.css';
import Profile from './webpages/profile';
import CreateProfile from './webpages/createProfile';

function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
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
    <div>
      <h1>Stay in sync with Orbit</h1>
      <em>— where every group revolves around seamless connection and effortless coordination —</em>
      <img src={pinkplanet} alt="Example" className="planet-image" />

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
        <p>Don't have an account? <a href="/createProfile">Sign up</a></p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/createProfile" element={<CreateProfile />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
