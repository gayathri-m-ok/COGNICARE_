import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaHome, FaSignOutAlt, FaChartBar, FaTimes, FaLightbulb } from 'react-icons/fa';




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function StoryLevel() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [timer, setTimer] = useState(0); 
  const [intervalId, setIntervalId] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [points, setPoints] = useState(0);
  const [error, setError] = useState(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [movementCount, setMovementCount] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [allLevelsData, setAllLevelsData] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [hasShownInitialTutorial, setHasShownInitialTutorial] = useState(false);

  const instructions = [
    {
      title: "Welcome to Storytelling Game!",
      content: "In this game, you'll arrange images to tell a coherent story. Let's learn how to play!",
      image: null
    },
    {
      title: "Step 1: Understand the Story",
      content: "First, read the story description carefully. This will help you understand the correct sequence of events.",
      image: null
    },
    {
      title: "Step 2: Shuffle Images",
      content: "Click the 'Shuffle Images' button to randomize the order of images and start the timer.",
      image: null
    },
    {
      title: "Step 3: Arrange the Images",
      content: "Drag and drop the images to arrange them in what you think is the correct chronological order.",
      image: null
    },
    {
      title: "Step 4: Complete the Level",
      content: "When all images are in the correct order, you'll complete the level and earn points based on your time and moves.",
      image: null
    },
    {
      title: "Scoring System",
      content: "You earn more points for completing the level quickly with fewer moves. Subsequent attempts earn fewer points.",
      image: null
    },
    {
      title: "Ready to Play?",
      content: "You can view these instructions again anytime by clicking the 'Help' button. Let's get started!",
      image: null
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'storytelling', `level${levelId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDescription(data.Description || "No description available");
          setImages(data.images || []);
          setShuffledImages(data.images || []);
          setCorrectOrder(data.correct_order || []);
        } else {
          setError("Level not found. Please check the level ID.");
        }
      } catch (err) {
        setError("Error fetching document: " + err.message);
        console.error("Error fetching document:", err);
      }
    };

    fetchData();
    setTimer(0);
    setLevelComplete(false);
    setIsShuffled(false);
    setMovementCount(0);
    setCurrentAttempt(1);
    if (intervalId) clearInterval(intervalId);
  }, [levelId]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const calculatePoints = (time) => {
    if (currentAttempt > 1) return 0;
    if (time <= 10) return 10;
    if (time <= 15) return 9;
    if (time <= 20) return 8;
    if (time <= 25) return 7;
    if (time <= 30) return 6;
    if (time <= 35) return 5;
    if (time <= 40) return 4;
    if (time <= 45) return 3;
    if (time <= 50) return 2;
    if (time <= 55) return 1;
    return 0;
  };

  const shuffleImages = () => {
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledImages(shuffled);
    setTimer(0); 
    setLevelComplete(false);
    setMovementCount(0);
    setIsShuffled(true);

    if (intervalId) clearInterval(intervalId);

    const newInterval = setInterval(() => {
      setTimer(prev => {
        if (prev >= 59) {
          clearInterval(newInterval);
          alert("⏳ Time's up! You couldn't complete the level in time.");
        }
        return prev + 1;
      });
    }, 1000);
    setIntervalId(newInterval);
  };

  const handleRetry = () => {
    setCurrentAttempt(prev => prev + 1);
    shuffleImages();
  };

  const handleDragStart = (e, draggedImage) => {
    if (!isShuffled) return;
    e.dataTransfer.setData("image", draggedImage);
  };

  const handleDrop = (e, dropIndex) => {
    if (!isShuffled) return;
    e.preventDefault();
    const draggedImage = e.dataTransfer.getData("image");

    const draggedIndex = shuffledImages.indexOf(draggedImage);
    const newOrder = [...shuffledImages];
    [newOrder[draggedIndex], newOrder[dropIndex]] = [newOrder[dropIndex], newOrder[draggedIndex]];

    setMovementCount(prev => prev + 1);
    setShuffledImages(newOrder);

    if (JSON.stringify(newOrder) === JSON.stringify(correctOrder)) {
      setLevelComplete(true);
      if (intervalId) clearInterval(intervalId);
      const earnedPoints = calculatePoints(timer);
      const newPoints = points + earnedPoints;
      setPoints(newPoints);
      
      const levelData = {
        level: parseInt(levelId),
        points: earnedPoints,
        timeTaken: timer,
        movementCount: movementCount + 1,
        attemptNumber: currentAttempt,
        completed: true,
        timestamp: new Date().toISOString()
      };

      const updatedLevelsData = {
        ...allLevelsData,
        [`level${levelId}`]: levelData
      };

      setAllLevelsData(updatedLevelsData);
      setCompletedLevels([...completedLevels, parseInt(levelId)]);

      saveUserData(updatedLevelsData, newPoints);

      if (currentAttempt === 1) {
        alert(`🎉 Congratulations! You solved the level in ${timer} seconds with ${movementCount + 1} moves and earned ${earnedPoints} points.`);
      } else {
        alert(`🎉 You solved the level in attempt ${currentAttempt} but no points are awarded for subsequent attempts.`);
      }
    }
  };

  const handleDragOver = (e) => {
    if (!isShuffled) return;
    e.preventDefault();
  };

  const saveUserData = async (levelsData, totalPoints) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'userStorytellingData', user.uid);

      const reportData = generateReportData(levelsData, totalPoints);

      const userData = {
        levels: levelsData,
        totalPoints,
        completedLevels: completedLevels.length + 1,
        lastPlayed: new Date().toISOString(),
        report: reportData
      };

      await setDoc(userDocRef, userData, { merge: true });
    }
  };

  const generateReportData = (levelsData, totalPoints) => {
    const completedLevels = Object.values(levelsData).filter(level => level.completed);
    const totalTime = completedLevels.reduce((sum, level) => sum + level.timeTaken, 0);
    const totalMoves = completedLevels.reduce((sum, level) => sum + level.movementCount, 0);
    const averageTime = completedLevels.length > 0 ? totalTime / completedLevels.length : 0;
    const averageMoves = completedLevels.length > 0 ? totalMoves / completedLevels.length : 0;

    let severity = '';
    if (totalPoints >= 80) severity = 'Normal';
    else if (totalPoints >= 60) severity = 'Mild';
    else if (totalPoints >= 40) severity = 'Moderate';
    else severity = 'Severe';

    return {
      totalLevelsCompleted: completedLevels.length,
      totalTime,
      totalMoves,
      averageTime,
      averageMoves,
      score: totalPoints,
      severity,
      lastUpdated: new Date().toISOString()
    };
  };

  const goToNextLevel = () => {
    const nextLevel = parseInt(levelId) + 1;
    if (nextLevel <= 10) {
      navigate(`/story-telling/level/${nextLevel}`);
    } else {
      navigate('/story-telling/report');
    }
  };

  const restartGame = () => {
    setPoints(0);
    navigate(`/story-telling/level/1`);
  };

  const exitGame = () => {
    if (intervalId) clearInterval(intervalId);
    navigate('/story-telling');
  };

  const viewReport = () => {
    navigate('/story-telling/report');
  };

  const nextInstruction = () => {
    if (currentInstruction < instructions.length - 1) {
      setCurrentInstruction(currentInstruction + 1);
    } else {
      setShowInstructions(false);
      setHasShownInitialTutorial(true);
    }
  };

  const prevInstruction = () => {
    if (currentInstruction > 0) {
      setCurrentInstruction(currentInstruction - 1);
    }
  };

  const openInstructions = () => {
    setCurrentInstruction(0);
    setShowInstructions(true);
  };

  const skipTutorial = () => {
    setShowInstructions(false);
    setHasShownInitialTutorial(true);
  };

  const renderTutorial = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '800px',
          width: '90%',
          position: 'relative'
        }}>
          <button
            onClick={skipTutorial}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#7f8c8d'
            }}
          >
            <FaTimes />
          </button>
          
          <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
            {instructions[currentInstruction].title}
          </h2>
          
          <div style={{ margin: '20px 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {instructions[currentInstruction].content}
          </div>
          
          {instructions[currentInstruction].image && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <img 
                src={instructions[currentInstruction].image} 
                alt="Instruction" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
              />
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <button
              onClick={prevInstruction}
              disabled={currentInstruction === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: currentInstruction === 0 ? '#cccccc' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: currentInstruction === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>
            
            <button
              onClick={nextInstruction}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {currentInstruction === instructions.length - 1 ? 'Got it!' : 'Next →'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '15px', color: '#7f8c8d' }}>
            Step {currentInstruction + 1} of {instructions.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(to bottom right, #e0f7fa, #ffffff)', 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative'
    }}>
      {showInstructions && renderTutorial()}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            padding: '10px 20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <h2>Storytelling Level {levelId}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={openInstructions}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FaLightbulb /> Help
              </button>
              <button
                onClick={viewReport}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FaChartBar /> Report
              </button>
              <button
                onClick={exitGame}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FaSignOutAlt /> Exit
              </button>
            </div>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <p><strong>{description}</strong></p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            margin: '15px 0',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p>Attempt: {currentAttempt}</p>
            <p>⏱️ Time: {timer}s</p>
            <p>🏆 Points: {points}</p>
            <p>🔄 Moves: {movementCount}</p>
          </div>

          <button
            onClick={shuffleImages}
            disabled={isShuffled && !levelComplete}
            style={{
              fontSize: '18px',
              padding: '12px 24px',
              margin: '10px',
              borderRadius: '10px',
              backgroundColor: isShuffled && !levelComplete ? '#cccccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: isShuffled && !levelComplete ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            🔀 Shuffle Images
          </button>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            background: '#ffffff',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            margin: '20px 0'
          }}>
            {shuffledImages.map((img, index) => (
              <div
                key={index}
                draggable={isShuffled}
                onDragStart={(e) => handleDragStart(e, img)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  margin: '10px',
                  border: '2px dashed #ccc',
                  borderRadius: '10px',
                  width: '120px',
                  height: '120px',
                  padding: '5px',
                  backgroundColor: isShuffled ? '#f0f0f0' : '#ddd',
                  opacity: isShuffled ? 1 : 0.5,
                  cursor: isShuffled ? 'move' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
              >
                <img
                  src={img}
                  alt={`img-${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          {timer >= 60 && !levelComplete && (
            <div style={{ 
              marginTop: '20px',
              background: '#ffebee',
              padding: '20px',
              borderRadius: '10px'
            }}>
              <p style={{ color: '#ff4444', fontWeight: 'bold' }}>⏳ Time's up! Try again!</p>
              <button 
                onClick={handleRetry}
                style={{
                  fontSize: '16px',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '10px auto'
                }}
              >
                🔄 Retry (Attempt {currentAttempt + 1})
              </button>
            </div>
          )}

          {levelComplete && (
            <div style={{ 
              marginTop: '20px',
              background: '#e8f5e9',
              padding: '20px',
              borderRadius: '10px'
            }}>
              <h3 style={{ color: '#4CAF50' }}>🎉 Level Completed!</h3>
              <p>✅ Total Points: {points}</p>
              <p>🔄 Total Moves: {movementCount}</p>
              <p>Attempts: {currentAttempt}</p>
              {parseInt(levelId) < 10 ? (
                <button 
                  onClick={goToNextLevel}
                  style={{
                    fontSize: '16px',
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    margin: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ➡️ Next Level
                </button>
              ) : (
                <div>
                  <p style={{ fontWeight: 'bold' }}>🏁 All levels completed!</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={viewReport}
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📊 View Final Report
                    </button>
                    <button
                      onClick={restartGame}
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🔁 Restart Game
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default StoryLevel;
