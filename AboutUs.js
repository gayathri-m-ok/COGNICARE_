// src/screens/AboutUs.js

import React from 'react';
import { Typography, Divider } from '@mui/material';
import { Groups, Favorite, Star } from '@mui/icons-material';
import logo from '../assets/logo.png';
import bgImage from '../assets/BG.png';  // Import the background image

const AboutUs = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '139%',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '60px 20px',
        position: 'relative',
      }}
    >
      {/* Logo in top right */}
      <div style={{ position: 'absolute', top: '20px', right: '30px' }}>
        <img src={logo} alt="Cognicare Logo" style={{ height: '70px', width: 'auto' }} />
      </div>

      {/* Content Card */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '50px 40px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          style={{ color: '#0f172a', fontWeight: '700', marginBottom: '30px' }}
        >
          About Us 🌟
        </Typography>

        <Divider sx={{ marginBottom: '40px' }} />

        {/* Who We Are */}
        <section style={{ marginBottom: '40px' }}>
          <Typography variant="h5" gutterBottom style={{ display: 'flex', alignItems: 'center', color: '#1e293b' }}>
            <Groups style={{ marginRight: '10px', color: '#0284c7' }} /> Who We Are
          </Typography>
          <Typography variant="body1" style={{ color: '#334155', fontSize: '18px', lineHeight: '1.8' }}>
            At <strong>Cognicare</strong>, we believe that every individual deserves personalized care, empathy, and support.
            Our mission is to bridge the gap between technology and caregiving by creating user-friendly, innovative tools
            that assist patients and caregivers in managing daily challenges with confidence.
          </Typography>
        </section>

        {/* Our Mission */}
        <section style={{ marginBottom: '40px' }}>
          <Typography variant="h5" gutterBottom style={{ display: 'flex', alignItems: 'center', color: '#1e293b' }}>
            <Favorite style={{ marginRight: '10px', color: '#e11d48' }} /> Our Mission
          </Typography>
          <Typography variant="body1" style={{ color: '#334155', fontSize: '18px', lineHeight: '1.8' }}>
            We are committed to empowering patients and caregivers through smart solutions that enhance communication,
            monitor health parameters, and ensure emotional well-being. Our therapy and memory support features are crafted
            to bring joy, improve health outcomes, and build stronger connections between people.
          </Typography>
        </section>

        {/* Why Choose Us */}
        <section style={{ marginBottom: '40px' }}>
          <Typography variant="h5" gutterBottom style={{ display: 'flex', alignItems: 'center', color: '#1e293b' }}>
            <Star style={{ marginRight: '10px', color: '#fbbf24' }} /> Why Choose Us?
          </Typography>
          <Typography variant="body1" style={{ color: '#334155', fontSize: '18px', lineHeight: '1.8' }}>
            • Intuitive and accessible user interface<br />
            • Thoughtfully crafted memory games and therapy tools<br />
            • Safe, private, and secure data practices<br />
            • Continuous improvements with your feedback<br />
            • A team passionate about innovation in healthcare
          </Typography>
        </section>

        {/* Thank You */}
        <Typography variant="body1" style={{ color: '#334155', fontSize: '18px', lineHeight: '1.8', textAlign: 'center' }}>
          Thank you for trusting <strong>Cognicare</strong> to be part of your care journey. Together, we make every memory count. 💙
        </Typography>
      </div>
    </div>
  );
};

export default AboutUs;
