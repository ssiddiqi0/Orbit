import React, { useEffect, useState } from 'react';
import pinkplanet from '../photos/pink-planet.png';
import '../styles/HomePage.css'; // Import styles

const HomePage = () => {
  const [appUpdates, setAppUpdates] = useState([]);

  useEffect(() => {
    const fetchAppUpdates = async () => {
      try {
        const response = fetch(`${process.env.REACT_APP_API_URL}/app-updates`);
        if (response.ok) {
          setAppUpdates(await response.json());
        }
      } catch (err) {
        console.error('Error fetching app updates:', err);
      }
    };

    fetchAppUpdates();
  }, []);

  return (
    <div className="homepage-container">
      <h1>Stay in sync with Orbit</h1>
      <em>— where every group revolves around seamless connection and effortless coordination —</em>
      <img src={pinkplanet} alt="Example" className="planet-image" />

      {/* 🚀 App Updates Section */}
      <div className="updates-section">
        <h2>Latest Updates</h2>
        {appUpdates.length > 0 ? (
          appUpdates.map((update, index) => (
            <div key={update._id} className="update-card">
              <h3 className="post-title">{update.title}</h3>
              <p className="post-paragraph">{update.description}</p>
              <p className="post-date">📅 {new Date(update.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No recent updates.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
