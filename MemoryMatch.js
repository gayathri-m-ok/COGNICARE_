import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaLightbulb, FaClock, FaStar, FaUndo, FaHome, FaSignOutAlt, FaChartBar, FaTimes, FaQuestionCircle, FaArrowLeft } from "react-icons/fa";
import { GiCardRandom } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const fullEmojiSet = [
  "🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍉", "🥥", "🍒", "🥑",
  "🍋", "🍊", "🍈", "🍐", "🍏", "🥕", "🍆", "🌽", "🌶", "🥔",
  "🥦", "🥬", "🥒", "🍄", "🥜", "🧄", "🧅", "🍞", "🧀", "🥓"
];

const MemoryMatch = () => {
  const navigate = useNavigate();
  const [gameStage, setGameStage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [timer, setTimer] = useState(1);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [flips, setFlips] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [hasShownInitialTutorial, setHasShownInitialTutorial] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    let countdown;
    if (gameStarted && timer <= 60 && !showTutorial && !showNextButton && !showRestartButton) {
      countdown = setTimeout(() => {
        setTimer(prev => prev + 1);
        if (timer === 60) {
          setTimeUp(true);
        }
      }, 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer, gameStarted, showTutorial, showNextButton, showRestartButton]);

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

  const getCardCountForLevel = (level, difficulty) => {
    if (difficulty === "mild") {
      if (level <= 5) return 4;
      return 6;
    }
    if (difficulty === "moderate") {
      if (level <= 5) return 6;
      return 8;
    }
    if (difficulty === "severe") {
      if (level <= 3) return 8;
      if (level <= 6) return 10;
      return 12;
    }
  };

  const generateEmojiSet = (count, levelIndex) => {
    const offset = (levelIndex * count) % (fullEmojiSet.length - count);
    const selected = fullEmojiSet.slice(offset, offset + count / 2);
    return [...selected, ...selected].sort(() => Math.random() - 0.5);
  };

  const initializeLevel = (level, difficulty) => {
    const pairCount = getCardCountForLevel(level, difficulty);
    const cardValues = generateEmojiSet(pairCount, level);
    const shuffled = cardValues.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    })).sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setFlips(0);
    setAttempts(0);
    setCurrentAttempt(prev => prev);
    setShowNextButton(false);
    setShowRestartButton(false);
    setShowRetryButton(false);
    setTimer(1);
    setTimeUp(false);
  };

  const startStage = (stage) => {
    setGameStage(stage);
    setGameStarted(true);
    setCurrentLevel(1);
    setRewardPoints(0);
    setCurrentAttempt(1);
    initializeLevel(1, stage);
  };

  const saveReport = async (pointsEarned, isCompleted = false) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Format the timestamp as requested
      const formatTimestamp = (date) => {
        const options = { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          timeZoneName: 'short'
        };
        return date.toLocaleString('en-US', options);
      };

      const reportData = {
        [`level_${currentLevel}_attempt_${currentAttempt}`]: {
          attempts: attempts,
          moves: flips,
          difficulty: gameStage,
          level: currentLevel,
          points: pointsEarned,
          timeTaken: timer,
          timestamp: formatTimestamp(new Date()),
          completed: isCompleted,
          attemptNumber: currentAttempt
        }
      };

      const userReportRef = doc(db, "memorymatchreport", user.uid);
      
      // Use setDoc with merge: true to update only the specified fields
      await setDoc(userReportRef, reportData, { merge: true });
      
      console.log("Report saved successfully");
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= 10) {
      setCurrentLevel(nextLevel);
      setCurrentAttempt(1);
      initializeLevel(nextLevel, gameStage);
    } else {
      setShowRestartButton(true);
    }
  };

  const handleRetry = async () => {
    // Save the current failed attempt before retrying
    await saveReport(0, false);
    setCurrentAttempt(prev => prev + 1);
    initializeLevel(currentLevel, gameStage);
  };

  const handleRestartGame = () => {
    setGameStarted(false);
    setGameStage("");
    setCurrentLevel(1);
    setRewardPoints(0);
    setTimer(1);
    setAttempts(0);
    setFlips(0);
    setShowNextButton(false);
    setShowRestartButton(false);
    setShowRetryButton(false);
    setCurrentAttempt(1);
    setTimeUp(false);
  };

  const handleExitGame = () => {
    setGameStarted(false);
    setGameStage("");
    setCurrentLevel(1);
    setRewardPoints(0);
    setTimer(1);
    setAttempts(0);
    setFlips(0);
    setShowNextButton(false);
    setShowRestartButton(false);
    setShowRetryButton(false);
    setCurrentAttempt(1);
    setTimeUp(false);
  };

  const viewReport = () => {
    navigate('/report');
  };

  const handleCardClick = async (clickedCard) => {
    if (showTutorial || timeUp || timer > 60 || flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) return;

    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );

    const updatedFlipped = [...flippedCards, clickedCard];
    setCards(updatedCards);
    setFlippedCards(updatedFlipped);
    setFlips((prev) => prev + 1);

    if (updatedFlipped.length === 2) {
      setTimeout(() => {
        const [first, second] = updatedFlipped;
        let newCards;

        if (first.value === second.value) {
          newCards = updatedCards.map((card) =>
            card.value === first.value ? { ...card, isMatched: true } : card
          );
        } else {
          newCards = updatedCards.map((card) =>
            card.isMatched ? card : { ...card, isFlipped: false }
          );
          setAttempts((prev) => prev + 1);
        }

        setCards(newCards);
        setFlippedCards([]);

        if (newCards.every((card) => card.isMatched)) {
          const points = currentAttempt === 1 && timer <= 60 ? calculatePoints(timer) : 0;
          if (currentAttempt === 1) {
            setRewardPoints(prev => prev + points);
          }
          saveReport(points, true);
          setTimeout(() => {
            setShowNextButton(true);
          }, 500);
        }
      }, 1000);
    }
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
            How to Play Memory Match
          </h2>
          
          {tutorialStep === 0 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Welcome to the Memory Match game! Test your memory by matching pairs of cards.
                Let's walk through how the game works.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div></div> {/* Empty div for spacing */}
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
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 100px)',
                gap: '15px',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {['🍎', '🍌', '🍇', '❓', '❓', '❓'].map((emoji, index) => (
                  <div key={index} style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid #ccc',
                    backgroundColor: emoji === '❓' ? '#aaa' : '#fefefe',
                    fontSize: '32px',
                    borderRadius: '10px'
                  }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                This is the game board. Click on cards to reveal them and find matching pairs.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
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
                    backgroundColor: '#95a5a6',
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
                    backgroundColor: '#95a5a6',
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
                You'll choose from three difficulty levels: Severe, Moderate, and Mild.
                Each has 10 levels with increasing difficulty.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={prevTutorialStep}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
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

  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(to bottom right, #e0f7fa, #ffffff)', 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative'
    }}>
      {showTutorial && renderTutorial()}
      
      {/* Back Button - Always visible in top left corner */}
      <button
        onClick={() => navigate('/brain-games')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 100
        }}
      >
        <FaArrowLeft />
      </button>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {!hasShownInitialTutorial ? null : !gameStarted ? (
          <div style={{ textAlign: "center", padding: "30px" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
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
                  gap: '8px'
                }}
              >
                <FaQuestionCircle /> Help
              </button>
            </div>
            
            <h1 style={{ fontSize: "2.5rem", color: "#2c3e50", marginBottom: "20px" }}>
              <GiCardRandom /> Welcome to Memory Match Game
            </h1>
            <p style={{ fontSize: "1.2rem", fontStyle: "italic", marginBottom: "40px", color: "#7f8c8d" }}>
              "Test your memory and have fun matching pairs!"
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <div 
                onClick={() => startStage('mild')}
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
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Mild Stage</h2>
                <p style={{ color: '#34495e' }}>Easiest level with fewer cards (4-6 pairs)</p>
                <div style={{ marginTop: '20px', color: '#16a085', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Perfect for beginners
                </div>
              </div>
              
              <div 
                onClick={() => startStage('moderate')}
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
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Moderate Stage</h2>
                <p style={{ color: '#34495e' }}>Medium difficulty with 6-8 pairs</p>
                <div style={{ marginTop: '20px', color: '#f39c12', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> For experienced players
                </div>
              </div>
              
              <div 
                onClick={() => startStage('severe')}
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
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Severe Stage</h2>
                <p style={{ color: '#34495e' }}>Hardest level with 8-12 pairs</p>
                <div style={{ marginTop: '20px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Only for memory experts
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px" }}>
            {currentLevel <= 10 ? (
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
                  <button
                    onClick={showHelp}
                    style={{
                      padding: "8px 15px",
                      fontSize: "0.8rem",
                      backgroundColor: "#3498db",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaQuestionCircle /> Help
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '5px 15px', 
                      background: gameStage === 'severe' ? '#a1c4fd' : 
                                  gameStage === 'moderate' ? '#ffecd2' : '#ff9a9e',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {gameStage.charAt(0).toUpperCase() + gameStage.slice(1)} Stage
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaStar style={{ color: '#f1c40f', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{rewardPoints}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaClock style={{ color: '#3498db', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{timer}s</span>
                    </div>
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
                  Level {currentLevel} of 10
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
                      Attempts: {attempts} | Flips: {flips} | Current Attempt: {currentAttempt}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(getCardCountForLevel(currentLevel, gameStage)))}, 100px)`,
                      gap: "20px",
                      justifyContent: "center",
                      margin: "0 auto",
                      maxWidth: '800px'
                    }}
                  >
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        style={{
                          width: "100px",
                          height: "100px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "2px solid #ccc",
                          backgroundColor: card.isFlipped || card.isMatched ? "#fefefe" : "#aaa",
                          fontSize: "32px",
                          cursor: timeUp || timer > 60 ? "not-allowed" : "pointer",
                          borderRadius: "10px",
                          opacity: timeUp || timer > 60 ? 0.7 : 1,
                          transition: 'all 0.3s'
                        }}
                      >
                        {card.isFlipped || card.isMatched ? card.value : "❓"}
                      </div>
                    ))}
                  </div>
                </div>

                {(timeUp || timer > 60) && !showNextButton && (
                  <div style={{ 
                    background: '#ffebee',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ color: "#e74c3c", fontSize: "1.1rem", marginBottom: '15px' }}>
                      ⏰ Time's up! Please try again.
                    </p>
                    <button
                      onClick={handleRetry}
                      style={{
                        padding: "10px 20px",
                        fontSize: "1rem",
                        backgroundColor: "#e67e22",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      <FaUndo /> Retry
                    </button>
                  </div>
                )}

                {showNextButton && (
                  <div style={{ 
                    background: '#e8f5e9',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p>
                      ✅ Level Complete! 🎉 {
                        currentAttempt === 1
                          ? `You earned ${calculatePoints(timer)} points!`
                          : "No points earned in retry."
                      }
                    </p>

                    <button
                      onClick={handleNextLevel}
                      style={{
                        marginTop: "10px",
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
                  </div>
                )}

                <div style={{ marginTop: "20px", display: 'flex', justifyContent: 'center', gap: '15px' }}>
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
                    onClick={handleRestartGame}
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
                    <FaHome /> Change Stage
                  </button>
                  <button
                    onClick={handleExitGame}
                    style={{
                      padding: "10px 20px",
                      fontSize: "0.9rem",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
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
                  You have completed all levels in the {gameStage} stage!
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
                    Total Reward Points: {rewardPoints}
                  </h3>
                  <p style={{ color: "#7f8c8d", fontStyle: 'italic' }}>
                    {rewardPoints >= 90 ? "Amazing! You're a memory master!" :
                     rewardPoints >= 70 ? "Great job! You're really good at this!" :
                     rewardPoints >= 50 ? "Good work! Keep practicing to improve!" :
                     "Nice try! Practice makes perfect!"}
                  </p>
                </div>
                <button
                  onClick={handleRestartGame}
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
                  <FaHome /> Back to Stages
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;