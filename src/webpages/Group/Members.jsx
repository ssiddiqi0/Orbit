import React from 'react';
import './members.css';

const Members = ({ members = [], admins = [] }) => {
  // Combine admins and members into a single array
  const allMembers = [...admins, ...members];

  return (
    <div className="members-container">
      <h2 className="members-title">Group Members</h2>
      <ul className="members-list">
        {allMembers.map((member) => (
          <li key={member._id} className="member-item">
            <div className="member-avatar">
              <img
                src={member.profilePicture || 'https://i.pinimg.com/564x/81/70/7e/81707e9a95a49d5b3cd94a7ba3d71a22.jpg'} // Default profile picture
                alt={`${member.name}'s profile`}
                className="member-profile-photo"
              />
            </div>
            <div className="member-info">
              <h3 className="member-name">{member.name}</h3>
              <p className="member-email">Email: {member.email}</p>
              <p className="member-role">
                Role: {admins.some((admin) => admin._id === member._id) ? 'Admin' : 'Member'}
              </p>
              {member.joinDate && (
                <p className="member-join-date">
                  Joined: {new Date(member.joinDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Members;
