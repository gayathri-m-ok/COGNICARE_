import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaBrain, FaClock, FaStar, FaUndo, FaHome, FaSignOutAlt, FaChartBar, FaTimes, FaArrowLeft, FaQuestionCircle } from "react-icons/fa";
import { GiCardRandom } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const PuzzleGame = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [stage, setStage] = useState(null);
  const [level, setLevel] = useState(1);
  const [images, setImages] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [timer, setTimer] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [moves, setMoves] = useState(0);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [hasShownInitialTutorial, setHasShownInitialTutorial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 160, height: 160 });

  const auth = getAuth();
  const user = auth.currentUser;

  const clearPreviousData = async () => {
    if (!user) return;
    
    try {
      const puzzleRef = doc(db, "puzzleReports", user.uid);
      await setDoc(puzzleRef, {
        totalPoints: 0,
        lastUpdated: new Date().toISOString(),
        completedLevels: 0,
        report: null,
        finalReport: false,
        stage: stage // Save the difficulty level
      }, { merge: true });
    } catch (error) {
      console.error("Error clearing previous data:", error);
    }
  };

  const calculatePoints = (time) => {
    if (attempts > 1) return 0;
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

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = async (selectedStage) => {
    setStage(selectedStage);
    await clearPreviousData();
    setGameStarted(true);
    setLevel(1);
    setTimer(1);
    setRewardPoints(0);
    setAllLevelsCompleted(false);
    setImageDimensions({ width: 160, height: 160 });
    setAttempts(0);
    setMoves(0);
  };

  const shuffleImages = () => {
    const newlyShuffled = shuffleArray(images);
    setShuffledImages(newlyShuffled);
    setTimer(1);
    setDragEnabled(true);
    setLevelCompleted(false);
    setTimeUp(false);
    setAttempts(prev => prev + 1);
    setMoves(0);
  };

  const handleDragStart = (index) => {
    if (dragEnabled && timer <= 60) {
      setDragIndex(index);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    if (dragIndex === null || !dragEnabled || timer > 60) return;

    const newImages = [...shuffledImages];
    [newImages[dragIndex], newImages[dropIndex]] = [
      newImages[dropIndex],
      newImages[dragIndex],
    ];
    setShuffledImages(newImages);
    setDragIndex(null);
    setMoves(prev => prev + 1);

    if (arraysAreEqual(newImages, images) && !levelCompleted && timer <= 60) {
      const timeTaken = timer;
      const currentDateTime = new Date();
      const formattedDate = currentDateTime.toLocaleDateString();
      const formattedTime = currentDateTime.toLocaleTimeString();

      setLevelCompleted(true);
      
      const pointsEarned = attempts === 1 ? calculatePoints(timeTaken) : 0;
      setRewardPoints((prev) => prev + pointsEarned);

      if (user) {
        const puzzleRef = doc(db, "puzzleReports", user.uid);
        try {
          const docSnap = await getDoc(puzzleRef);
          const currentData = docSnap.exists() ? docSnap.data() : {};
          const completedLevels = currentData.completedLevels || 0;

          await setDoc(
            puzzleRef,
            {
              [`level${level}`]: {
                timeTaken,
                attempts,
                moves,
                points: pointsEarned,
                date: formattedDate,
                time: formattedTime,
                completed: true,
                difficulty: stage // Save difficulty with each level
              },
              totalPoints: (currentData.totalPoints || 0) + pointsEarned,
              completedLevels: completedLevels + 1,
              lastUpdated: new Date().toISOString(),
              stage: stage // Save overall difficulty
            },
            { merge: true }
          );

          await updateReport();
        } catch (error) {
          console.error("Error saving puzzle result:", error);
        }
      }

      setTimeout(() => {
        if (level === 10) {
          setAllLevelsCompleted(true);
          setDragEnabled(false);
          calculateFinalReport();
        } else {
          setShowNextButton(true);
        }
      }, 500);
    }
  };

  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  };

  const updateReport = async () => {
    if (!user) return;

    try {
      const puzzleRef = doc(db, "puzzleReports", user.uid);
      const docSnap = await getDoc(puzzleRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const totalPoints = data.totalPoints || 0;
        const completedLevels = data.completedLevels || 0;
        
        const levelsData = {};
        for (let i = 1; i <= 10; i++) {
          if (data[`level${i}`]) {
            levelsData[`level${i}`] = data[`level${i}`];
          }
        }

        const completedLevelsData = Object.values(levelsData);
        const totalMoves = completedLevelsData.reduce((sum, level) => sum + (level.moves || 0), 0);
        const totalTime = completedLevelsData.reduce((sum, level) => sum + (level.timeTaken || 0), 0);
        const totalAttempts = completedLevelsData.reduce((sum, level) => sum + (level.attempts || 0), 0);

        const reportData = {
          averageMoves: completedLevels > 0 ? Math.round(totalMoves / completedLevels) : 0,
          averageTime: completedLevels > 0 ? Math.round(totalTime / completedLevels) : 0,
          averageAttempts: completedLevels > 0 ? (totalAttempts / completedLevels).toFixed(1) : 0,
          lastUpdated: new Date().toISOString(),
          score: totalPoints,
          severity: calculateSeverity(totalPoints, completedLevels),
          stage: stage,
          completedLevels: completedLevels
        };
        
        await setDoc(puzzleRef, {
          report: reportData,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const calculateSeverity = (points, completedLevels) => {
    if (completedLevels === 0) return 'Not Assessed';
    
    const normalizedPoints = (points / completedLevels) * 10;
    
    if (normalizedPoints >= 8) return 'Normal';
    if (normalizedPoints >= 6) return 'Mild';
    if (normalizedPoints >= 4) return 'Moderate';
    return 'Severe';
  };

  const calculateFinalReport = async () => {
    if (!user) return;

    try {
      const puzzleRef = doc(db, "puzzleReports", user.uid);
      const docSnap = await getDoc(puzzleRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const totalPoints = data.totalPoints || 0;
        
        const levelsData = {};
        for (let i = 1; i <= 10; i++) {
          if (data[`level${i}`]) {
            levelsData[`level${i}`] = data[`level${i}`];
          }
        }

        const completedLevelsData = Object.values(levelsData);
        const totalMoves = completedLevelsData.reduce((sum, level) => sum + (level.moves || 0), 0);
        const totalTime = completedLevelsData.reduce((sum, level) => sum + (level.timeTaken || 0), 0);
        const totalAttempts = completedLevelsData.reduce((sum, level) => sum + (level.attempts || 0), 0);

        const reportData = {
          averageMoves: Math.round(totalMoves / completedLevelsData.length),
          averageTime: Math.round(totalTime / completedLevelsData.length),
          averageAttempts: (totalAttempts / completedLevelsData.length).toFixed(1),
          lastUpdated: new Date().toISOString(),
          score: totalPoints,
          severity:
            totalPoints >= 80
              ? 'Normal'
              : totalPoints >= 60
              ? 'Mild'
              : totalPoints >= 40
              ? 'Moderate'
              : 'Severe',
          stage: stage,
          completedAt: new Date().toISOString()
        };
        
        await setDoc(puzzleRef, {
          report: reportData,
          finalReport: true,
          completedLevels: completedLevelsData.length,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error calculating final report:", error);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    if (nextLevel <= 10) {
      setLevel(nextLevel);
      setShowNextButton(false);
      setImageDimensions({ width: 160, height: 160 });
      setAttempts(0);
      setMoves(0);
    } else {
      setAllLevelsCompleted(true);
    }
  };

  const retryLevel = () => {
    setTimer(1);
    setShuffledImages(shuffleArray(images));
    setDragEnabled(true);
    setLevelCompleted(false);
    setTimeUp(false);
    setAttempts(prev => prev + 1);
    setMoves(0);
    setShowRetryButton(false);
  };

  const exitGame = () => {
    setGameStarted(false);
    setStage(null);
    setLevel(1);
    setRewardPoints(0);
    setTimer(1);
    setDragEnabled(false);
    setLevelCompleted(false);
    setTimeUp(false);
    setAttempts(0);
    setMoves(0);
    setShuffledImages([]);
    setImages([]);
    setShowNextButton(false);
    setShowRetryButton(false);
    setImageDimensions({ width: 160, height: 160 });
  };

  const viewReport = () => {
    navigate('/braingames/report', { state: { activeTab: 'puzzle' } });
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

  const goBack = () => {
    navigate('/brain-games');
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
            How to Play Puzzle Game
          </h2>
          
          {tutorialStep === 0 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Welcome to the Puzzle Game! Test your problem-solving skills by rearranging puzzle pieces.
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
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 100px)',
                gap: '5px',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                  <div key={num} style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    backgroundColor: '#fefefe',
                    fontSize: '24px'
                  }}>
                    {num}
                  </div>
                ))}
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                For Moderate difficulty (3×3 grid), the correct order is:
                <br />
                First row (9, 8, 7), Second row (6, 5, 4), Third row (3, 2, 1)
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUndo style={{ color: '#e67e22', marginRight: '5px' }} />
                  <span>Moves: 0</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Attempts: 0</span>
                </div>
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                The game tracks your moves, attempts, and time. Points are awarded based on how quickly you complete the level:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li>≤10 seconds: 10 points</li>
                <li>≤15 seconds: 9 points</li>
                <li>≤20 seconds: 8 points</li>
                <li>...and so on, with 1 point for ≤55 seconds</li>
                <li>Points only awarded on first attempt</li>
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
                You'll play through 10 levels of increasing difficulty. Complete them all to become a Puzzle Master!
                A report will be generated after each level to track your progress.
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

  const getGridTemplateColumns = () => {
    if (stage === 'mild') return `repeat(2, ${imageDimensions.width}px)`;
    if (stage === 'moderate') return 'repeat(3, 160px)';
    if (stage === 'severe') {
      return level <= 5 ? 'repeat(3, 160px)' : 'repeat(4, 160px)';
    }
    return 'repeat(3, 160px)';
  };

  const getMaxWidth = () => {
    if (stage === 'mild') return `${imageDimensions.width * 2 + 5}px`;
    if (stage === 'moderate') return '480px';
    if (stage === 'severe') {
      return level <= 5 ? '480px' : '640px';
    }
    return '480px';
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let collectionName;
        switch(stage) {
          case 'mild': collectionName = "puzzlelevelsmild"; break;
          case 'moderate': collectionName = "puzzlelevelsmoderate"; break;
          case 'severe': collectionName = "puzzlelevelssevere"; break;
          default: throw new Error("Invalid stage selected");
        }
        
        const docRef = doc(db, collectionName, `level${level}`);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error(`Document not found: ${collectionName}/level${level}`);
        }

        const data = docSnap.data();
        
        if (!data.pieces || !Array.isArray(data.pieces)) {
          throw new Error("Invalid data format: pieces array missing");
        }

        let orderedPieces = [];
        const pieces = data.pieces.filter(url => typeof url === 'string' && url.trim() !== '');
        
        if (stage === 'mild') {
          if (pieces.length !== 4) {
            throw new Error(`Expected 4 pieces for mild level, got ${pieces.length}`);
          }
          orderedPieces = [
            pieces[0], // 00 (top-left)
            pieces[2], // 01 (bottom-left)
            pieces[1], // 10 (top-right)
            pieces[3]  // 11 (bottom-right)
          ];
        } 
        else if (stage === 'moderate') {
          if (pieces.length !== 9) {
            throw new Error(`Expected 9 pieces for moderate level, got ${pieces.length}`);
          }
          
          if (level === 1) {
            // For level 1, keep the original vertical arrangement
            const gridSize = 3;
            orderedPieces = [];
            for (let col = 0; col < gridSize; col++) {
              for (let row = 0; row < gridSize; row++) {
                orderedPieces.push(pieces[row * gridSize + col]);
              }
            }
          } else {
            // For levels 2-10, use the new horizontal arrangement (9,8,7,6,5,4,3,2,1)
            orderedPieces = [
              pieces[8], pieces[7], pieces[6], // First row (9,8,7)
              pieces[5], pieces[4], pieces[3], // Second row (6,5,4)
              pieces[2], pieces[1], pieces[0]  // Third row (3,2,1)
            ];
          }
        } 
        else if (stage === 'severe') {
          if (level <= 5) {
            if (pieces.length !== 9) {
              throw new Error(`Expected 9 pieces for severe levels 1-5, got ${pieces.length}`);
            }
            const gridSize = 3;
            orderedPieces = [];
            for (let col = 0; col < gridSize; col++) {
              for (let row = 0; row < gridSize; row++) {
                orderedPieces.push(pieces[row * gridSize + col]);
              }
            }
          } else {
            if (pieces.length !== 16) {
              throw new Error(`Expected 16 pieces for severe levels 6-10, got ${pieces.length}`);
            }
            const gridSize = 4;
            orderedPieces = [];
            for (let col = 0; col < gridSize; col++) {
              for (let row = 0; row < gridSize; row++) {
                orderedPieces.push(pieces[row * gridSize + col]);
              }
            }
          }
        }

        setImages(orderedPieces);
        setShuffledImages(orderedPieces);
        setDragEnabled(false);
        setLevelCompleted(false);
        setTimeUp(false);
        
      } catch (err) {
        console.error("Error in fetchImages:", err);
        setError(err.message);
        const placeholderCount = stage === 'mild' ? 4 : 
                              (stage === 'severe' && level > 5) ? 16 : 9;
        const placeholders = Array(placeholderCount).fill().map((_, i) => 
          `https://via.placeholder.com/160?text=Piece${i+1}`
        );
        setImages(placeholders);
        setShuffledImages(placeholders);
      } finally {
        setLoading(false);
      }
    };

    if (gameStarted && stage) {
      fetchImages();
    }
  }, [level, gameStarted, stage]);

  useEffect(() => {
    let countdown;
    if (dragEnabled && timer <= 60 && !levelCompleted && !showTutorial && !showNextButton) {
      countdown = setTimeout(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer, dragEnabled, levelCompleted, showTutorial, showNextButton]);

  const renderPuzzleBoard = () => {
    if (loading) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading puzzle pieces...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          background: '#ffebee',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#e74c3c' }}>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {!dragEnabled && (
          <div>
            <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
              Click "Shuffle and Start" to begin rearranging the pieces
            </p>
            <button
              onClick={shuffleImages}
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
                fontWeight: 'bold',
                marginBottom: '20px'
              }}
            >
              <GiCardRandom /> Shuffle and Start
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: getGridTemplateColumns(),
            gap: "5px",
            justifyContent: "center",
            margin: "0 auto",
            maxWidth: getMaxWidth()
          }}
        >
          {shuffledImages.map((img, index) => {
            const specialLevels = [1, 3, 6, 7, 8, 10];
            const isSpecialLevel = stage === 'mild' && specialLevels.includes(level);
            const isLeftPiece = index === 0 || index === 2;
            const isRightPiece = index === 1 || index === 3;
            
            return (
              <div
                key={index}
                onDrop={(e) => handleDrop(e, index)}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  width: `${imageDimensions.width}px`,
                  height: `${imageDimensions.height}px`,
                  overflow: "hidden",
                  cursor: dragEnabled && timer <= 60 ? "move" : "not-allowed",
                  margin: isSpecialLevel ? '0' : 'auto',
                  marginTop: isSpecialLevel && (index === 2 || index === 3) ? '-48px' : '0'
                }}
              >
                <img
                  src={img}
                  alt={`Puzzle Piece ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: isSpecialLevel ? "contain" : "cover",
                    opacity: timer > 60 && !levelCompleted ? 0.7 : 1,
                    objectPosition: isSpecialLevel ? 
                      (isLeftPiece ? "left center" : isRightPiece ? "right center" : "center") : "center"
                  }}
                  draggable={dragEnabled && timer <= 60}
                  onDragStart={() => handleDragStart(index)}
                  onLoad={(e) => {
                    const img = e.target;
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    
                    if (stage === 'mild') {
                      if (aspectRatio < 1) {
                        // Portrait image - taller container
                        setImageDimensions({ width: 160, height: 200 });
                      } else if (aspectRatio > 1) {
                        // Landscape image - wider container
                        setImageDimensions({ width: 200, height: 160 });
                      } else {
                        // Square image
                        setImageDimensions({ width: 160, height: 160 });
                      }
                    }
                  }}
                  onError={(e) => {
                    console.error("Failed to load image:", img);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/160?text=Missing+Image';
                  }}
                />
              </div>
            );
          })}
        </div>
      </>
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
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={goBack}
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
              <FaBrain /> Welcome to Puzzle Game
            </h1>
            <p style={{ fontSize: "1.2rem", fontStyle: "italic", marginBottom: "40px", color: "#7f8c8d" }}>
              "Challenge your mind and solve the puzzles!"
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '30px', 
              flexWrap: 'wrap' 
            }}>
              <div 
                onClick={() => startGame('mild')}
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
                <p style={{ color: '#34495e' }}>2×2 grid - Perfect for beginners</p>
                <div style={{ marginTop: '20px', color: '#16a085', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Start with 4 pieces
                </div>
              </div>
              
              <div 
                onClick={() => startGame('moderate')}
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
                <p style={{ color: '#34495e' }}>3×3 grid - For experienced players</p>
                <div style={{ marginTop: '20px', color: '#f39c12', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> 9 pieces to arrange
                </div>
              </div>
              
              <div 
                onClick={() => startGame('severe')}
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
                <p style={{ color: '#34495e' }}>3×3 to 4×4 - Expert challenge</p>
                <div style={{ marginTop: '20px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Up to 16 pieces
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px" }}>
            {!allLevelsCompleted ? (
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
                      background: stage === 'mild' ? '#a1c4fd' : 
                                  stage === 'moderate' ? '#ffecd2' : '#ff9a9e',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {stage === 'mild' ? 'Mild' : stage === 'moderate' ? 'Moderate' : 'Severe'} Puzzle
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaUndo style={{ color: '#e67e22', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>Moves: {moves}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>Attempts: {attempts}</span>
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
                  Level {level} of 10
                </h2>

                <div style={{ 
                  background: '#ffffff',
                  padding: '25px',
                  borderRadius: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  marginBottom: '25px'
                }}>
                  {renderPuzzleBoard()}
                </div>

                {timer > 60 && !levelCompleted && (
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
                      onClick={retryLevel}
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
                    <p style={{ color: "#27ae60", fontSize: "1.2rem", fontWeight: 'bold', marginBottom: '10px' }}>
                      ✅ Level Complete! 🎉 {attempts === 1 ? `You earned ${calculatePoints(timer)} points!` : "No points earned in retry."}
                    </p>
                    <p style={{ marginBottom: '15px' }}>
                      Moves: {moves} | Attempts: {attempts} | Time: {timer}s
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
                    onClick={exitGame}
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
                  You have completed all 10 levels of the {stage === 'mild' ? 'Mild' : stage === 'moderate' ? 'Moderate' : 'Severe'} Puzzle Game!
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
                    {rewardPoints >= 90 ? "Amazing! You're a puzzle master!" :
                     rewardPoints >= 70 ? "Great job! You're really good at this!" :
                     rewardPoints >= 50 ? "Good work! Keep practicing to improve!" :
                     "Nice try! Practice makes perfect!"}
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
                  <FaHome /> Back to Menu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame;