import React, { useState, useEffect } from 'react';
import './members.css';

const Members = ({ members = [], admins = [], currentUserId, groupId, groupName }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [memberList, setMemberList] = useState([]);

  const isCurrentUserAdmin = admins.some((admin) => admin._id === currentUserId);

  // Fetch updated members list from backend
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Merge admins and members while removing duplicates
        const uniqueMembers = [...new Map([...data.members, ...data.admins].map(member => [member._id, member])).values()];
  
        setMemberList(uniqueMembers);
      } else {
        throw new Error('Failed to fetch members');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  // Fetch members when component mounts
  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  // Handle adding a member
  const handleAddMember = async () => {
    if (!email) {
      setError('Please enter an email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add member');

      setEmail(''); // Clear input field
      setShowAddMemberInput(false); // Hide input after successful addition
      fetchMembers(); // Refresh the members list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (memberId, memberName) => {
    if (memberId === currentUserId) {
      alert("You can't remove yourself from the group.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove "${memberName}" from the group "${groupName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to remove member');

      fetchMembers(); // Refresh the members list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="members-container">
      <h2 className="members-title">Group Members</h2>

      {isCurrentUserAdmin && (
        <div className="add-member">
          {!showAddMemberInput ? (
            <button className="button1" onClick={() => setShowAddMemberInput(true)}>
              Add Member
            </button>
          ) : (
            <div className="add-member-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member email"
                className="member-input"
              />
              <button onClick={handleAddMember} className="button1" disabled={loading}>
                {loading ? 'Adding...' : 'Confirm'}
              </button>
              <button className="button1 cancel-button" onClick={() => setShowAddMemberInput(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <ul className="members-list">
        {memberList.map((member) => (
          <li key={member._id} className="member-item">
            <div className="member-avatar">
              <img
                src={member.profilePicture || 'https://i.pinimg.com/564x/81/70/7e/81707e9a95a49d5b3cd94a7ba3d71a22.jpg'}
                alt={`${member.name}'s profile`}
                className="member-profile-photo"
              />
            </div>
            <div className="member-info">
              <h3 className="member-name">{member.name} {member._id === currentUserId ? "(You)" : ""}</h3>
              <p className="member-email">Email: {member.email}</p>
              <p className="member-role">
                Role: {admins.some((admin) => admin._id === member._id) ? 'Admin' : 'Member'}
              </p>
            </div>
            <div className='remove'>
            {isCurrentUserAdmin && member._id !== currentUserId && (
              <button
                className="button1 remove-button"
                onClick={() => handleRemoveMember(member._id, member.name)}
              >
                Remove Member
              </button>
            )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Members;
