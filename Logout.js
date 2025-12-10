// src/screens/Logout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, Typography, Grid } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import bgImage from '../assets/BG.png';  // Make sure the path is correct

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      navigate('/login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div
      style={{
        padding: '40px',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '139%',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '100px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '16px',
          padding: '40px',
        }}
      >
        <ExitToAppIcon
          sx={{ fontSize: '50px', marginBottom: '20px', color: '#1976d2' }} // Blue color
        />
        <Typography variant="h4" gutterBottom>
          You have successfully logged out!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          We hope to see you again soon. Click below to return to the login screen.
        </Typography>
        <Grid container justifyContent="center">
          <Grid item>
            <Button
              sx={{
                backgroundColor: '#1976d2', // Blue color
                color: '#fff',
                padding: '12px 24px',
                fontSize: '16px',
                marginTop: '20px',
                '&:hover': {
                  backgroundColor: '#115293',
                },
              }}
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Logout;
