import React from 'react';
import Navbar from './navbar/navbar';
import pinkplanet from './photos/pink-planet.png'
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        {/* Your main content goes here */}
        <h1>Stay in sync with Orbit</h1>
        <em>—where every group revolves around seamless connection and effortless coordination-
        </em>
        <img src={pinkplanet} alt="Example" className="planet-image" />
      </div>
    </div>
  );
}

export default App;
