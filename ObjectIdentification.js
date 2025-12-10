import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaLightbulb, FaClock, FaStar, FaUndo, FaHome, FaSignOutAlt, FaTimes, FaChartBar, FaArrowLeft, FaQuestion } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const stages = {
  mild: [
    {
      question: "I brighten up the night, but I'm not the moon. I stand still, yet I help people see. I wear a shade but I'm not a hat. What am I?",
      hints: [
        "I usually stand on a desk or beside a bed.",
        "I need electricity to work.",
        "You can turn me on and off with a switch."
      ],
      answer: "lamp"
    },
    {
      question: "I have hands but no arms, a face but no eyes. I tell time but I don't speak. What am I?",
      hints: [
        "I'm often found on walls or wrists.",
        "I have numbers or marks to show hours.",
        "My hands move in a circular motion."
      ],
      answer: "clock"
    },
    {
      question: "I'm full of holes but still hold water. What am I?",
      hints: [
        "You might use me in the kitchen.",
        "I'm often made of metal or plastic.",
        "You can drain pasta with me."
      ],
      answer: "sponge"
    },
    {
      question: "The more you take, the more you leave behind. What am I?",
      hints: [
        "You make them when you walk.",
        "They're often associated with detectives.",
        "They can be found in snow or sand."
      ],
      answer: "footsteps"
    },
    {
      question: "I'm light as a feather, yet the strongest person can't hold me for more than a few minutes. What am I?",
      hints: [
        "It's something you do with your lungs.",
        "It's essential for life.",
        "You can see it on cold days."
      ],
      answer: "breath"
    },
    {
      question: "I'm not alive, but I can grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
      hints: [
        "You can find me in your pocket.",
        "I'm often made of paper.",
        "People trade me for goods and services."
      ],
      answer: "fire"
    },
    {
      question: "I'm always in front of you but can't be seen. What am I?",
      hints: [
        "It's a concept, not a physical object.",
        "It keeps moving forward.",
        "You can't get it back once it's gone."
      ],
      answer: "future"
    },
    {
      question: "What has keys but can't open locks?",
      hints: [
        "You use it every day to communicate",
        "It has letters and numbers",
        "It's part of a computer"
      ],
      answer: "keyboard"
    },
    {
      question: "What gets wetter as it dries?",
      hints: [
        "You use it in the bathroom.",
        "It's often made of fabric.",
        "You dry your hands with it."
      ],
      answer: "towel"
    },
    {
      question: "What has a head, a tail, but no body?",
      hints: [
        "It's not a living thing.",
        "You can flip it.",
        "It's often made of metal."
      ],
      answer: "coin"
    }
  ],
  moderate: [
    {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      hints: [
        "You might find me in a cave.",
        "I repeat what you say.",
        "I'm created by sound waves bouncing."
      ],
      answer: "echo"
    },
    {
      question: "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
      hints: [
        "You might consult me when traveling.",
        "I represent geographical features.",
        "I'm often folded for storage."
      ],
      answer: "map"
    },
    {
      question: "What can travel around the world while staying in a corner?",
      hints: [
        "It's often rectangular.",
        "You can lick it.",
        "It's usually sent by mail."
      ],
      answer: "stamp"
    },
    {
      question: "I'm tall when I'm young and short when I'm old. What am I?",
      hints: [
        "You can light me.",
        "I produce light and heat.",
        "I get consumed as I'm used."
      ],
      answer: "candle"
    },
    {
      question: "What has many needles but doesn't sew?",
      hints: [
        "It changes with seasons.",
        "It's found in nature.",
        "It can be evergreen or deciduous."
      ],
      answer: "pine tree"
    },
    {
      question: "I can fly without wings. I can cry without eyes. Wherever I go, darkness follows me. What am I?",
      hints: [
        "I'm made of water.",
        "I appear in the sky.",
        "I can block the sun."
      ],
      answer: "cloud"
    },
    {
      question: "The person who makes me doesn't need me. The person who buys me doesn't use me. The person who uses me doesn't know it. What am I?",
      hints: [
        "It's related to death.",
        "It's often wooden.",
        "You might find one in a funeral home."
      ],
      answer: "coffin"
    },
    {
      question: "What has a thumb and four fingers but is not alive?",
      hints: [
        "You wear it.",
        "It keeps your hands warm.",
        "It's often made of wool or leather."
      ],
      answer: "glove"
    },
    {
      question: "What can you hold in your right hand but not in your left?",
      hints: [
        "It's part of your body.",
        "You can't shake hands with it.",
        "It's on the opposite side."
      ],
      answer: "left elbow"
    },
    {
      question: "What gets bigger when more is taken away?",
      hints: [
        "It's not a physical object.",
        "It's often dug in the ground.",
        "You might plant flowers around it."
      ],
      answer: "hole"
    }
  ],
  severe: [
    {
      question: "I'm not alive, but I can die. I don't have a mouth, but I can scream. What am I?",
      hints: [
        "I'm often made of rubber.",
        "Children play with me.",
        "I can float in water."
      ],
      answer: "balloon"
    },
    {
      question: "The more you have of me, the less you see. What am I?",
      hints: [
        "It's not a physical object.",
        "It's the opposite of light.",
        "It's what you see when you close your eyes."
      ],
      answer: "darkness"
    },
    {
      question: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
      hints: [
        "It's found in nature.",
        "It's a body of water.",
        "It flows towards the sea."
      ],
      answer: "river"
    },
    {
      question: "I have branches but no fruit, trunk or leaves. What am I?",
      hints: [
        "It's not a tree.",
        "It's related to money.",
        "You might have an account with one."
      ],
      answer: "bank"
    },
    {
      question: "What goes through cities and fields but never moves?",
      hints: [
        "It can be straight or curved.",
        "It's often made of asphalt or concrete.",
        "You can drive on it."
      ],
      answer: "road"
    },
    {
      question: "I'm always hungry, I must always be fed. The finger I touch will soon turn red. What am I?",
      hints: [
        "It's dangerous if uncontrolled.",
        "It produces heat and light.",
        "You might cook with it."
      ],
      answer: "fire"
    },
    {
      question: "What has words but never speaks?",
      hints: [
        "You can read it.",
        "It has pages.",
        "It might be on a shelf."
      ],
      answer: "book"
    },
    {
      question: "I'm not alive, but I can grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
      hints: [
        "It's a chemical reaction.",
        "It produces heat and light.",
        "You can start one with a match."
      ],
      answer: "fire"
    },
    {
      question: "What has a neck but no head?",
      hints: [
        "You can drink from it.",
        "It often holds liquids.",
        "It might be made of glass."
      ],
      answer: "bottle"
    },
    {
      question: "What can you break without touching it?",
      hints: [
        "It's not a physical object.",
        "You might do it unintentionally.",
        "It's something you can keep or give."
      ],
      answer: "promise"
    }
  ]
};

const demoQuestion = {
  question: "I have keys but no locks. I have space but no room. You can enter but can't go outside. What am I?",
  hints: [
    "You use it every day to communicate",
    "It has letters and numbers arranged in rows",
    "It's part of your computer or phone"
  ],
  answer: "keyboard"
};

const Objectidentification = () => {
  const [gameStage, setGameStage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [timer, setTimer] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [retryUsed, setRetryUsed] = useState(false);
  const [showReportButton, setShowReportButton] = useState(false);
  const [answerDisabled, setAnswerDisabled] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (gameStarted && !isCorrect && timer > 0 && !showTutorial) {
      countdown = setTimeout(() => {
        setTimer(prev => prev - 1);
        setTimeTaken(prev => prev + 1);
      }, 1000);
    }
    if (timer === 0) {
      setAttempted(true);
      setAnswerDisabled(true);
    }
    return () => clearTimeout(countdown);
  }, [timer, gameStarted, isCorrect, showTutorial]);

  const startStage = (stage) => {
    setGameStage(stage);
    setGameStarted(true);
    setShowTutorial(false);
    setCurrentLevel(0);
    setTimer(60 - (stage === 'mild' ? 0 : stage === 'moderate' ? 10 : 20));
    setTimeTaken(0);
    setHintsUsed(0);
    setRetryUsed(false);
    setAnswerDisabled(false);
    setShowReportButton(true);
  };

  const handleSubmit = () => {
    const correctAnswer = showTutorial
      ? demoQuestion.answer.toLowerCase()
      : stages[gameStage][currentLevel].answer.toLowerCase();
   
    setAttempted(true);
    setAnswerDisabled(true);
    
    if (userAnswer.trim().toLowerCase() === correctAnswer) {
      setIsCorrect(true);
      if (!retryUsed) {
        const pointsEarned = calculatePoints() - hintsUsed;
        setRewardPoints(prev => prev + pointsEarned);
        saveReport(pointsEarned);
      } else {
        saveReport(0);
      }
    } else {
      saveReport(0);
    }
  };

  const calculatePoints = () => {
    if (timeTaken <= 10) return 10;
    if (timeTaken <= 15) return 9;
    if (timeTaken <= 20) return 8;
    if (timeTaken <= 25) return 7;
    if (timeTaken <= 30) return 6;
    if (timeTaken <= 35) return 5;
    if (timeTaken <= 40) return 4;
    if (timeTaken <= 45) return 3;
    if (timeTaken <= 50) return 2;
    if (timeTaken <= 55) return 1;
    return 0;
  };

  const saveReport = async (pointsEarned) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const reportData = {
        stage: gameStage,
        level: currentLevel + 1,
        question: stages[gameStage][currentLevel].question,
        pointsEarned: pointsEarned,
        timeTaken: timeTaken,
        hintsUsed: hintsUsed,
        retryUsed: retryUsed,
        timestamp: new Date()
      };

      const userReportRef = doc(db, "objectidentificationreport", user.uid);
      await setDoc(userReportRef, {
        levels: arrayUnion(reportData),
        totalLevelsCompleted: isCorrect ? currentLevel + 1 : currentLevel,
        totalPoints: rewardPoints + pointsEarned
      }, { merge: true });
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    setUserAnswer("");
    setIsCorrect(false);
    setAttempted(false);
    setTimer(60 - (gameStage === 'mild' ? 0 : gameStage === 'moderate' ? 10 : 20));
    setTimeTaken(0);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentHint("");
    setRetryUsed(false);
    setAnswerDisabled(false);
    setShowReportButton(true);
  };

  const handleRetry = () => {
    setUserAnswer("");
    setIsCorrect(false);
    setAttempted(false);
    setTimer(60 - (gameStage === 'mild' ? 0 : gameStage === 'moderate' ? 10 : 20));
    setTimeTaken(0);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentHint("");
    setRetryUsed(true);
    setAnswerDisabled(false);
  };

  const handleRestartGame = () => {
    setGameStarted(false);
    setGameStage("");
    setCurrentLevel(0);
    setUserAnswer("");
    setIsCorrect(false);
    setAttempted(false);
    setRewardPoints(0);
    setTimer(60);
    setTimeTaken(0);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentHint("");
    setRetryUsed(false);
    setAnswerDisabled(false);
    setShowReportButton(false);
  };

  const handleExitGame = () => {
    setGameStarted(false);
    setGameStage("");
    setCurrentLevel(0);
    setUserAnswer("");
    setIsCorrect(false);
    setAttempted(false);
    setRewardPoints(0);
    setTimer(60);
    setTimeTaken(0);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentHint("");
    setRetryUsed(false);
    setAnswerDisabled(false);
    setShowReportButton(false);
  };

  const revealHint = () => {
    if (hintsUsed < 3) {
      const nextHint = showTutorial
        ? demoQuestion.hints[hintsUsed]
        : stages[gameStage][currentLevel].hints[hintsUsed];
      setCurrentHint(nextHint);
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
    }
  };

  const nextTutorialStep = () => {
    if (tutorialStep === 3 && hintsUsed < 3) {
      revealHint();
      if (hintsUsed === 2) {
        setTimeout(() => setTutorialStep(4), 1500);
      }
    } else {
      setTutorialStep(prev => prev + 1);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const startGameAfterTutorial = () => {
    setShowTutorial(false);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentHint("");
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const viewReport = () => {
    navigate('/report');
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
            onClick={closeTutorial}
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
            How to Play Object Identification
          </h2>
         
          {tutorialStep === 0 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Welcome to the Object Identification game! In this game, you'll solve riddles to identify objects.
                Let's walk through how the game works.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                position: 'relative',
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  ❓ {demoQuestion.question}
                </p>
              </div>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                This is the riddle you need to solve. Read it carefully and think about what object it might be describing.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
              <input
                type="text"
                style={{
                  padding: '12px 15px',
                  fontSize: '1rem',
                  width: '100%',
                  border: '2px solid #3498db',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  boxShadow: '0 0 10px rgba(52, 152, 219, 0.5)'
                }}
                placeholder="Enter your answer"
                readOnly
              />
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                Type your answer in this box. Try to guess what object the riddle is describing.
                The answer should be a single word (like "clock" or "keyboard").
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
              <button
                style={{
                  padding: '12px 25px',
                  fontSize: '1rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(52, 152, 219, 0.5)',
                  margin: '0 auto 20px'
                }}
              >
                <FaLightbulb /> Hint (3 left)
              </button>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                If you're stuck, you can click the Hint button for help. You get 3 hints per question,
                but each hint used will reduce your possible points by 1.
              </p>
              {showHint && (
                <div style={{
                  background: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <p style={{
                    fontSize: "1.1rem",
                    color: '#0d47a1',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FaLightbulb style={{ marginRight: '10px', flexShrink: 0 }} />
                    <span>💡 Hint {hintsUsed}: {currentHint}</span>
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
                The timer shows how much time you have left to answer. Points are awarded based on how quickly you answer:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li>≤10 seconds: 10 points</li>
                <li>≤15 seconds: 9 points</li>
                <li>≤20 seconds: 8 points</li>
                <li>...and so on, with 1 point for ≤55 seconds</li>
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
         
          {tutorialStep === 5 && (
            <div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginBottom: '20px' }}>
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
                Use the Exit button to leave the game or the Retry button to try the same question again.
                Note: You won't earn points if you use Retry.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
         
          {tutorialStep === 6 && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Ready to start the game?
              </p>
              <p style={{ marginBottom: '30px' }}>
                You'll choose from three difficulty levels: Mild, Moderate, and Severe.
                Each has 10 questions with increasing difficulty.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
                  onClick={startGameAfterTutorial}
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
      {/* Back Button */}
      <button
        onClick={() => navigate('/brain-games')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#3498db',
          border: 'none',
          color: 'white',
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
     
      {showTutorial && renderTutorial()}
     
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {!gameStarted && !gameStage && !showTutorial ? (
          <div style={{ textAlign: "center", padding: "30px", position: 'relative' }}>
            {/* Help Button */}
            <button
              onClick={() => setShowTutorial(true)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <FaQuestion /> Help
            </button>
           
            <h1 style={{ fontSize: "2.5rem", color: "#2c3e50", marginBottom: "20px" }}>
              Welcome to Object Identification Game
            </h1>
            <p style={{ fontSize: "1.2rem", fontStyle: "italic", marginBottom: "40px", color: "#7f8c8d" }}>
              "Sharpen your mind and have fun identifying objects!"
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
                <p style={{ color: '#34495e' }}>Beginner level with easier questions and more time</p>
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
                <p style={{ color: '#34495e' }}>Intermediate level with moderate difficulty</p>
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
                <p style={{ color: '#34495e' }}>Expert level with challenging questions</p>
                <div style={{ marginTop: '20px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> Only for the bravest
                </div>
              </div>
            </div>
          </div>
        ) : gameStarted ? (
          <div style={{ textAlign: "center", padding: "30px" }}>
            {currentLevel < stages[gameStage].length ? (
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
                      background: gameStage === 'mild' ? '#a1c4fd' :
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
                  Level {currentLevel + 1} of {stages[gameStage].length}
                </h2>

                <div style={{
                  background: '#ffffff',
                  padding: '25px',
                  borderRadius: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  marginBottom: '25px'
                }}>
                  <p style={{
                    fontSize: "1.3rem",
                    marginBottom: "20px",
                    fontWeight: '500',
                    color: '#34495e'
                  }}>
                    ❓ {stages[gameStage][currentLevel].question}
                  </p>

                  {showHint && (
                    <div style={{
                      background: '#e3f2fd',
                      padding: '15px',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      textAlign: 'left',
                      animation: 'fadeIn 0.5s'
                    }}>
                      <p style={{
                        fontSize: "1.1rem",
                        color: '#0d47a1',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FaLightbulb style={{ marginRight: '10px', flexShrink: 0 }} />
                        <span>💡 Hint {hintsUsed}: {currentHint}</span>
                      </p>
                    </div>
                  )}

                  {!isCorrect ? (
                    <div>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        disabled={answerDisabled}
                        style={{
                          padding: "12px 15px",
                          fontSize: "1rem",
                          marginRight: "10px",
                          width: '60%',
                          border: '2px solid #dfe6e9',
                          borderRadius: '8px',
                          outline: 'none',
                          transition: 'border 0.3s',
                          backgroundColor: answerDisabled ? '#f5f5f5' : 'white',
                          ':focus': {
                            borderColor: '#3498db'
                          }
                        }}
                      />
                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button
                          onClick={handleSubmit}
                          disabled={answerDisabled}
                          style={{
                            padding: "12px 25px",
                            fontSize: "1rem",
                            backgroundColor: answerDisabled ? "#95a5a6" : "#2ecc71",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: answerDisabled ? "not-allowed" : "pointer",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            boxShadow: answerDisabled ? 'none' : '0 3px 6px rgba(46, 204, 113, 0.2)'
                          }}
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={revealHint}
                          disabled={hintsUsed >= 3 || answerDisabled}
                          style={{
                            padding: "12px 25px",
                            fontSize: "1rem",
                            backgroundColor: hintsUsed >= 3 || answerDisabled ? "#95a5a6" : "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: hintsUsed >= 3 || answerDisabled ? "not-allowed" : "pointer",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            boxShadow: hintsUsed >= 3 || answerDisabled ? 'none' : '0 3px 6px rgba(52, 152, 219, 0.2)'
                          }}
                        >
                          <FaLightbulb />
                          {hintsUsed >= 3 ? "No More Hints" : `Hint (${3 - hintsUsed} left)`}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {attempted && !isCorrect && (
                  <div style={{
                    background: '#ffebee',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ color: "#e74c3c", fontSize: "1.1rem", marginBottom: '15px' }}>
                      {timer === 0 ? "⏰ Time's up!" : "❌ Incorrect answer!"} Please try again.
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

                {isCorrect && (
                  <div style={{
                    background: '#e8f5e9',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ color: "#27ae60", fontSize: "1.2rem", fontWeight: 'bold', marginBottom: '10px' }}>
                      ✅ Correct Answer! 🎉 {!retryUsed ? `You earned ${calculatePoints() - hintsUsed} points!` : "No points earned in retry."}
                    </p>
                    {!retryUsed && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: "#16a085", margin: '5px 0' }}>
                          Time taken: {timeTaken} seconds ({calculatePoints()} points)
                        </p>
                        {hintsUsed > 0 && (
                          <p style={{ color: "#f39c12", margin: '5px 0' }}>
                            Hints used: {hintsUsed} (-{hintsUsed} points)
                          </p>
                        )}
                      </div>
                    )}
                    {currentLevel === stages[gameStage].length - 1 ? (
                      <button
                        onClick={handleRestartGame}
                        style={{
                          marginTop: "10px",
                          padding: "12px 25px",
                          fontSize: "1rem",
                          backgroundColor: "#9b59b6",
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
                    ) : (
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
                    )}
                  </div>
                )}

                <div style={{ marginTop: "20px", display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  {showReportButton && (
                    <button
                      onClick={viewReport}
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
                      <FaChartBar /> View Report
                    </button>
                  )}
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
                    {rewardPoints >= 90 ? "Amazing! You're a puzzle master!" :
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
        ) : null}
      </div>
    </div>
  );
};

export default Objectidentification;