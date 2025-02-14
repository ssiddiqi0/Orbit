import React, { useState } from 'react';
import './plantrip.css';

const PlanTrip = ({ groupId, initialItinerary, onSaveComplete }) => {
  const [destination, setDestination] = useState(initialItinerary?.name || '');
  const [days, setDays] = useState(initialItinerary?.days || '');
  const [details, setDetails] = useState(initialItinerary?.details || '');
  const [itinerary, setItinerary] = useState(initialItinerary?.content || '');
  const [isEditing, setIsEditing] = useState(false); // Starts in view mode
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Generate a new itinerary
  const handleGenerateItinerary = async () => {
    if (!destination || !days) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setItinerary('Generating itinerary...');

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, days, details }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generating itinerary');
      }

      const data = await response.json();
      setItinerary(data.itinerary); // Update itinerary state
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate itinerary. Please try again later.');
      setItinerary('');
    }
  };

  // Save the itinerary (new or edited)
  const handleSaveItinerary = async () => {

    try {
      const response = await fetch(
        initialItinerary
          ? `${process.env.REACT_APP_API_URL}/groups/${groupId}/itineraries/${initialItinerary._id}`
          : `${process.env.REACT_APP_API_URL}/groups/${groupId}/itineraries`,
        {
          method: initialItinerary ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: destination,
            days,
            details,
            content: itinerary,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage('Itinerary saved successfully!');
        if (onSaveComplete) onSaveComplete(); // Notify parent to return to the list
      } else {
        setError('Failed to save itinerary.');
      }
    } catch (err) {
      console.error('Error saving itinerary:', err);
      setError('Error saving itinerary.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Exit edit mode
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


  const renderViewMode = () => (
    <div className="container">
      <h2>Trip to {destination}!</h2>
      {/* <p><strong>Days:</strong> {days}</p>
      <p><strong>Details:</strong> {details || 'No additional details provided.'}</p> */}
      <div className="itinerary-output">
        <h3>Generated Itinerary</h3>
        <ul>{renderItinerary()}</ul>
      </div>
      <button className="button1" onClick={() => setIsEditing(true)}>
        Edit
      </button>
      <button className="button1" onClick={handleSaveItinerary}>
        Save Itinerary
      </button>
      <button className="button1" onClick={onSaveComplete}>
        Return to List
      </button>
    </div>
  );

  const renderEditMode = () => (
    <div className="container">
      <h2>Edit Itinerary</h2>
      <textarea
        value={itinerary}
        onChange={(e) => setItinerary(e.target.value)}
        className="itinerary-editor"
        placeholder="Edit the itinerary details..."
      />
      <button className="button1" onClick={handleSaveItinerary}>
        Save Changes
      </button>
      <button className="button1" onClick={handleCancelEdit}>
        Cancel
      </button>
    </div>
  );

  const renderGenerateForm = () => (
    <div>
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

  <label htmlFor="details">Add Specifics</label>
  <textarea
    id="details"
    value={details}
    onChange={(e) => setDetails(e.target.value)}
    className="itinerary-editor"
    placeholder="Enter additional details..."
  />
</div>

      <button className="button1" onClick={handleGenerateItinerary}>
        Generate Itinerary
      </button>
      <button className="button1" onClick={onSaveComplete}>
        Return to List
      </button>
    </div>
  );

  return (
    <div className="plan-trip-container">
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {itinerary ? (isEditing ? renderEditMode() : renderViewMode()) : renderGenerateForm()}
    </div>
  );
};

export default PlanTrip;
