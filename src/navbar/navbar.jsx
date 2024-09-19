import React, { useState } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <Link to="/home">O R B I T</Link>
        </div>
        <div className="navbar-links">
          <button onClick={toggleMenu} className="menu-button">
            m e n u
          </button>
          <Link to="/profile" className="navbar-link">
            p r o f i l e
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="menu-popup">
          <button onClick={toggleMenu} className="close-button">X</button>
          <ul className="menu-list">
            <li className="menu-item"><Link to="/home">Home</Link></li>
            <li className="menu-item"><Link to="/item2">Item 2</Link></li>
            <li className="menu-item"><Link to="/item3">Item 3</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navbar;
