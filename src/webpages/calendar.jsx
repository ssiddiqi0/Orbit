import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const CalendarPage = () => {
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); // To redirect unauthenticated users

  const localizer = momentLocalizer(moment);

  // Ensure user is logged in before rendering the page
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/home'); // Redirect to home if no token exists
      return;
    }
  }, [navigate]);

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

  // Handle user login and authorization
  const handleAuthCallback = async (response) => {
    if (response.error) {
      console.error('Error during authentication:', response);
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
      window.tokenClient.requestAccessToken({ prompt: '' });
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
      navigate('/home'); // Redirect to home after logout
    }
  };

  // Fetch calendar events
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
        title: event.summary || 'Busy',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  return (
    <div className="calendar-page">
      <h1>My Calendar</h1>
      {!isAuthorized ? (
        <div>
          <button className="button1" onClick={handleAuthClick}>
            Authorize
          </button>
        </div>
      ) : (
        <>
          <div>
            <button className="button1" onClick={handleSignOutClick}>
              Sign Out
            </button>
          </div>
          <div className="calendar-container">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '500px' }}
            />
          </div>
          <div className="events-container">
            <h2>Upcoming Events</h2>
            {events.length === 0 ? (
              <p>No events found.</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="event-item">
                  <strong>{event.title}</strong>
                  <p>
                    {new Date(event.start).toLocaleString()} -{' '}
                    {new Date(event.end).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarPage;
