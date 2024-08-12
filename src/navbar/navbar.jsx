import React from 'react';
import './navbar.css';

function Navbar() {
  return (
    <>
      <div className="navbar-left navbar">
        <a href="#menu">m e n u</a>
      </div>
      <div className="navbar-top navbar">
        <div className="logo">
          O R B I T
        </div>
      </div>
      <div className="navbar-right navbar">
        <a href="#fashion-illustration">p r o f i l e  ·  f e e d</a>
      </div>
    </>
  );
}

export default Navbar;
