import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import styles from './profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]); // State to store groups
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/home');
        return;
      }

      try {
        const response = await fetch('http://localhost:5002/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          navigate('/home');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        navigate('/home');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch groups from the backend
  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/home');
        return;
      }

      try {
        const response = await fetch('http://localhost:5002/user-groups', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroups(data); // Store the fetched groups in state
        } else {
          console.error('Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    fetchGroups();
  }, [navigate]);

  const handleViewProfile = () => {
    console.log("View Profile clicked");
    // Redirect or open a modal for viewing the profile
  };
  
  const handleEditProfile = () => {
    console.log("Edit Profile clicked");
    // Redirect to edit profile page or open a modal
  };
  
// Handle group creation
const handleCreateGroup = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('authToken');
  if (!token) {
    navigate('/home');
    return;
  }

  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const userId = JSON.parse(jsonPayload).id;

  const groupData = {
    name: groupName,
    description: groupDescription,
    members: groupMembers.split(',').map((email) => email.trim()),
    admins: [userId],
  };

  try {
    const response = await fetch('http://localhost:5002/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });

    if (response.ok) {
      const newGroup = await response.json(); // Get the newly created group
      setSuccessMessage('Group created successfully');
      setError(null); // Reset errors

      // Update groups list with the new group
      setGroups((prevGroups) => [...prevGroups, newGroup]);

      // Clear the form inputs but keep the form open
      setGroupName('');
      setGroupDescription('');
      setGroupMembers('');
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Error creating group');
    }
  } catch (err) {
    setError('Server error, please try again later');
    console.error('Error:', err);
  }
};


  return (
    <>
      <Navbar />
      <div className="profile-page">
  {/* Sidebar: View Groups */}
  <div className="view-groups">
  <h1>View Groups</h1>
  {groups.length > 0 ? (
    <div className="groups-container">
      {groups.map((group) => (
        <div
          key={group._id}
          className="group-item"
          onClick={() => navigate(`/group/${group._id}`)} // Navigate to the group details page
        >
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
      ))}
    </div>
  ) : (
    <p>No groups found.</p>
  )}
</div>


  {/* Main Profile Section */}
  <div className="profile-main">
    {/* Profile Content */}
    <div className="profile-container">
      <h2>Profile</h2>
      {user ? (
        <div className="profile-content">
          <div className="profile-icon">
            <img src={user.profilePicture}
                alt="Profile"
                className="profile-photo"
              />
              <div className="hover-options">
                <button onClick={handleViewProfile}>View</button>
                <button onClick={handleEditProfile}>Edit</button>
              </div>
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
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>

    {/* Create Group Form */}
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
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" className="button1">
            Create
          </button>
        </form>
      </div>
    )}
  </div>
</div>

    </>
  );
};

export default Profile;
