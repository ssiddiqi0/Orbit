import React, { useState, useEffect } from 'react';
import './navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [groups, setGroups] = useState([]); // Store groups for the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown toggle
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by verifying the auth token
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    // Fetch groups if the user is logged in
    if (token) {
      fetchGroups();
    }
  }, [location]); // Re-run this check on route change

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/user-groups`, {  
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data); // Store the groups
      } else if (response.status === 401) {
        console.error('Unauthorized - logging out');
        setIsLoggedIn(false);
        localStorage.removeItem('authToken'); // Clean up invalid token
      } else {
        console.error('Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <Link to="/home">O R B I T</Link>
        </div>
        <div className="navbar-links">
        <Link to="/feedback" className="navbar-link">f e e d b a c k</Link> 
        {!isLoggedIn && (
          
          <Link to ="/login" className="navbar-link">l o g i n</Link>
        
        )}
          {isLoggedIn && (
            <>
              <div
                className="navbar-link groups-dropdown"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                g r o u p s
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <div
                          key={group._id}
                          className="dropdown-item"
                          onClick={() => navigate(`/group/${group._id}`)}
                        >
                          {group.name}
                        </div>
                      ))
                    ) : (
                      <p className="dropdown-item">No groups found</p>
                    )}
                  </div>
                )}
              </div>
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
