import React, { useState } from 'react';
import './plantrip.css';

const PlanTrip = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [error, setError] = useState('');

  const handleGenerateItinerary = async () => {
    if (!destination || !days) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setItinerary('Generating itinerary...');

    try {
      const response = await fetch('http://localhost:5002/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, days }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generating itinerary');
      }

      const data = await response.json();
      setItinerary(data.itinerary);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate itinerary. Please try again later.');
      setItinerary('');
    }
  };

  const renderItinerary = () => {
    if (!itinerary) return null;

    // Parse the itinerary string into structured HTML
    return itinerary.split('\n').map((line, index) => {
        if (line.startsWith('**Day')) {
            return <h2 key={index} className="day-title">{line.replace(/\*\*/g, '')}</h2>;
          } else if (line.startsWith('**')) {
            return <h4 key={index} className="section-heading">{line.replace(/\*\*/g, '')}</h4>;
          } else if (line.startsWith('*')) {
            const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace('* ', '');
            return (
          <li
            key={index}
            className="itinerary-item"
            dangerouslySetInnerHTML={{ __html: boldedLine }}
          />
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        const boldedText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p
            key={index}
            className="itinerary-text"
            dangerouslySetInnerHTML={{ __html: boldedText }}
          />
        );
      }
    });
  };

  return (
    <div className="plan-trip-container">
      <h2>Plan Your Trip</h2>
      <div className="input-container">
        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter your destination"
        />
        <label htmlFor="days">Number of Days</label>
        <input
          id="days"
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Enter number of days"
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleGenerateItinerary} className="button1">
        Generate Itinerary
      </button>
      <div className="itinerary-output">
        <h3>Generated Itinerary</h3>
        <div className="itinerary">{renderItinerary()}</div>
      </div>
    </div>
  );
};

export default PlanTrip;
