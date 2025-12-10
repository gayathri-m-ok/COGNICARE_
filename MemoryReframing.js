import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  ButtonGroup,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Slider, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box,
  IconButton,
  Divider,
  Tooltip,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload,
  ImageSearch,
  Delete,
  Edit,
  ArrowBack,
  Undo,
  Brush,
  Close,
  Save,
  Download,
  Palette,
  ExpandMore,
  AutoFixHigh,
  Clear,
  Restore
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a', // Purple
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ffab40', // Amber
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f5f5',
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

const MemoryReframing = () => {
  const navigate = useNavigate();
  
  // State for file handling
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [originalImageUrls, setOriginalImageUrls] = useState([]); // Store original image URLs
  
  // State for saved images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [viewSavedMemories, setViewSavedMemories] = useState(false);
  
  // State for editing
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for drawing tools
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#6a1b9a');
  const [mode, setMode] = useState('draw');
  
  // State for confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  // Canvas refs
  const bgCanvasRef = useRef(null);
  const paintCanvasRef = useRef(null);
  const paintCtxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  // Constants for image dimensions
  const DISPLAY_WIDTH = 600;
  const DISPLAY_HEIGHT = 450;
  const THUMBNAIL_WIDTH = 400;
  const THUMBNAIL_HEIGHT = 300;

  // Load saved images on component mount
  useEffect(() => {
    const storedImages = JSON.parse(localStorage.getItem('reframedImages')) || [];
    setUploadedImages(storedImages);
  }, []);

  // Setup canvas when entering edit mode or changing image
  useEffect(() => {
    if (editMode && bgCanvasRef.current && paintCanvasRef.current && previewUrls[currentPreviewIndex]) {
      const bgCanvas = bgCanvasRef.current;
      const paintCanvas = paintCanvasRef.current;
      const bgCtx = bgCanvas.getContext('2d');
      const paintCtx = paintCanvas.getContext('2d');

      const img = new Image();
      img.src = previewUrls[currentPreviewIndex];
      img.onload = () => {
        // Calculate aspect ratio and dimensions to fit canvas
        const imgAspect = img.width / img.height;
        const canvasAspect = DISPLAY_WIDTH / DISPLAY_HEIGHT;
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawWidth = DISPLAY_WIDTH;
          drawHeight = DISPLAY_WIDTH / imgAspect;
          offsetY = (DISPLAY_HEIGHT - drawHeight) / 2;
        } else {
          // Image is taller than canvas
          drawHeight = DISPLAY_HEIGHT;
          drawWidth = DISPLAY_HEIGHT * imgAspect;
          offsetX = (DISPLAY_WIDTH - drawWidth) / 2;
        }

        // Set both canvases to fixed size
        bgCanvas.width = DISPLAY_WIDTH;
        bgCanvas.height = DISPLAY_HEIGHT;
        paintCanvas.width = DISPLAY_WIDTH;
        paintCanvas.height = DISPLAY_HEIGHT;

        // Draw image on background canvas (centered and properly scaled)
        bgCtx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
        bgCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Prepare paint context
        paintCtxRef.current = paintCtx;
        paintCtx.lineWidth = brushSize;
        paintCtx.lineCap = 'round';
        paintCtx.strokeStyle = brushColor;

        // Clear the paint canvas when loading a new image
        paintCtx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
        
        saveHistory();
      };
    }
  }, [editMode, previewUrls, currentPreviewIndex]);

  // Update brush settings without resetting canvas
  useEffect(() => {
    if (paintCtxRef.current) {
      paintCtxRef.current.lineWidth = brushSize;
      paintCtxRef.current.strokeStyle = brushColor;
    }
  }, [brushSize, brushColor]);

  // Handle file selection for multiple files
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 files
    if (files.length > 0) {
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setOriginalImageUrls(urls); // Store original URLs
      setCurrentPreviewIndex(0);
    }
  };

  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    paintCtxRef.current.beginPath();
    paintCtxRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const ctx = paintCtxRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2; // Make erase brush slightly larger
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // Doesn't matter for erase
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    paintCtxRef.current.closePath();
    setIsDrawing(false);
    saveHistory();
  };

  const saveHistory = () => {
    const paintCanvas = paintCanvasRef.current;
    const dataUrl = paintCanvas.toDataURL();
    setHistory(prev => [...prev, dataUrl]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      const ctx = paintCtxRef.current;
      ctx.clearRect(0, 0, paintCanvasRef.current.width, paintCanvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    if (paintCtxRef.current) {
      paintCtxRef.current.clearRect(0, 0, paintCanvasRef.current.width, paintCanvasRef.current.height);
      saveHistory();
    }
  };

  // Reset to original image (remove all drawings)
  const resetToOriginal = () => {
    if (paintCtxRef.current) {
      paintCtxRef.current.clearRect(0, 0, paintCanvasRef.current.width, paintCanvasRef.current.height);
      saveHistory();
      
      // If we're editing an existing image, we need to reload the original image
      if (editingIndex !== null) {
        const img = new Image();
        img.src = originalImageUrls[currentPreviewIndex] || previewUrls[currentPreviewIndex];
        img.onload = () => {
          const bgCtx = bgCanvasRef.current.getContext('2d');
          const imgAspect = img.width / img.height;
          const canvasAspect = DISPLAY_WIDTH / DISPLAY_HEIGHT;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (imgAspect > canvasAspect) {
            drawWidth = DISPLAY_WIDTH;
            drawHeight = DISPLAY_WIDTH / imgAspect;
            offsetY = (DISPLAY_HEIGHT - drawHeight) / 2;
          } else {
            drawHeight = DISPLAY_HEIGHT;
            drawWidth = DISPLAY_HEIGHT * imgAspect;
            offsetX = (DISPLAY_WIDTH - drawWidth) / 2;
          }

          bgCtx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
          bgCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };
      }
    }
  };

  // Save edited image
  const handleSaveEditedImage = () => {
    setLoading(true);
    setSuccessMessage('');

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = DISPLAY_WIDTH;
    finalCanvas.height = DISPLAY_HEIGHT;
    const finalCtx = finalCanvas.getContext('2d');

    // Merge background + painting
    finalCtx.drawImage(bgCanvasRef.current, 0, 0);
    finalCtx.drawImage(paintCanvasRef.current, 0, 0);

    const editedImageUrl = finalCanvas.toDataURL('image/png');
    const timestamp = new Date().toISOString();
    
    let updatedImages;
    if (editingIndex !== null) {
      // Update existing image
      updatedImages = [...uploadedImages];
      updatedImages[editingIndex] = { 
        imageUrl: editedImageUrl,
        timestamp: uploadedImages[editingIndex].timestamp || timestamp,
        originalUrl: originalImageUrls[currentPreviewIndex] || previewUrls[currentPreviewIndex] // Store original URL
      };
    } else {
      // Add new image
      updatedImages = [...uploadedImages, { 
        imageUrl: editedImageUrl,
        timestamp,
        originalUrl: originalImageUrls[currentPreviewIndex] || previewUrls[currentPreviewIndex] // Store original URL
      }];
    }
    
    setUploadedImages(updatedImages);
    localStorage.setItem('reframedImages', JSON.stringify(updatedImages));

    setSelectedFiles([]);
    setPreviewUrls([]);
    setOriginalImageUrls([]);
    setEditMode(false);
    setEditingIndex(null);
    setHistory([]);
    setSuccessMessage('Memory reframed and saved successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
    setLoading(false);
  };

  // Download image
  const downloadImage = () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = DISPLAY_WIDTH;
    finalCanvas.height = DISPLAY_HEIGHT;
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(bgCanvasRef.current, 0, 0);
    finalCtx.drawImage(paintCanvasRef.current, 0, 0);

    const link = document.createElement('a');
    link.download = `reframed-memory-${new Date().toISOString()}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
  };

  // Handle image deletion with confirmation
  const handleDelete = (index) => {
    setImageToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updatedImages = uploadedImages.filter((_, i) => i !== imageToDelete);
    setUploadedImages(updatedImages);
    localStorage.setItem('reframedImages', JSON.stringify(updatedImages));
    setDeleteDialogOpen(false);
    setSuccessMessage('Memory deleted successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Edit existing image
  const handleEditImage = (index) => {
    const savedImage = uploadedImages[index];
    setPreviewUrls([savedImage.imageUrl]);
    setOriginalImageUrls([savedImage.originalUrl]); // Set original URL
    setCurrentPreviewIndex(0);
    setEditingIndex(index);
    setEditMode(true);
    setViewSavedMemories(false);
    setHistory([]); // Clear history to allow fresh edits
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Navigate to TherapyHome screen
  const handleBackToTherapyHome = () => {
  navigate('/therapy'); // Changed from '/TherapyHome' to '/therapy'
};

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)',
        p: { xs: 2, md: 4 },
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        position: 'relative'
      }}>
        {/* Back Button - Added to the top left */}
        <IconButton 
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 24 },
            left: { xs: 16, md: 24 },
            backgroundColor: '#2196F3',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1976D2',
              transform: 'scale(1.1)'
            },
            width: 48,
            height: 48,
            zIndex: 1100,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onClick={handleBackToTherapyHome}
        >
          <ArrowBack />
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
            background: 'radial-gradient(circle, rgba(106,27,154,0.1) 0%, rgba(106,27,154,0) 70%)',
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
            background: 'radial-gradient(circle, rgba(255,171,64,0.1) 0%, rgba(255,171,64,0) 70%)',
            borderRadius: '50%',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {!viewSavedMemories ? (
              <>
                {!editMode ? (
                  <>
                    <Typography 
                      variant="h1" 
                      align="center" 
                      gutterBottom
                      sx={{
                        mb: 2,
                        fontSize: { xs: '2.2rem', md: '2.8rem' },
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      <AutoFixHigh sx={{ 
                        verticalAlign: 'middle', 
                        mr: 2, 
                        fontSize: '2.2rem',
                        background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }} />
                      Memory Reframing
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
                      "Reinterpret your memories with new perspectives"
                    </Typography>

                    <Accordion sx={{ mb: 4, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>How to Use This Tool</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" paragraph>
                          <strong>1. Upload Your Memory:</strong> Select an image that represents a memory you'd like to reframe.
                        </Typography>
                        <Typography variant="body1" paragraph>
                          <strong>2. Reframe Your Memory:</strong> Use the drawing tools to add new perspectives, highlight positive aspects, or reinterpret the memory.
                        </Typography>
                        <Typography variant="body1" paragraph>
                          <strong>3. Save Your Reframed Memory:</strong> Store your new interpretation to revisit later.
                        </Typography>
                        <Typography variant="body1">
                          <strong>Tip:</strong> Try using different colors to represent different emotions or perspectives.
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
                        background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5c1a8a, #8e24aa)'
                        }
                      }
                    }}>
                      <Button
                        component="label"
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUpload />}
                        size="large"
                        sx={{
                          px: 4,
                          py: 2,
                          fontSize: '1.2rem'
                        }}
                      >
                        Upload Memory
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
                      <>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            mb: 3,
                            p: 3,
                            backgroundColor: '#f3e5f5',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: '#4a148c',
                            fontSize: { xs: '1.6rem', md: '1.9rem' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          Your Selected Memory
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Box sx={{
                            width: '100%',
                            maxWidth: `${DISPLAY_WIDTH}px`,
                            height: `${DISPLAY_HEIGHT}px`,
                            margin: '0 auto',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '2px solid #e0e0e0',
                            borderRadius: '16px',
                            backgroundColor: '#f5f5f5',
                            position: 'relative'
                          }}>
                            <img
                              src={previewUrls[currentPreviewIndex]}
                              alt="Selected"
                              style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain'
                              }}
                            />
                          </Box>
                          {previewUrls.length > 1 && (
                            <Box sx={{ mt: 2 }}>
                              <ButtonGroup>
                                {previewUrls.map((_, index) => (
                                  <Button
                                    key={index}
                                    variant={currentPreviewIndex === index ? "contained" : "outlined"}
                                    onClick={() => setCurrentPreviewIndex(index)}
                                    sx={{
                                      minWidth: '40px'
                                    }}
                                  >
                                    {index + 1}
                                  </Button>
                                ))}
                              </ButtonGroup>
                            </Box>
                          )}
                          <Box sx={{ 
                            mt: 3, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: 2 
                          }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setEditMode(true)}
                              startIcon={<Palette />}
                              sx={{
                                px: 4,
                                py: 2,
                                fontSize: '1.2rem',
                                background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #5c1a8a, #8e24aa)'
                                }
                              }}
                            >
                              Reframe Memory
                            </Button>
                          </Box>
                        </Box>
                      </>
                    )}

                    {uploadedImages.length > 0 && (
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        mb: 4,
                        mt: 4
                      }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          onClick={() => setViewSavedMemories(true)}
                          startIcon={<ImageSearch />}
                          sx={{
                            px: 4,
                            py: 2,
                            fontSize: '1.2rem',
                            borderWidth: '2px',
                            '&:hover': {
                              borderWidth: '2px',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          View Reframed Memories
                        </Button>
                      </Box>
                    )}

                    {previewUrls.length === 0 && (
                      <Box sx={{
                        textAlign: 'center',
                        p: 4,
                        border: '2px dashed #e0e0e0',
                        borderRadius: '16px',
                        backgroundColor: '#fafafa',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <AutoFixHigh sx={{ 
                          fontSize: 80, 
                          color: '#ba68c8',
                          mb: 2,
                          opacity: 0.7
                        }} />
                        <Typography variant="h3" color="textSecondary" sx={{ 
                          mb: 2,
                          fontWeight: 600
                        }}>
                          Ready to Reframe Your Memories
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ 
                          mb: 3, 
                          fontSize: '1.2rem',
                          maxWidth: '500px',
                          margin: '0 auto'
                        }}>
                          Upload a memory to begin the reframing process and gain new perspectives
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <>
                    <Typography 
                      variant="h2" 
                      align="center" 
                      gutterBottom
                      sx={{
                        color: '#6a1b9a',
                        fontWeight: 'bold',
                        mb: 3,
                        fontSize: { xs: '1.8rem', md: '2.2rem' }
                      }}
                    >
                      Reframe Your Memory
                    </Typography>

                    <Box sx={{ 
                      textAlign: 'center', 
                      position: 'relative', 
                      display: 'inline-block',
                      mx: 'auto'
                    }}>
                      <canvas
                        ref={bgCanvasRef}
                        style={{
                          border: '2px solid #e0e0e0',
                          borderRadius: '16px',
                          width: `${DISPLAY_WIDTH}px`,
                          height: `${DISPLAY_HEIGHT}px`,
                          marginTop: '20px',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          zIndex: 0,
                        }}
                      />
                      <canvas
                        ref={paintCanvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        style={{
                          border: '2px solid #e0e0e0',
                          borderRadius: '16px',
                          width: `${DISPLAY_WIDTH}px`,
                          height: `${DISPLAY_HEIGHT}px`,
                          marginTop: '20px',
                          position: 'relative',
                          zIndex: 1,
                          cursor: 'crosshair',
                        }}
                      />
                    </Box>

                    <Box sx={{ 
  textAlign: 'center', 
  mt: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}}>
  <Box sx={{ 
    width: '100%',
    maxWidth: '600px',
    mb: 3,
    p: 3,
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  }}>
    <Typography variant="h6" gutterBottom>Drawing Tools</Typography>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Mode</InputLabel>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            label="Mode"
          >
            <MenuItem value="draw">Draw</MenuItem>
            <MenuItem value="erase">Erase</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {mode === 'draw' ? 'Color:' : 'Eraser Size:'}
          </Typography>
          {mode === 'draw' ? (
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={{ width: '40px', height: '40px' }}
            />
          ) : (
            <Box sx={{ width: '100%' }}>
              <Slider
                value={brushSize * 2}
                onChange={(e, newVal) => setBrushSize(newVal / 2)}
                min={2}
                max={40}
                aria-labelledby="eraser-size-slider"
              />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>
          {mode === 'draw' ? 'Brush Size:' : ''}
        </Typography>
        {mode === 'draw' && (
          <Slider
            value={brushSize}
            onChange={(e, newVal) => setBrushSize(newVal)}
            min={1}
            max={20}
            aria-labelledby="brush-size-slider"
          />
        )}
      </Grid>
    </Grid>
  </Box>

  <Box sx={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 1,
    mb: 3
  }}>
    <Button
      variant="contained"
      color="primary"
      onClick={undo}
      startIcon={<Undo />}
      disabled={history.length <= 1}
    >
      Undo
    </Button>
    <Button
      variant="outlined"
      color="error"
      onClick={clearCanvas}
      startIcon={<Clear />}
    >
      Clear Drawing
    </Button>
    <Button
      variant="outlined"
      onClick={resetToOriginal}
      startIcon={<Restore />}
    >
      Reset Image
    </Button>
  </Box>

  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSaveEditedImage}
      startIcon={<Save />}
      disabled={loading}
      sx={{
        background: 'linear-gradient(45deg, #ff9800, #ffab40)',
        '&:hover': {
          background: 'linear-gradient(45deg, #f57c00, #ff9800)'
        }
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Memory'}
    </Button>
    <Button
      variant="outlined"
      onClick={downloadImage}
      startIcon={<Download />}
    >
      Download
    </Button>
    <Button
      variant="outlined"
      color="error"
      onClick={() => {
        setEditMode(false);
        setHistory([]);
      }}
      startIcon={<Close />}
    >
      Cancel
    </Button>
  </Box>
</Box>
</>
)}
</> 
) : (
<>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
    <Typography variant="h2" sx={{ color: '#6a1b9a', fontWeight: 'bold' }}>
      Your Reframed Memories
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => setViewSavedMemories(false)}
      startIcon={<ArrowBack />}
    >
      Back
    </Button>
  </Box>

  {uploadedImages.length === 0 ? (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Typography variant="h5">No reframed memories yet</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Upload and reframe a memory to see it here
      </Typography>
    </Box>
  ) : (
    <Grid container spacing={3}>
      {uploadedImages.map((img, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <CardMedia
              component="img"
              height={THUMBNAIL_HEIGHT}
              image={img.imageUrl}
              alt={`Reframed Memory ${index + 1}`}
              sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Reframed on: {formatDate(img.timestamp)}
              </Typography>
            </CardContent>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 'auto'
            }}>
              <Tooltip title="Edit this memory">
                <IconButton 
                  color="primary" 
                  onClick={() => handleEditImage(index)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete this memory">
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(index)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  )}
</>
)}
</Box>

{/* Success message */}
{successMessage && (
  <Box sx={{
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.5s'
  }}>
    <Typography variant="body1">{successMessage}</Typography>
  </Box>
)}

{/* Delete confirmation dialog */}
<Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to delete this reframed memory? This action cannot be undone.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
      Cancel
    </Button>
    <Button onClick={confirmDelete} color="error" autoFocus>
      Delete
    </Button>
  </DialogActions>
</Dialog>
</Paper>
</Box>
</ThemeProvider>
);
};

export default MemoryReframing;