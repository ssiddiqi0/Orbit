import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();

  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const fetchGroup = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/home');
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5002/groups/${groupId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setGroup(data);
        } else {
          console.error('Failed to fetch group');
          navigate('/profile');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        navigate('/profile');
      }
    };
  
    fetchGroup();
  }, [groupId, navigate]);
  
  // Add this useEffect to fetch group events:
  useEffect(() => {
    if (group) {
      fetchGroupEvents();
    }
  }, [group]); // This runs whenever `group` changes
  

  // Load GAPI and GIS
  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });

            const storedToken = JSON.parse(localStorage.getItem('gapiToken'));
            if (storedToken) {
              window.gapi.client.setToken(storedToken);
              setIsAuthorized(true);
              fetchEvents();
            }
          } catch (err) {
            console.error('Error initializing GAPI Client:', err);
          }
        });
      }
    };

    const initializeGis = () => {
      if (window.google) {
        window.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: handleAuthCallback,
        });
      }
    };

    if (window.gapi) {
      loadGapi();
    }

    if (window.google) {
      initializeGis();
    }
  }, []);

  // Handle Google Authorization
  const handleAuthCallback = async (response) => {
    if (response.error) {
      console.error('Google Auth Error:', response);
      return;
    }
    setIsAuthorized(true);

    // Store token in localStorage
    const token = window.gapi.client.getToken();
    localStorage.setItem('gapiToken', JSON.stringify(token));

    fetchEvents();
  };

  const handleAuthClick = () => {
    const token = window.gapi.client.getToken();
    if (!token || token.expires_in < Date.now()) {
      window.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      setIsAuthorized(true);
      fetchEvents();
    }
  };

  const handleSignOutClick = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
      localStorage.removeItem('gapiToken');
      setIsAuthorized(false);
      setEvents([]);
    }
  };
  const createMockEvents = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('User not logged in');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5002/mock-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: 'hello@gmail.com', // Example email
          groupId, // Current group ID
        }),
      });
  
      if (response.ok) {
        console.log('Mock events created successfully');
        fetchGroupEvents(); // Refresh group events
      } else {
        console.error('Failed to create mock events');
      }
    } catch (err) {
      console.error('Error creating mock events:', err);
    }
  };
  const fetchEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: 'startTime',
      });
  
      const items = response.result.items || [];
      const formattedEvents = items.map((event) => ({
        googleEventId: event.id,
        title: event.summary || 'Busy',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        type: 'personal',
      }));
  
      setEvents((prevEvents) => {
        const existingEventIds = new Set(prevEvents.map((event) => event.googleEventId));
        const uniqueNewEvents = formattedEvents.filter((event) => !existingEventIds.has(event.googleEventId));
        return [...prevEvents, ...uniqueNewEvents];
      });
    } catch (err) {
      console.error('Error fetching events:', err);
  
      // Handle UNAUTHENTICATED error
      if (err.result?.error?.status === 'UNAUTHENTICATED') {
        console.warn('User is not authenticated with Google Calendar');
        setIsAuthorized(false); // Set authorization state to false
        localStorage.removeItem('gapiToken'); // Clear the token from localStorage
      }
    }
  };
  
  
  const fetchGroupEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5002/groups/${groupId}/events`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        const groupEvents = data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          type: 'group',
        }));
  
        setEvents((prevEvents) => {
          const existingEventIds = new Set(prevEvents.map((event) => event.googleEventId || event._id));
          const uniqueNewEvents = groupEvents.filter((event) => !existingEventIds.has(event.googleEventId || event._id));
          return [...prevEvents, ...uniqueNewEvents];
        });
      } else {
        console.error('Failed to fetch group events');
      }
    } catch (err) {
      console.error('Error fetching group events:', err);
    }
  };
  
  
  const eventStyleGetter = (event) => {
    if (event.type === 'personal') {
      return {
        className: 'personal-event', // Assign a class for personal events
      };
    } else if (event.type === 'group') {
      return {
        className: 'group-event', // Assign a class for group events
      };
    }
    return {}; // Default styling for events without a specific type
  };
  

  if (!group) return <p>Loading...</p>;

  return (
    <div className="group-page">
      <h1>{group.name}</h1>
      <p>{group.description}</p>

      <h3>Members:</h3>
      <ul>
        {group.members.map((member) => (
          <li key={member._id}>
            {member.name} ({member.email})
          </li>
        ))}
      </ul>

      <button onClick={() => setShowCalendar(!showCalendar)} className="button1">
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      <button onClick={createMockEvents} className="button1">
  Create Mock Events
</button>


{showCalendar && (
  <>
    {!isAuthorized ? (
      <div className="not-authorized-container">
        <p className="not-authorized-message">You are not signed into your Google Calendar.</p>
        <button onClick={handleAuthClick} className="button1">
          Authorize Google Calendar
        </button>
      </div>
    ) : (
      <>
        <button onClick={handleSignOutClick} className="button1">
          Sign Out
        </button>
        <div className="calendar-container">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '500px', marginTop: '20px' }}
            eventPropGetter={eventStyleGetter}
          />
        </div>
      </>
    )}
  </>
)}
    </div>
  );
};

export default GroupPage;
