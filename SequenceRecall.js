import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaBrain, FaChartBar, FaClock, FaStar, FaUndo, FaHome, FaSignOutAlt, FaLightbulb, FaTimes, FaArrowLeft, FaQuestionCircle } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const shapes = [
  { id: 1, shape: "square", color: "red" },
  { id: 2, shape: "square", color: "green" },
  { id: 3, shape: "hexagon", color: "blue" },
  { id: 4, shape: "hexagon", color: "red" },
  { id: 5, shape: "circle", color: "green" },
  { id: 6, shape: "circle", color: "black" },
  { id: 7, shape: "star", color: "orange" },
  { id: 8, shape: "star", color: "blue" },
  { id: 9, shape: "triangle", color: "black" },
  { id: 10, shape: "triangle", color: "orange" }
];

const SequenceRecall = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [deselectCount, setDeselectCount] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState({});
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [hasShownInitialTutorial, setHasShownInitialTutorial] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    let countdown;
    if (gameStarted && !showSequence && selectedDifficulty && timerRunning) {
      countdown = setTimeout(() => {
        setTimer((prev) => {
          if (prev >= 60) {
            setTimerRunning(false);
            setMessage("⏰ Time's up! Please retry the level.");
            setShowRetry(true);
            return 60;
          }
          return prev + 1;
        });
        setTimeTaken(prev => prev + 1);
      }, 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer, gameStarted, showSequence, selectedDifficulty, timerRunning]);

  useEffect(() => {
    if (userInput.length === sequence.length && sequence.length > 0) {
      checkAnswer();
    }
  }, [userInput]);

  const calculatePoints = (time) => {
    if (levelAttempts[level] > 1) return 0;
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

  const getShapeCountForLevel = (level, difficulty) => {
    if (difficulty === "mild") {
      return level <= 5 ? 3 : 4;
    } else if (difficulty === "moderate") {
      return level <= 5 ? 4 : 5;
    } else if (difficulty === "severe") {
      if (level <= 3) return 5;
      if (level <= 6) return 6;
      return 7;
    }
    return 3;
  };

  const generateSequence = () => {
    const count = getShapeCountForLevel(level, selectedDifficulty);
    const shuffled = [...shapes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    setSequence(selected);
    setCorrectAnswer(selected.map(shape => shape.id).join(','));
    setShowSequence(true);
    setUserInput([]);
    setCurrentIndex(0);
    setShowRetry(false);
    setLevelCompleted(false);
    setDeselectCount(0);
    setTimer(0);
    setTimeTaken(0);
    setTimerRunning(false);

    let index = 0;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      index++;
      if (index === selected.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSequence(false);
          setTimerRunning(true);
        }, 1000);
      }
    }, 800);
  };

  const startGameWithDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setGameStarted(true);
    setLevel(1);
    setScore(0);
    setAttempts(0);
    setCompleted(false);
    setLevelAttempts({});
    generateSequence();
  };

  const viewReport = () => {
    navigate('/report');
  };

  const handleUserClick = (shape) => {
    if (showSequence || userInput.length > sequence.length || timer === 60) return;

    setUserInput((prevInput) => {
      const isSelected = prevInput.includes(shape.id);
      let newInput;

      if (isSelected) {
        newInput = prevInput.filter((id) => id !== shape.id);
        return newInput;
      } else {
        newInput = [...prevInput, shape.id];
        return newInput;
      }
    });

    if (userInput.includes(shape.id)) {
      setDeselectCount(prev => prev + 1);
    }
  };

  const checkAnswer = async (inputSequence = userInput) => {
    if (inputSequence.length !== sequence.length) return;

    const newAttempts = attempts + 1;
    const newLevelAttempts = {
      ...levelAttempts,
      [level]: (levelAttempts[level] || 0) + 1
    };

    setAttempts(newAttempts);
    setLevelAttempts(newLevelAttempts);

    const userAnswerString = inputSequence.join(',');
    setUserAnswer(userAnswerString);

    const isCorrect = userAnswerString === correctAnswer;

    if (isCorrect && !levelCompleted) {
      setTimerRunning(false);
      const totalTimeTaken = timer;
      setTimeTaken(totalTimeTaken);
      setMessage("✅ Correct! Well done!");
      
      if (newLevelAttempts[level] === 1) {
        const pointsEarned = calculatePoints(totalTimeTaken);
        const newScore = score + pointsEarned;
        setScore(newScore);
        await saveGameData(level, pointsEarned, 1, totalTimeTaken, deselectCount);
      } else {
        await saveGameData(level, 0, newLevelAttempts[level], totalTimeTaken, deselectCount);
      }
      
      setLevelCompleted(true);
      setShowRetry(false);
    } else if (!isCorrect) {
      setMessage("❌ Wrong! Retry the level.");
      setShowRetry(true);
    }
  };

  const saveGameData = async (currentLevel, pointsEarned, totalAttempts, timeTakenForLevel, deselects) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "sequenceRecallReports", user.uid);
    const userDoc = await getDoc(userRef);

    const levelData = {
      level: currentLevel,
      points: pointsEarned || 0,
      attempts: totalAttempts || 0,
      timeTaken: timeTakenForLevel || 0,
      deselects: deselects || 0,
      difficulty: selectedDifficulty,
      timestamp: new Date()
    };

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      const updatedLevels = {
        ...existingData,
        [`level${currentLevel}`]: levelData
      };

      const levelsCompleted = Object.keys(updatedLevels)
        .filter(key => key.startsWith('level') && updatedLevels[key].points > 0)
        .length;
      
      const totalPoints = Object.keys(updatedLevels)
        .filter(key => key.startsWith('level'))
        .reduce((sum, key) => sum + (updatedLevels[key].points || 0), 0);
      
      const totalDeselects = Object.keys(updatedLevels)
        .filter(key => key.startsWith('level'))
        .reduce((sum, key) => sum + (updatedLevels[key].deselects || 0), 0);
      
      const totalTime = Object.keys(updatedLevels)
        .filter(key => key.startsWith('level'))
        .reduce((sum, key) => sum + (updatedLevels[key].timeTaken || 0), 0);

      const report = {
        averageDeselects: levelsCompleted > 0 ? Math.round(totalDeselects / levelsCompleted) : 0,
        averageTime: levelsCompleted > 0 ? Math.round(totalTime / levelsCompleted) : 0,
        lastUpdated: new Date(),
        score: totalPoints,
        totalLevelsCompleted: levelsCompleted,
        totalDeselects,
        totalTime,
        totalPoints,
        difficulty: selectedDifficulty
      };

      const mergedData = {
        ...updatedLevels,
        report
      };

      await setDoc(userRef, mergedData);
    } else {
      const initialData = {
        [`level${currentLevel}`]: levelData,
        report: {
          averageDeselects: deselects || 0,
          averageTime: timeTakenForLevel || 0,
          lastUpdated: new Date(),
          score: pointsEarned || 0,
          totalLevelsCompleted: 1,
          totalDeselects: deselects || 0,
          totalTime: timeTakenForLevel || 0,
          totalPoints: pointsEarned || 0,
          difficulty: selectedDifficulty
        }
      };

      await setDoc(userRef, initialData);
    }
  };

  const nextLevel = () => {
    if (level < 10) {
      setLevel(level + 1);
      setMessage("");
      setShowRetry(false);
      generateSequence();
    } else {
      setCompleted(true);
      setMessage("🎉 Congratulations! You completed all levels!");
    }
  };

  const retryLevel = () => {
    generateSequence();
    setMessage("");
    setShowRetry(false);
  };

  const exitGame = () => {
    setGameStarted(false);
    setSelectedDifficulty(null);
    setMessage("");
    setScore(0);
    setLevel(1);
    setShowTutorial(false);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < 4) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      setHasShownInitialTutorial(true);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasShownInitialTutorial(true);
  };

  const showHelp = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const goBackToHome = () => {
  navigate('/brain-games');  // Lowercase to match App.js route
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
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#7f8c8d'
            }}
          >
            <FaTimes />
          </button>
          
          <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
            How to Play Sequence Recall
          </h2>

          {tutorialStep === 0 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Welcome to the Sequence Recall game! Test your memory by remembering sequences of shapes.
                Let's walk through how the game works.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={nextTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 1 && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {shapes.slice(0, 3).map((shape) => (
                  <div key={shape.id} style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: shape.color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: shape.shape === 'circle' ? '50%' : '0'
                  }}></div>
                ))}
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                You'll see a sequence of shapes appear one by one. Remember both the shapes and their order.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7f8c8d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={nextTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 2 && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaClock style={{ color: '#3498db', marginRight: '5px' }} />
                  <span>60s</span>
                </div>
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                The timer shows how much time you have left to complete the level. Points are awarded based on how quickly you complete the level:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li>≤10 seconds: 10 points</li>
                <li>≤15 seconds: 9 points</li>
                <li>≤20 seconds: 8 points</li>
                <li>...and so on, with 1 point for ≤55 seconds</li>
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7f8c8d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={nextTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 3 && (
            <div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FaSignOutAlt /> Exit
                </button>
                <button
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#e67e22',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FaUndo /> Retry
                </button>
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Use the Exit button to leave the game or the Retry button to try the same level again.
                Note: You won't earn points if you use Retry.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7f8c8d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={nextTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 4 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Ready to start the game?
              </p>
              <p style={{ marginBottom: '30px' }}>
                You'll choose from three difficulty levels: Mild, Moderate, and Severe.
                Each has 10 levels with increasing difficulty.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7f8c8d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={nextTutorialStep}
                  style={{
                    padding: '12px 25px',
                    fontSize: '1rem',
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderShape = (shape) => {
    const selectedIndex = userInput.indexOf(shape.id);
    const isSelected = selectedIndex !== -1;

    const baseStyle = {
      width: "80px",
      height: "80px",
      margin: "10px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: shape.color,
      position: "relative",
      cursor: timer === 60 ? "not-allowed" : "pointer",
      border: isSelected ? "4px solid black" : "none",
      opacity: timer === 60 ? 0.7 : 1
    };

    const shapeStyle = {
      ...(shape.shape === "circle" && { ...baseStyle, borderRadius: "50%" }),
      ...(shape.shape === "square" && { ...baseStyle }),
      ...(shape.shape === "triangle" && {
        width: 0,
        height: 0,
        borderLeft: "40px solid transparent",
        borderRight: "40px solid transparent",
        borderBottom: `80px solid ${shape.color}`,
        backgroundColor: "transparent",
        position: "relative",
        margin: "10px",
        cursor: timer === 60 ? "not-allowed" : "pointer"
      }),
      ...(shape.shape === "star" && {
        backgroundColor: "transparent",
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        background: shape.color,
        ...baseStyle
      }),
      ...(shape.shape === "hexagon" && {
        backgroundColor: "transparent",
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        background: shape.color,
        ...baseStyle
      })
    };

    return (
      <div style={shapeStyle}>
        {isSelected && (
          <div style={{
            position: 'absolute',
            color: 'white',
            fontSize: '40px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px black'
          }}>✓</div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(to bottom right, #e0f7fa, #ffffff)',
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif"
    }}>
      {showTutorial && renderTutorial()}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={goBackToHome}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 100
          }}
        >
          <FaArrowLeft size={20} />
        </button>
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
  <button
    onClick={showHelp}
    style={{
      padding: "10px 20px",
      fontSize: "0.9rem",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}
  >
    <FaQuestionCircle /> Help
  </button>
</div>
        {!hasShownInitialTutorial ? null : !gameStarted ? (
          <div style={{ textAlign: "center", padding: "30px" }}>
            <h1 style={{ fontSize: "2.5rem", color: "#2c3e50", marginBottom: "20px" }}>
              <GiBrain style={{ marginRight: '10px' }} /> Welcome to Sequence Recall
            </h1>
            <p style={{ fontSize: "1.2rem", fontStyle: "italic", marginBottom: "40px", color: "#7f8c8d" }}>
              "Test your memory - recall the sequence and beat the levels!"
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <div 
                onClick={() => startGameWithDifficulty('mild')}
                style={{
                  width: '300px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Mild Difficulty</h2>
                <p style={{ color: '#34495e' }}>Beginner level with shorter sequences</p>
                <div style={{ marginTop: '20px', color: '#16a085', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Perfect for beginners
                </div>
              </div>
              
              <div 
                onClick={() => startGameWithDifficulty('moderate')}
                style={{
                  width: '300px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Moderate Difficulty</h2>
                <p style={{ color: '#34495e' }}>Intermediate level with medium sequences</p>
                <div style={{ marginTop: '20px', color: '#f39c12', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> For experienced players
                </div>
              </div>
              
              <div 
                onClick={() => startGameWithDifficulty('severe')}
                style={{
                  width: '300px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Severe Difficulty</h2>
                <p style={{ color: '#34495e' }}>Expert level with long sequences</p>
                <div style={{ marginTop: '20px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Only for the bravest
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px" }}>
            {!completed ? (
              <div>
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '5px 15px', 
                      background: selectedDifficulty === 'mild' ? '#a1c4fd' : 
                                  selectedDifficulty === 'moderate' ? '#ffecd2' : '#ff9a9e',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Difficulty
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaStar style={{ color: '#f1c40f', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaClock style={{ color: '#3498db', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{timer}s</span>
                    </div>
                    <button
                      onClick={showHelp}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaQuestionCircle />
                    </button>
                  </div>
                </div>

                <h2 style={{ 
                  fontSize: '1.8rem', 
                  color: '#2c3e50', 
                  margin: '20px 0',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '10px'
                }}>
                  Level {level} of 10
                </h2>

                <div style={{ 
                  background: '#ffffff',
                  padding: '25px',
                  borderRadius: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  marginBottom: '25px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#34495e' }}>
                      Attempts: {levelAttempts[level] || 0} | Deselects: {deselectCount} | Time: {timer}s
                    </p>
                  </div>

                  {showSequence ? (
                    <div>
                      <h3 style={{ marginBottom: '20px', color: '#34495e' }}>
                        Remember these shapes in order:
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {sequence.slice(0, currentIndex).map((shape) => (
                          <div key={shape.id} style={{ display: "inline-block", margin: "10px" }}>
                            {renderShape(shape)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ marginBottom: '20px', color: '#34495e' }}>
                        Recall the shapes in the same order:
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {shapes.map((shape) => (
                          <div 
                            key={shape.id} 
                            onClick={() => handleUserClick(shape)}
                            style={{ display: "inline-block" }}
                          >
                            {renderShape(shape)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message && (
                  <div style={{
                    background: userAnswer === correctAnswer ? '#e8f5e9' : '#ffebee',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p style={{
                      color: userAnswer === correctAnswer ? "#27ae60" : "#e74c3c",
                      fontSize: "1.1rem",
                      marginBottom: '15px',
                      fontWeight: 'bold'
                    }}>
                      {userAnswer === correctAnswer ? "✅ Correct! Well done!" : "❌ Wrong! Retry the level."}
                    </p>
                    {userAnswer === correctAnswer && (
                      <div>
                        {levelAttempts[level] === 1 && (
                          <p style={{ color: "#16a085", margin: '5px 0' }}>
                            Time taken: {timeTaken} seconds ({calculatePoints(timeTaken)} points)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: "20px", display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  {levelCompleted ? (
                    <button
                      onClick={nextLevel}
                      style={{
                        padding: "12px 25px",
                        fontSize: "1rem",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      Next Level
                    </button>
                  ) : showRetry ? (
                    <button
                      onClick={retryLevel}
                      style={{
                        padding: "12px 25px",
                        fontSize: "1rem",
                        backgroundColor: "#e67e22",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      <FaUndo /> Retry Level
                    </button>
                  ) : null}

                  <button
                    onClick={viewReport}
                    style={{
                      padding: "10px 20px",
                      fontSize: "0.9rem",
                      backgroundColor: "#9b59b6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    >
                    <FaChartBar /> View Report
                  </button>

                  <button
                    onClick={exitGame}
                    style={{
                      padding: "12px 25px",
                      fontSize: "1rem",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    <FaSignOutAlt /> Exit Game
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                background: '#ffffff',
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: "2rem", color: "#2ecc71", marginBottom: "20px" }}>
                  Congratulations! 🎉
                </h2>
                <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
                  You have completed all levels in {selectedDifficulty} difficulty!
                </p>
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '10px',
                  margin: '20px auto',
                  maxWidth: '400px'
                }}>
                  <h3 style={{ color: "#2c3e50", marginBottom: '15px' }}>
                    <FaStar style={{ color: '#f1c40f', marginRight: '10px' }} />
                    Total Score: {score}
                  </h3>
                  <p style={{ color: "#7f8c8d", fontStyle: 'italic' }}>
                    {score >= 90 ? "Amazing memory! You're a sequence master!" :
                     score >= 70 ? "Great job! Your recall skills are impressive!" :
                     score >= 50 ? "Good work! Keep practicing to improve!" :
                     "Nice try! The more you practice, the better you'll get!"}
                  </p>
                </div>
                <button
                  onClick={exitGame}
                  style={{
                    marginTop: "20px",
                    padding: "12px 25px",
                    fontSize: "1rem",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  <FaHome /> Back to Difficulty Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SequenceRecall;