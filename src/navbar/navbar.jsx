import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(atob(base64));

        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true); // Token is valid
        } else {
          localStorage.removeItem('authToken'); // Token expired, clear it
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('authToken'); // Invalid token
      }
    }
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <Link to="/home">O R B I T</Link>
        </div>
        <div className="navbar-links">
          {isLoggedIn && (
            <>
              <Link to="/calendar" className="navbar-link">
                c a l e n d a r
              </Link>
              <Link to="/profile" className="navbar-link">
                p r o f i l e
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
