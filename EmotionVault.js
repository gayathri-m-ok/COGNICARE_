import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Box,
  Tooltip,
  Paper,
  Divider,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MemoryIcon from '@mui/icons-material/Memory';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enhanced theme with better colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Richer blue
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ff4081', // Vibrant pink
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8f9fa', // Lighter gray background
      paper: '#ffffff' // White cards
    },
    text: {
      primary: '#2d3436', // Darker text for better contrast
      secondary: '#636e72'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.8rem',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6
    },
    button: {
      fontSize: '1.1rem',
      textTransform: 'none',
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 24px',
          margin: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          overflow: 'hidden'
        }
      }
    }
  }
});

const EmotionVault = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [vaultImages, setVaultImages] = useState([]);
  const [lockedView, setLockedView] = useState(false);
  const [unlockedView, setUnlockedView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleBackToTherapyHome = () => {
    navigate('/therapy');
  };

  useEffect(() => {
    const storedVault = JSON.parse(localStorage.getItem('emotionVaultImages')) || [];
    setVaultImages(storedVault);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Please select up to 10 images at a time");
      return;
    }
    setSelectedFiles(files);
   
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
    setLockedView(false);
    setUnlockedView(false);
  };

  const saveToVault = (isLocked) => {
    if (!selectedFiles.length) return;

    setLoading(true);
    setSuccessMessage('');

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString();

    Promise.all(selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
          imageUrl: reader.result,
          locked: isLocked,
          dateUploaded: formattedTime,
        });
        reader.readAsDataURL(file);
      });
    }))
    .then((newEntries) => {
      const updatedVault = [...vaultImages, ...newEntries];
      setVaultImages(updatedVault);
      localStorage.setItem('emotionVaultImages', JSON.stringify(updatedVault));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setSuccessMessage(`Successfully ${isLocked ? 'locked' : 'saved'} your memories!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    })
    .finally(() => setLoading(false));
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      const updatedVault = vaultImages.filter((_, i) => i !== index);
      setVaultImages(updatedVault);
      localStorage.setItem('emotionVaultImages', JSON.stringify(updatedVault));
      setSuccessMessage('Memory deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleToggleLock = (index) => {
    const updatedVault = [...vaultImages];
    updatedVault[index].locked = !updatedVault[index].locked;
    setVaultImages(updatedVault);
    localStorage.setItem('emotionVaultImages', JSON.stringify(updatedVault));
    setSuccessMessage(`Memory ${updatedVault[index].locked ? 'locked' : 'unlocked'}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
        p: { xs: 2, md: 4 },
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        position: 'relative'
      }}>
        {/* Back Button */}
        <IconButton
          onClick={handleBackToTherapyHome}
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            backgroundColor: '#3f51b5',
            color: 'white',
            zIndex: 1001,
            '&:hover': {
              backgroundColor: '#303f9f',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease',
            width: 48,
            height: 48,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ArrowBackIcon fontSize="medium" />
        </IconButton>

        <Paper sx={{
          maxWidth: 1200,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          p: { xs: 3, md: 4 },
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0) 70%)',
            borderRadius: '50%',
            zIndex: 0
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,64,129,0.1) 0%, rgba(255,64,129,0) 70%)',
            borderRadius: '50%',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h1"
              align="center"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: '2.2rem', md: '2.8rem' },
                fontWeight: 700,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <MemoryIcon sx={{
                verticalAlign: 'middle',
                mr: 2,
                fontSize: '2.2rem',
                background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} />
              Memory Vault
            </Typography>
           
            <Typography
              variant="subtitle1"
              align="center"
              sx={{
                mb: 4,
                fontStyle: 'italic',
                color: '#636e72',
                fontSize: { xs: '1.1rem', md: '1.2rem' }
              }}
            >
              "Preserve your precious moments and emotions"
            </Typography>

            <Accordion
              sx={{
                mb: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:before': {
                  display: 'none'
                }
              }}
              expanded={expanded}
              onChange={() => setExpanded(!expanded)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>How to Use This Tool</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  <strong>1. Add Memories:</strong> Click the "Add Memories" button to upload photos from your device (up to 10 at a time).
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>2. Choose Privacy:</strong> You can "Lock" private memories (they'll be blurred) or keep them "Unlocked" for easy viewing.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>3. View Memories:</strong> Use the buttons to toggle between viewing your private (locked) or shared (unlocked) memories.
                </Typography>
                <Typography variant="body1">
                  <strong>Tip:</strong> You can change a memory's privacy status anytime by clicking the lock icon on the memory.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{
              my: 3,
              borderColor: '#e0e0e0',
              borderBottomWidth: '2px'
            }} />

            <Box sx={{
              textAlign: 'center',
              mb: 4,
              '& .MuiButton-root': {
                background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3949ab, #1e88e5)'
                }
              }
            }}>
              <Button
                component="label"
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.2rem'
                }}
              >
                Add Memories
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {previewUrls.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h2"
                  sx={{
                    mb: 3,
                    p: 3,
                    backgroundColor: '#e8eaf6',
                    borderRadius: '16px',
                    textAlign: 'center',
                    color: '#1a237e',
                    fontSize: { xs: '1.6rem', md: '1.9rem' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  Preview Your Selected Memories
                </Typography>
               
                <Grid container spacing={3}>
                  {previewUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card sx={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{
                          height: 200,
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderTopLeftRadius: '16px',
                          borderTopRightRadius: '16px'
                        }} />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" color="textSecondary">
                            New Memory {index + 1}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{
                  mt: 4,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'center',
                  gap: 2
                }}>
                  <Button
                    onClick={() => saveToVault(true)}
                    disabled={loading}
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #ff4081, #f50057)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #f50057, #c51162)'
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LockIcon />}
                  >
                    {loading ? 'Saving...' : 'Lock These Memories'}
                  </Button>

                  <Button
                    onClick={() => saveToVault(false)}
                    disabled={loading}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #3949ab, #1e88e5)'
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LockOpenIcon />}
                  >
                    {loading ? 'Saving...' : 'Save Unlocked'}
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2,
              mb: 4
            }}>
              <Button
                variant={lockedView ? "contained" : "outlined"}
                color="secondary"
                onClick={() => {
                  setLockedView(true);
                  setUnlockedView(false);
                }}
                startIcon={<LockIcon />}
                size="large"
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)'
                  },
                  ...(lockedView ? {
                    background: 'linear-gradient(45deg, #ff4081, #f50057)',
                    border: 'none'
                  } : {})
                }}
              >
                Private Memories
              </Button>
              <Button
                variant={unlockedView ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  setUnlockedView(true);
                  setLockedView(false);
                }}
                startIcon={<LockOpenIcon />}
                size="large"
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)'
                  },
                  ...(unlockedView ? {
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    border: 'none'
                  } : {})
                }}
              >
                Shared Memories
              </Button>
            </Box>

            {vaultImages.length === 0 && !previewUrls.length && (
              <Box sx={{
                textAlign: 'center',
                p: 4,
                border: '2px dashed #e0e0e0',
                borderRadius: '16px',
                backgroundColor: '#fafafa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <ImageSearchIcon sx={{
                  fontSize: 80,
                  color: '#9fa8da',
                  mb: 2,
                  opacity: 0.7
                }} />
                <Typography variant="h3" color="textSecondary" sx={{
                  mb: 2,
                  fontWeight: 600
                }}>
                  Your Memory Vault is Empty
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{
                  mb: 3,
                  fontSize: '1.2rem',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  Start by adding some special memories to preserve your emotions and moments
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: '1.2rem',
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #3949ab, #1e88e5)'
                    }
                  }}
                >
                  Add Your First Memory
                  <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                </Button>
              </Box>
            )}

            {successMessage && (
              <Box sx={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                animation: 'fadeIn 0.5s, fadeOut 0.5s 4.5s forwards',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, bottom: 0 },
                  '100%': { opacity: 1, bottom: 20 }
                },
                '@keyframes fadeOut': {
                  '0%': { opacity: 1, bottom: 20 },
                  '100%': { opacity: 0, bottom: 0 }
                }
              }}>
                <Typography variant="body1" sx={{
                  fontSize: '1.2rem',
                  fontWeight: 500
                }}>
                  {successMessage}
                </Typography>
              </Box>
            )}

            {(lockedView || unlockedView) && (
              <Box>
                <Typography
                  variant="h2"
                  align="center"
                  sx={{
                    mb: 4,
                    p: 3,
                    backgroundColor: lockedView ? '#fce4ec' : '#e8eaf6',
                    borderRadius: '16px',
                    color: lockedView ? '#d81b60' : '#1a237e',
                    fontSize: { xs: '1.6rem', md: '1.9rem' },
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {lockedView ? 'Your Private Memories' : 'Your Shared Memories'}
                </Typography>

                {vaultImages.filter(img => lockedView ? img.locked : !img.locked).length > 0 ? (
                  <Grid container spacing={3}>
                    {vaultImages.map((entry, index) => (
                      (lockedView ? entry.locked : !entry.locked) && (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                          <Card sx={{
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            border: entry.locked ? '2px solid #f06292' : '2px solid #7986cb',
                            backgroundColor: entry.locked ? '#fff5f7' : '#f5f7ff'
                          }}>
                            <Box sx={{
                              height: 200,
                              backgroundImage: `url(${entry.imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: entry.locked ? 'blur(3px)' : 'none',
                              transition: 'filter 0.3s ease',
                              borderTopLeftRadius: '16px',
                              borderTopRightRadius: '16px',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: entry.locked ? 'rgba(255, 255, 255, 0.3)' : 'none'
                              }
                            }}>
                              {entry.locked && (
                                <LockIcon
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 60,
                                    color: '#d81b60',
                                    opacity: 0.8,
                                    zIndex: 1
                                  }}
                                />
                              )}
                            </Box>
                           
                            <Box sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              display: 'flex',
                              gap: 1,
                              zIndex: 2
                            }}>
                              <Tooltip
                                title={entry.locked ? "Make this memory shared" : "Make this memory private"}
                                arrow
                              >
                                <IconButton
                                  onClick={() => handleToggleLock(index)}
                                  sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                      backgroundColor: 'white',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {entry.locked ? (
                                    <LockOpenIcon sx={{
                                      color: '#3f51b5',
                                      fontSize: 28
                                    }} />
                                  ) : (
                                    <LockIcon sx={{
                                      color: '#ff4081',
                                      fontSize: 28
                                    }} />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete this memory" arrow>
                                <IconButton
                                  onClick={() => handleDelete(index)}
                                  sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                      backgroundColor: 'white',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <DeleteForeverIcon sx={{
                                    color: '#ff4081',
                                    fontSize: 28
                                  }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <CardContent sx={{
                              flexGrow: 1,
                              backgroundColor: entry.locked ? '#fff5f7' : '#f5f7ff',
                              borderBottomLeftRadius: '16px',
                              borderBottomRightRadius: '16px'
                            }}>
                              <Typography variant="body1" sx={{
                                color: '#636e72',
                                mb: 1,
                                fontWeight: 500
                              }}>
                                Added on:
                              </Typography>
                              <Typography variant="body1" sx={{
                                fontWeight: 'bold',
                                mb: 2,
                                color: '#2d3436'
                              }}>
                                {entry.dateUploaded}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    border: '2px dashed #e0e0e0',
                    borderRadius: '16px',
                    backgroundColor: '#fafafa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <ImageSearchIcon sx={{
                      fontSize: 80,
                      color: '#9fa8da',
                      mb: 2,
                      opacity: 0.7
                    }} />
                    <Typography variant="h3" color="textSecondary" sx={{
                      mb: 2,
                      fontWeight: 600
                    }}>
                      No {lockedView ? 'private' : 'shared'} memories yet
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{
                      mb: 3,
                      fontSize: '1.2rem',
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}>
                      {lockedView ? 'Lock some memories to see them here' : 'Add some memories to get started'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default EmotionVault;