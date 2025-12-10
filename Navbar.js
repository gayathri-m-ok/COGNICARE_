import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaPhone, FaUser, FaBrain, FaBook, FaFileAlt, FaClock, FaSignOutAlt, FaPuzzlePiece } from 'react-icons/fa';

const Navbar = () => {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#003366',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '12px',
  };

  const iconStyle = {
    fontSize: '20px',
    marginBottom: '5px',
  };

  return (
    <nav style={navStyle}>
      <Link to="/home" style={linkStyle}>
        <FaHome style={iconStyle} />
        Home
      </Link>
      <Link to="/about-us" style={linkStyle}>
        <FaUsers style={iconStyle} />
        About Us
      </Link>
      <Link to="/contact-us" style={linkStyle}>
        <FaPhone style={iconStyle} />
        Contact Us
      </Link>
      <Link to="/profile" style={linkStyle}>
        <FaUser style={iconStyle} />
        Profile
      </Link>
      <Link to="/brain-games" style={linkStyle}>
        <FaPuzzlePiece style={iconStyle} />
        Brain Games
      </Link>
      <Link to="/therapy" style={linkStyle}>
        <FaBrain style={iconStyle} />
        Therapy
      </Link>
      <Link to="/story-telling" style={linkStyle}>
        <FaBook style={iconStyle} />
        Story Telling
      </Link>
      <Link to="/report" style={linkStyle}>
        <FaFileAlt style={iconStyle} />
        Report
      </Link>
      <Link to="/reminder" style={linkStyle}>
        <FaClock style={iconStyle} />
        Reminder
      </Link>
      <Link to="/logout" style={linkStyle}>
        <FaSignOutAlt style={iconStyle} />
        Logout
      </Link>
    </nav>
  );
};

export default Navbar;