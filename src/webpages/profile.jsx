import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.group("No token\n");
        navigate('/home');
        return;
      }

      try {
        const response = await fetch('http://localhost:5002/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log("Response waiting\n");
        if (response.ok) {

          const data = await response.json();
          setUser(data);
        } else {
          console.log("Didn't go to profile");
          navigate('/home');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        navigate('/home');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/home');
      return;
    }

    const groupData = {
      name: groupName,
      description: groupDescription,
      members: groupMembers.split(','),
    };

    try {
      const response = await fetch('http://localhost:5002/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        console.log('Group created successfully');
        setShowCreateGroupForm(false);
        setGroupName('');
        setGroupDescription('');
        setGroupMembers('');
      } else {
        console.error('Error creating group');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <>
      {/* Main Profile Container */}
      <div className="profile-container">
        <Navbar />
        <h2>Profile</h2>
        {user ? (
          <div className="profile-content">
            <div className="profile-icon">
              <img src="https://i.pinimg.com/564x/81/70/7e/81707e9a95a49d5b3cd94a7ba3d71a22.jpg" alt="Profile Icon" />
            </div>
            <div className="profile-details">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p className="profile-bio">This is a short bio or tagline about the user.</p>
            </div>
            <div className="profile-actions">
              <button
                onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}
                className="button1"
              >
                {showCreateGroupForm ? 'Cancel' : 'Create Group'}
              </button>
              <button onClick={() => navigate('/view-groups')} className="button1">View Your Groups</button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Create Group Form Outside the Profile Container */}
      {showCreateGroupForm && (
        <div className="create-group-container">
          <form className="create-group-form" onSubmit={handleCreateGroup}>
            <div>
              <label htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe your group"
              />
            </div>
            <div>
              <label htmlFor="group-members">Invite Members (comma-separated emails)</label>
              <input
                id="group-members"
                type="text"
                value={groupMembers}
                onChange={(e) => setGroupMembers(e.target.value)}
              />
            </div>
            <button type="submit" className="button1">Create</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Profile;
