import React, { useState, useEffect } from 'react';
import PlanTrip from './PlanTrip'; // Import PlanTrip component
import './members.css';

const ItineraryList = ({ groupId }) => {
  const [itineraries, setItineraries] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'plan'
  const [currentItinerary, setCurrentItinerary] = useState(null); // Selected itinerary for editing
  const [error, setError] = useState('');

  // Fetch itineraries for the group
  const fetchItineraries = async () => {
    try {
      const response = await fetch(`http://localhost:5002/groups/${groupId}/itineraries`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setItineraries(data);
      } else {
        setError('Failed to fetch itineraries.');
      }
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Error fetching itineraries.');
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [groupId]);

  const handleCreateNew = () => {
    setCurrentItinerary(null); // Clear selected itinerary
    setView('plan'); // Switch to PlanTrip for creating a new itinerary
  };

  const handleEdit = (itinerary) => {
    setCurrentItinerary(itinerary); // Set the selected itinerary
    setView('plan'); // Switch to PlanTrip for editing
  };

  const handleReturnToList = () => {
    setView('list'); // Switch back to list view
    fetchItineraries(); // Refresh itineraries
  };

  const handleDelete = async (itineraryId) => {
    try {
      const response = await fetch(
        `http://localhost:5002/groups/${groupId}/itineraries/${itineraryId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setItineraries((prev) => prev.filter((itinerary) => itinerary._id !== itineraryId));
      } else {
        setError('Failed to delete itinerary.');
      }
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('Error deleting itinerary.');
    }
  };

  if (view === 'plan') {
    return (
      <PlanTrip
        groupId={groupId}
        initialItinerary={currentItinerary}
      
        onSaveComplete={handleReturnToList}
      />
    );
  }

  return (
    <div className="members-container">
      <h2>Group Itineraries</h2>
      {error && <p className="error-message">{error}</p>}
      <ul className="members-list">
        {itineraries.map((itinerary) => (
          <li key={itinerary._id} className="member-item">
            <div className="member-info">
              <p className="member-name">{itinerary.name}</p>
            </div>
            <button className="button1" onClick={() => handleEdit(itinerary)}>
              View
            </button>
            <button
              className="button1 delete-button"
              onClick={() => handleDelete(itinerary._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button className="button1" onClick={handleCreateNew}>
        Create New Itinerary
      </button>
    </div>
  );
};

export default ItineraryList;
