import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const Calendar = ({ groupId, events: groupEvents }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const localizer = momentLocalizer(moment);

  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

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
              fetchPersonalEvents();
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

  const handleAuthCallback = async (response) => {
    if (response.error) {
      console.error('Google Auth Error:', response);
      return;
    }

    setIsAuthorized(true);

    const token = window.gapi.client.getToken();
    localStorage.setItem('gapiToken', JSON.stringify(token));

    await fetchPersonalEvents();
  };

  const fetchPersonalEvents = async () => {
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
        title: event.summary || 'No Title',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        type: 'personal',
      }));

      setCalendarEvents((prevEvents) => {
        const allEvents = [...prevEvents, ...formattedEvents];
        const uniqueEvents = Array.from(
          new Map(allEvents.map((event) => [event.googleEventId || event._id, event])).values()
        );
        return uniqueEvents;
      });
    } catch (err) {
      console.error('Error fetching personal events:', err);
    }
  };

  useEffect(() => {
    setCalendarEvents((prevEvents) => {
      const allEvents = [...prevEvents, ...groupEvents];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.googleEventId || event._id, event])).values()
      );
      return uniqueEvents;
    });
  }, [groupEvents]);

  const handleSignOutClick = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
      localStorage.removeItem('gapiToken');
      setIsAuthorized(false);
      setCalendarEvents([]); // Clear all events
    }
  };
  const handleRefresh = async () => {
    try {
      console.log('Refreshing calendar events...');
      await fetchPersonalEvents();
    } catch (err) {
      console.error('Error refreshing calendar events:', err);
    }
  };

  const eventStyleGetter = (event) => {
    if (event.type === 'personal') {
      return {
        className: 'personal-event',
      };
    } else if (event.type === 'group') {
      return {
        className: 'group-event',
      };
    }
    return {};
  };

  return (
    <div className="calendar-container">
      {!isAuthorized ? (
        <div className="not-authorized-container">
          <p className="not-authorized-message">You are not signed into your Google Calendar.</p>
          <button
            onClick={() => window.tokenClient.requestAccessToken({ prompt: 'consent' })}
            className="button1"
          >
            Authorize Google Calendar
          </button>
        </div>
      ) : (
        <>
          
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '500px', marginTop: '20px' }}
            eventPropGetter={eventStyleGetter}
          />
          <button onClick={handleSignOutClick} className="button1">
            Sign Out
          </button>
          <button onClick={handleRefresh} className="button1">
            Refresh
          </button>
        </>
      )}
    </div>
  );
};

export default Calendar;
