import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';
import logo from "../../assets/logo.png";
import bgImage from "../../assets/BG.png"; // Import your background image

const StoryTellingStart = () => {
  const navigate = useNavigate();
  
  const handleStart = () => {
    navigate('/story-telling/level/1');
  };
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    textAlign: 'center',
  };
  
  const buttonStyle = {
    marginTop: '20px',
    padding: '15px 30px',
    fontSize: '1.5rem',
    backgroundColor: '#003366',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
  };
  
  const iconStyle = {
    fontSize: '1.8rem',
  };
  
  return (
    <div
      style={{
        padding: '40px',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '139%',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Logo fixed on the top-right */}
      <img
        src={logo}
        alt="Cognicare Logo"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '80px',
          height: 'auto',
          zIndex: '999',
        }}
      />
      
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <div style={containerStyle}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '20px 30px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h1
              style={{
                fontSize: '40px',
                fontWeight: 'bold',
                color: '#1e40af',
                margin: 0,
              }}
            >
              Welcome to Story Telling!
            </h1>
          </div>
          
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '15px 25px',
              borderRadius: '12px',
              marginBottom: '30px',
            }}
          >
            <p style={{ fontSize: '20px', color: '#333', margin: 0 }}>
              Let's build your story step by step.
            </p>
          </div>
          
          <button
            style={buttonStyle}
            onClick={handleStart}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#002244')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#003366')}
          >
            <FaBookOpen style={iconStyle} />
            Start Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryTellingStart;