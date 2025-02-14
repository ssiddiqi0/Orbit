import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes} from 'react-router-dom';
import Navbar from './navbar/navbar';
import axios from 'axios';
import pinkplanet from './photos/pink-planet.png';
import { Link } from 'react-router-dom';
import './App.css';
import Profile from './webpages/profile';
import CreateProfile from './webpages/createProfile';
import GroupPage from './webpages/Group/GroupPage';
import Calendar from './webpages/Group/calendar';
import Feedback from './webpages/feedback'
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://orbit-mlj6.onrender.com/login', { email, password });
      const { token } = response.data;

      // Store the token
      localStorage.setItem('authToken', token);

      // Correct way to navigate using React Router
      navigate("/profile"); 
    } catch (error) {
      alert("User not found");
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
        <p>Don't have an account? <Link to="/createProfile">Sign up</Link></p>

      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="createProfile" element={<CreateProfile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="group/:groupId" element={<GroupPage />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="feedback" element={<Feedback />} />
        </Routes>
      </div>
    </div>
  );
}



export default App;
