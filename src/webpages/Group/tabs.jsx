import React, { useState } from 'react';
import './tabs.css'; // Add styling here

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name); // Default to the first tab

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`tab-button ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.map(
          (tab) =>
            activeTab === tab.name && (
              <div key={tab.name} className="tab-panel">
                {tab.component}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Tabs;
