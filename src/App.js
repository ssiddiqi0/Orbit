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
import Feedback from './webpages/private/feedback';
import HomePage from './webpages/homepage';
import Login from './webpages/login';
import AppUpdates from './webpages/private/appupdates';
import { useNavigate } from "react-router-dom";



  function App() {
    return (

      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="createProfile" element={<CreateProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="group/:groupId" element={<GroupPage />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="app-updates" element={<AppUpdates />} />
          </Routes>
        </div>
      </div>
    );
  
}


export default App;
