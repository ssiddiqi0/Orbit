import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tabs from './tabs'; // Assuming you created a Tabs component
import Calendar from './calendar'; // Calendar component
import Feed from './Feed'; // Feed component
import PlanTrip from './PlanTrip'; // Plan Your Trip component
import Members from './Members'; // Members component
import './group-page.css'; // Your styles

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Fetch group details
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

  // Fetch group events
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
          type: event.type || 'group', // Retain event type
        }));

        setEvents(groupEvents);
      } else {
        console.error('Failed to fetch group events');
      }
    } catch (err) {
      console.error('Error fetching group events:', err);
    }
  };
  const updatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };
  
  // Fetch posts
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5002/groups/${groupId}/posts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };


  // Define tabs for the group
  const tabs = [
    { name: 'Calendar', label: 'Calendar', component: <Calendar groupId={groupId} events={events} fetchGroupEvents={fetchGroupEvents} /> },
    { name: 'Feed', label: 'Feed', component: <Feed groupId={groupId} posts={posts} fetchPosts={fetchPosts} updatePost={updatePost} /> },
    { name: 'Plan', label: 'Plan Your Trip', component: <PlanTrip groupId={groupId} /> },
    { name: 'members', label: 'Members', component: <Members 
    members={group?.members || []} 
    admins={group?.admins || []} 
  />
   },
  ];

  if (!group) return <p>Loading...</p>;

  return (
    <div className="group-page">
      <h1>{group.name}</h1>
      <p>{group.description}</p>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default GroupPage;
