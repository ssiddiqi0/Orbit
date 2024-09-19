import React, { useState } from 'react';
import Navbar from '../navbar/navbar';
import { useNavigate } from 'react-router-dom';

function CreateProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    id: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); // Log the form data
    try {
      const response = await fetch('http://localhost:5002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json(); // Extract the token
      localStorage.setItem('authToken', data.token);
        navigate('/profile'); // Redirect to profile page after successful sign-up
      } else {
        alert('Failed to sign up.');
      }
    } catch (err) {
      console.error(err);
      alert('Error during sign up.');
    }
  };

  return (
    <div className="content">
      <Navbar />
      <div className="signup-profile">
        <h2>Create Profile</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {/* <div>
            <label>Unique ID:</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div> */}
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className='button1'>Create Profile</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
