import React from 'react';
import { FaPaintBrush, FaBook, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png";
import bgImage from "../../assets/BG.png";

const TherapyHome = () => {
  const navigate = useNavigate();

  const outerContainerStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
  };

  const backgroundStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: '139%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: -1,
  };

  const containerStyle = {
    padding: '40px 20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
  };

  const logoStyle = {
    position: 'absolute',
    top: '15px', // moved a bit higher
    right: '-150px', // moved a bit further right
    width: '80px',
    height: 'auto',
    zIndex: 2,
  };

  const titleBoxStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '20px 40px',
    borderRadius: '20px',
    marginBottom: '30px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  };

  const boxesContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    width: '100%',
    justifyContent: 'center',
  };

  const boxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    textAlign: 'center',
    minHeight: '200px',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    zIndex: 1,
  };

  const iconStyle = {
    fontSize: '48px',
  };

  const boxTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '14px',
    color: '#1f2937',
  };

  const emotionVaultBoxStyle = {
    ...boxStyle,
    gridColumn: 'span 2',
  };

  return (
    <div style={outerContainerStyle}>
      {/* Background */}
      <div style={backgroundStyle}></div>

      {/* Foreground */}
      <div style={containerStyle}>
        <img src={logo} alt="Logo" style={logoStyle} />

        {/* Title Box */}
        <div style={titleBoxStyle}>
          <h1 style={titleStyle}>Choose Your Therapy Type</h1>
        </div>

        {/* Therapy Option Boxes */}
        <div style={boxesContainerStyle}>
          <div
            style={boxStyle}
            onClick={() => navigate('/therapy/memory-reframing')}
          >
            <FaPaintBrush style={{ ...iconStyle, color: '#3b82f6' }} />
            <h2 style={boxTitleStyle}>Memory Reframing</h2>
          </div>

          <div
            style={boxStyle}
            onClick={() => navigate('/therapy/story-weaving')}
          >
            <FaBook style={{ ...iconStyle, color: '#10b981' }} />
            <h2 style={boxTitleStyle}>Story Weaving</h2>
          </div>

          <div
            style={emotionVaultBoxStyle}
            onClick={() => navigate('/therapy/emotion-vault')}
          >
            <FaLock style={{ ...iconStyle, color: '#9333ea' }} />
            <h2 style={boxTitleStyle}>Emotion-Based Memory Vault</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyHome;
