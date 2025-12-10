// src/screens/ContactUs.js

import React from 'react';
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';
import bgImage from '../assets/BG.png';

function ContactUs() {
  return (
    <div
      style={{
        padding: '40px',
        minHeight: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '139%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        color: '#1e293b',
        backdropFilter: 'brightness(0.95)',
      }}
    >
      {/* Logo fixed at top-right */}
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
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '15px',
          padding: '50px 30px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          marginTop: '80px',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Contact Us
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#475569',
            textAlign: 'center',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          Have questions or need support? We're here to help! Reach out to us through any of the following contact details.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            alignItems: 'center',
            fontSize: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaEnvelope style={{ marginRight: '15px', color: '#0ea5e9', fontSize: '24px' }} />
            <a
              href="mailto:cognicaresupport@gmail.com"
              style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '18px' }}
            >
              cognicaresupport@gmail.com
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaPhoneAlt style={{ marginRight: '15px', color: '#10b981', fontSize: '22px' }} />
            <span>+91 79092 34495</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaPhoneAlt style={{ marginRight: '15px', color: '#10b981', fontSize: '22px' }} />
            <span>+91 80894 82376</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaPhoneAlt style={{ marginRight: '15px', color: '#10b981', fontSize: '22px' }} />
            <span>+91 90330 98457</span>
          </div>
        </div>

        <p
          style={{
            fontSize: '16px',
            color: '#64748b',
            textAlign: 'center',
            marginTop: '50px',
            lineHeight: '1.5',
          }}
        >
          We typically respond within 24 hours. Thank you for choosing <strong>Cognicare</strong> — empowering care through compassion and innovation.
        </p>
      </div>
    </div>
  );
}

export default ContactUs;
