import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';

// Green theme for StoryWeaving
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Dark green
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#388e3c', // Medium green
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#2d3436',
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
        },
        contained: {
          background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1b5e20, #2e7d32)'
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px'
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

const StoryWeaving = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [memoryTexts, setMemoryTexts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [viewSavedMemories, setViewSavedMemories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedImages = JSON.parse(localStorage.getItem('therapyImages')) || [];
    setUploadedImages(storedImages);
  }, []);

  const handleBackToTherapyHome = () => {
    navigate('/therapy');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Please select up to 10 images at a time");
      return;
    }
    setSelectedFiles(files);
   
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
    setMemoryTexts(Array(files.length).fill(''));
  };

  const handleMemoryChange = (index, value) => {
    const updatedMemories = [...memoryTexts];
    updatedMemories[index] = value;
    setMemoryTexts(updatedMemories);
  };

  const handleSave = () => {
    if (!selectedFiles.length) return;

    setLoading(true);
    setSuccessMessage('');

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString();

    Promise.all(selectedFiles.map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
          imageUrl: reader.result,
          memory: memoryTexts[index] || '',
          dateUploaded: formattedTime,
          lastEdited: formattedTime
        });
        reader.readAsDataURL(file);
      });
    }))
    .then((newEntries) => {
      const updatedImages = [...uploadedImages, ...newEntries];
      setUploadedImages(updatedImages);
      localStorage.setItem('therapyImages', JSON.stringify(updatedImages));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setMemoryTexts([]);
      setSuccessMessage('Stories saved successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    })
    .catch((err) => {
      console.error(err);
      setSuccessMessage('Error saving stories');
      setTimeout(() => setSuccessMessage(''), 5000);
    })
    .finally(() => setLoading(false));
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      const updatedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(updatedImages);
      localStorage.setItem('therapyImages', JSON.stringify(updatedImages));
      setSuccessMessage('Story deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditText(uploadedImages[index].memory);
  };

  const handleSaveEdit = (index) => {
    const updatedImages = [...uploadedImages];
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString();
   
    updatedImages[index] = {
      ...updatedImages[index],
      memory: editText,
      lastEdited: formattedTime
    };
   
    setUploadedImages(updatedImages);
    localStorage.setItem('therapyImages', JSON.stringify(updatedImages));
    setEditingIndex(null);
    setSuccessMessage('Story updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
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
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: '#1976d2',
            color: 'white',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease',
            width: 48,
            height: 48
          }}
        >
          <ArrowBackIcon />
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
            background: 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, rgba(46,125,50,0) 70%)',
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
            background: 'radial-gradient(circle, rgba(56,142,60,0.1) 0%, rgba(56,142,60,0) 70%)',
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
                background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <AutoStoriesIcon sx={{
                verticalAlign: 'middle',
                mr: 2,
                fontSize: '2.2rem',
                background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} />
              Story Weaving
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
              "Weave new narratives from your memories"
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>How to Weave Your Story</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  <strong>1. Add Memory Images:</strong> Upload photos that represent memories you want to reinterpret.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>2. Weave Your Narrative:</strong> For each image, write a new story or perspective about that memory.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>3. Save Your Stories:</strong> Store your new narratives to revisit and reflect on later.
                </Typography>
                <Typography variant="body1">
                  <strong>Tip:</strong> Try writing from different perspectives - how might someone else view this memory?
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{
              my: 3,
              borderColor: '#e0e0e0',
              borderBottomWidth: '2px'
            }} />

            {!viewSavedMemories ? (
              <>
                <Box sx={{
                  textAlign: 'center',
                  mb: 4
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
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1b5e20, #2e7d32)'
                      }
                    }}
                  >
                    Add Memory Images
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
                        backgroundColor: '#e8f5e9',
                        borderRadius: '16px',
                        textAlign: 'center',
                        color: '#2e7d32',
                        fontSize: { xs: '1.6rem', md: '1.9rem' },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      Weave Your Stories
                    </Typography>
                   
                    <Grid container spacing={3}>
                      {previewUrls.map((url, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
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
                            <CardContent>
                              <TextField
                                label="Weave your story..."
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={memoryTexts[index] || ''}
                                onChange={(e) => handleMemoryChange(index, e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                  }
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{
                      mt: 4,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{
                          px: 4,
                          py: 2,
                          fontSize: '1.2rem',
                          background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1b5e20, #2e7d32)'
                          }
                        }}
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                      >
                        {loading ? 'Saving...' : 'Save Your Stories'}
                      </Button>
                    </Box>
                  </Box>
                )}

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4
                }}>
                  <Button
                    variant={viewSavedMemories ? "contained" : "outlined"}
                    color="primary"
                    size="large"
                    onClick={() => setViewSavedMemories(true)}
                    startIcon={<ImageSearchIcon />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        transform: 'translateY(-2px)'
                      },
                      ...(viewSavedMemories ? {
                        background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                        border: 'none'
                      } : {})
                    }}
                  >
                    View Woven Stories
                  </Button>
                </Box>

                {previewUrls.length === 0 && uploadedImages.length === 0 && (
                  <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    border: '2px dashed #e0e0e0',
                    borderRadius: '16px',
                    backgroundColor: '#fafafa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    mt: 4
                  }}>
                    <AutoStoriesIcon sx={{
                      fontSize: 80,
                      color: '#a5d6a7',
                      mb: 2,
                      opacity: 0.7
                    }} />
                    <Typography variant="h3" color="textSecondary" sx={{
                      mb: 2,
                      fontWeight: 600
                    }}>
                      Begin Your Story Weaving Journey
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{
                      mb: 3,
                      fontSize: '1.2rem',
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}>
                      Upload memory images and weave new narratives to reinterpret your experiences
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Typography
                  variant="h2"
                  align="center"
                  sx={{
                    mb: 3,
                    p: 3,
                    backgroundColor: '#e8f5e9',
                    borderRadius: '16px',
                    color: '#2e7d32',
                    fontSize: { xs: '1.6rem', md: '1.9rem' },
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  Your Woven Stories
                </Typography>

                <Box sx={{
                  textAlign: 'center',
                  mb: 4
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => setViewSavedMemories(false)}
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1b5e20, #2e7d32)'
                      }
                    }}
                  >
                    Add More Stories
                  </Button>
                </Box>

                {uploadedImages.length > 0 ? (
                  <Grid container spacing={3}>
                    {uploadedImages.map((entry, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                          position: 'relative',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: '2px solid #a5d6a7',
                          backgroundColor: '#e8f5e9'
                        }}>
                          <Box sx={{
                            height: 200,
                            backgroundImage: `url(${entry.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px'
                          }} />
                         
                          <Box sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                          }}>
                            <Tooltip title="Edit this story" arrow>
                              <IconButton
                                onClick={() => handleEdit(index)}
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
                                <EditNoteIcon sx={{
                                  color: '#1976d2',
                                  fontSize: 28
                                }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete this story" arrow>
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
                                  color: '#d32f2f',
                                  fontSize: 28
                                }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <CardContent sx={{
                            flexGrow: 1,
                            backgroundColor: '#e8f5e9',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px'
                          }}>
                            {editingIndex === index ? (
                              <>
                                <TextField
                                  label="Edit your story..."
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  rows={4}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '12px',
                                    }
                                  }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSaveEdit(index)}
                                    size="small"
                                    sx={{
                                      flex: 1,
                                      background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                                      '&:hover': {
                                        background: 'linear-gradient(45deg, #1b5e20, #2e7d32)'
                                      }
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleCancelEdit}
                                    size="small"
                                    sx={{ flex: 1 }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              </>
                            ) : (
                              <>
                                <Typography variant="body1" sx={{
                                  color: '#2e7d32',
                                  mb: 1,
                                  fontWeight: 500
                                }}>
                                  Your Story:
                                </Typography>
                                <Typography variant="body1" sx={{
                                  mb: 2,
                                  color: '#2d3436',
                                  fontStyle: entry.memory ? 'normal' : 'italic'
                                }}>
                                  {entry.memory || 'No story added yet'}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" sx={{
                                  color: '#636e72',
                                  fontStyle: 'italic'
                                }}>
                                  Added on: {entry.dateUploaded}
                                </Typography>
                                {entry.lastEdited && entry.lastEdited !== entry.dateUploaded && (
                                  <Typography variant="body2" sx={{
                                    color: '#636e72',
                                    fontStyle: 'italic'
                                  }}>
                                    Last edited: {entry.lastEdited}
                                  </Typography>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
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
                    <EditNoteIcon sx={{
                      fontSize: 80,
                      color: '#a5d6a7',
                      mb: 2,
                      opacity: 0.7
                    }} />
                    <Typography variant="h3" color="textSecondary" sx={{
                      mb: 2,
                      fontWeight: 600
                    }}>
                      No Stories Woven Yet
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{
                      mb: 3,
                      fontSize: '1.2rem',
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}>
                      Start by adding some memory images and weaving new narratives
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {successMessage && (
              <Box sx={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
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
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default StoryWeaving;