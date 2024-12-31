import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const navigate = useNavigate();

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
        console.error('Error:', err);
        navigate('/profile');
      }
    };

    fetchGroup();
  }, [groupId, navigate]);

  if (!group) return <p>Loading...</p>;

  return (
    <div className="group-page">
      <h1>{group.name}</h1>
      <p>{group.description}</p>
      <h3>Members:</h3>
      
        {group.members.map((member) => (
          <li key={member._id}>{member.name} ({member.email})</li>
        ))}
     <h2>Admin: </h2>
    </div>
  );
};

export default GroupPage;
