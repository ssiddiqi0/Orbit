import React, { useState } from 'react';
import Navbar from '../navbar/navbar';
import { useNavigate } from 'react-router-dom';

function CreateProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters long.';
    if (!hasUpperCase) return 'Password must include an uppercase letter.';
    if (!hasLowerCase) return 'Password must include a lowercase letter.';
    if (!hasNumber) return 'Password must include a number.';
    if (!hasSpecialChar) return 'Password must include a special character (@$!%*?&).';

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'password') {
      setPasswordError(validatePassword(value));
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setConfirmPasswordError('Passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || confirmPasswordError) {
      alert('Please fix the errors before submitting.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        navigate('/profile');
      } else {
        alert('Failed to sign up.');
      }
    } catch (err) {
      console.error(err);
      alert('Error during sign-up.');
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
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {confirmPasswordError && <p style={{ color: 'red' }}>{confirmPasswordError}</p>}
          </div>
          <button type="submit" className="button1" disabled={!!passwordError || !!confirmPasswordError}>
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
