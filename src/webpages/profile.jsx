import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]); // State to store groups
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/profile`, {
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user-groups`, {
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

  const handleRemovePhoto = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/photo`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowEditModal(false);
      } else {
        console.error('Failed to remove profile photo');
      }
    } catch (err) {
      console.error('Error removing profile photo:', err);
    }
  };

  const handleEditPhoto = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const formData = new FormData();

    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    } else if (newProfilePhoto) {
      formData.append('profilePicture', newProfilePhoto);
    } else {
      console.error('No photo or URL provided');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowEditModal(false);
        setNewProfilePhoto('');
        setPhotoFile(null);
      } else {
        console.error('Failed to save profile photo');
      }
    } catch (err) {
      console.error('Error saving profile photo:', err);
    }
  };

  const openEditModal = () => {
    setNewProfilePhoto(''); // Clear URL input
    setPhotoFile(null); // Clear file input
    setShowEditModal(true); // Show modal
  };
  


  const handleSignOutClick = () =>{
    // Remove the authentication token from localStorage
  localStorage.removeItem('authToken');

  // Remove Google API token if using Google services
  if (window.gapi?.client) {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        console.log('Google token revoked');
      });
      window.gapi.client.setToken(null);
      localStorage.removeItem('gapiToken');
    }
  }

  // Redirect to the home or login page
  navigate('/home');
  }
  
// Handle group creation
const handleCreateGroup = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('authToken');
  if (!token) {
    navigate('/home');
    return;
  }

  // Decode the token to get the admin's email
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const adminEmail = JSON.parse(jsonPayload).email;

  const groupData = {
    name: groupName,
    description: groupDescription,
    members: [...groupMembers.split(',').map((email) => email.trim()), adminEmail], // Include admin email
  };

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });

    if (response.ok) {
      const newGroup = await response.json();
      setSuccessMessage('Group created successfully');
      setError(null);

      setGroups((prevGroups) => [...prevGroups, newGroup]);
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
        <h1>Your Groups</h1>
        {groups.length > 0 ? (
          <div className="groups-container">
            {groups.map((group) => (
              <div
                key={group._id}
                className="group-item"
                onClick={() => navigate(`/group/${group._id}`)}
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
        <div className="profile-container">
          {user ? (
            <>
              <div className="profile-icon">
                <img
                  src={user.profilePicture || "default-profile-pic.jpg"}
                  alt="Profile"
                  className="profile-photo"
                />
                <div className="hover-options">
                  <button onClick={handleRemovePhoto}>Remove</button>
                  <button onClick={openEditModal}>Edit</button>
                </div>
              </div>
              <h1 className="profile-name">My name is {user.name}</h1>
              <div className="profile-details">
                <p className="profile-email">Email: {user.email}</p>
                {/* <p className="profile-bio">
                  {user.bio || "This is a short bio about the user."}
                </p> */}
              </div>
              <div className="profile-actions">
                <button
                  onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}
                  className="button1"
                >
                  {showCreateGroupForm ? "Cancel" : "Create Group"}
                </button>
                <button
                  onClick={() => handleSignOutClick()}
                 className="button1">Sign Out
                 </button>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        {/* Edit Profile Photo Modal */}

        {showEditModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Edit Profile Photo</h2>
                {/* URL Input */}
                <label htmlFor="photo-url">Enter Photo URL:</label>
                <input
                  id="photo-url"
                  type="text"
                  value={newProfilePhoto}
                  onChange={(e) => setNewProfilePhoto(e.target.value)}
                  placeholder="Enter image URL"
                />

                {/* File Upload */}
                <label htmlFor="photo-upload" className="custom-file-upload">
                  Choose File
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoFile(file);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewProfilePhoto(e.target.result); // Display preview
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Image Preview */}
                {photoFile && (
                  <div className="image-preview">
                    <img src={newProfilePhoto} alt="Preview" />
                  </div>
                )}

                <div className="modal-actions">
                  <button onClick={handleEditPhoto} className="button1">Save</button>
                  <button onClick={handleRemovePhoto} className="button1">Remove Photo</button>
                  <button onClick={() => setShowEditModal(false)} className="button1">Cancel</button>
                </div>
              </div>
            </div>
          )}
        {/* Create Group Form */}
        {showCreateGroupForm && (
          <div className="create-group-container">
            <form className="create-group-form" onSubmit={handleCreateGroup}>
              <label htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe your group"
              />
              <label htmlFor="group-members">
                Invite Members (comma-separated emails)
              </label>
              <input
                id="group-members"
                type="text"
                value={groupMembers}
                onChange={(e) => setGroupMembers(e.target.value)}
              />
              {error && <p className="error-message">{error}</p>}
              {successMessage && (
                <p className="success-message">{successMessage}</p>
              )}
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
