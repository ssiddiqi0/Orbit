import React, { useState } from 'react';

const PostUpdate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      background: 'rgba(50, 50, 50, 0.2)',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    buttonHover: {
      background: '#45a049',
    },
  };
  
  const handlePostUpdate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/app-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        alert('Update posted successfully!');
        setTitle('');
        setDescription('');
      } else {
        alert('Failed to post update');
      }
    } catch (err) {
      console.error('Error posting update:', err);
    }
  };

  return (
    <div style={styles.container}>
  <h2 style={{ color: 'white' }}>Post a New Update</h2>
  <input
    type="text"
    placeholder="Update Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={styles.input}
  />
  <textarea
    placeholder="Describe the update"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    style={{ ...styles.input, height: '100px', resize: 'none' }}
  />
  <button
    style={styles.button}
    onMouseOver={(e) => (e.target.style.background = styles.buttonHover.background)}
    onMouseOut={(e) => (e.target.style.background = styles.button.background)}
    onClick={handlePostUpdate}
  >
    Post Update
  </button>
</div>

  );
};

export default PostUpdate;
