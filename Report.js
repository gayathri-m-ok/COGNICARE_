import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FaArrowLeft } from 'react-icons/fa';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDE3Nph5Jprx6x2bHu3j_oxIg3InsnaVus",
  authDomain: "cognicare-4d301.firebaseapp.com",
  projectId: "cognicare-4d301",
  storageBucket: "cognicare-4d301.appspot.com",
  messagingSenderId: "1043867369648",
  appId: "1:1043867369648:web:aaade00d5cefb1009e3b75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Medical-grade severity classification thresholds
const SEVERITY_THRESHOLDS = {
  NORMAL: 80,
  MILD: 60,
  MODERATE: 40,
  SEVERE: 0
};

function Report() {
  const navigate = useNavigate();
  const [storyReport, setStoryReport] = useState(null);
  const [puzzleReport, setPuzzleReport] = useState(null);
  const [memoryReport, setMemoryReport] = useState(null);
  const [objectReport, setObjectReport] = useState(null);
  const [sequenceReport, setSequenceReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyLevelDetails, setStoryLevelDetails] = useState([]);
  const [puzzleLevelDetails, setPuzzleLevelDetails] = useState([]);
  const [memoryLevelDetails, setMemoryLevelDetails] = useState([]);
  const [objectLevelDetails, setObjectLevelDetails] = useState([]);
  const [sequenceLevelDetails, setSequenceLevelDetails] = useState([]);
  const [storyPoints, setStoryPoints] = useState(0);
  const [puzzlePoints, setPuzzlePoints] = useState(0);
  const [memoryPoints, setMemoryPoints] = useState(0);
  const [objectPoints, setObjectPoints] = useState(0);
  const [sequencePoints, setSequencePoints] = useState(0);
  const [activeTab, setActiveTab] = useState('storytelling');
  const [overallAssessment, setOverallAssessment] = useState(null);

  const calculateSeverity = (points) => {
    if (points >= SEVERITY_THRESHOLDS.NORMAL) return 'Normal';
    if (points >= SEVERITY_THRESHOLDS.MILD) return 'Mild';
    if (points >= SEVERITY_THRESHOLDS.MODERATE) return 'Moderate';
    return 'Severe';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Normal': return '#4CAF50';
      case 'Mild': return '#FFC107';
      case 'Moderate': return '#FF9800';
      case 'Severe': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const calculateOverallAssessment = () => {
    const completedTests = [];
    const domainScores = {};
   
    if (storyPoints > 0) {
      completedTests.push(storyPoints);
      domainScores['Storytelling'] = storyPoints;
    }
    if (puzzlePoints > 0) {
      completedTests.push(puzzlePoints);
      domainScores['Puzzle Solving'] = puzzlePoints;
    }
    if (memoryPoints > 0) {
      completedTests.push(memoryPoints);
      domainScores['Memory'] = memoryPoints;
    }
    if (objectPoints > 0) {
      completedTests.push(objectPoints);
      domainScores['Object Identification'] = objectPoints;
    }
    if (sequencePoints > 0) {
      completedTests.push(sequencePoints);
      domainScores['Sequence Recall'] = sequencePoints;
    }

    if (completedTests.length === 0) return null;

    const totalPoints = completedTests.reduce((sum, points) => sum + points, 0);
    const averageScore = totalPoints / completedTests.length;
    const severity = calculateSeverity(averageScore);
   
    let strongestDomain = 'Not enough data';
    let strongestScore = 0;
    let weakestDomain = 'Not enough data';
    let weakestScore = 100;
   
    for (const [domain, score] of Object.entries(domainScores)) {
      if (score > strongestScore) {
        strongestScore = score;
        strongestDomain = domain;
      }
      if (score < weakestScore) {
        weakestScore = score;
        weakestDomain = domain;
      }
    }
   
    return {
      averageScore,
      severity,
      strongestDomain,
      strongestScore,
      weakestDomain,
      weakestScore,
      domainScores,
      completedTestsCount: completedTests.length
    };
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // MODIFIED: Fetch puzzle data - trying multiple document locations
          // Option 1: Check puzzleReports collection
          let puzzleDocRef = doc(db, 'puzzleReports', user.uid);
          let puzzleDocSnap = await getDoc(puzzleDocRef);
         
          // Option 2: If not found, try puzzleReport (singular) collection
          if (!puzzleDocSnap.exists()) {
            puzzleDocRef = doc(db, 'puzzleReport', user.uid);
            puzzleDocSnap = await getDoc(puzzleDocRef);
          }
         
          // Option 3: Check puzzle_report collection
          if (!puzzleDocSnap.exists()) {
            puzzleDocRef = doc(db, 'puzzle_report', user.uid);
            puzzleDocSnap = await getDoc(puzzleDocRef);
          }
         
          // Debug log to help identify issues
          console.log("Puzzle data retrieval attempt:", puzzleDocSnap.exists() ? "Found" : "Not found");
         
          if (puzzleDocSnap.exists()) {
            const puzzleData = puzzleDocSnap.data();
            console.log("Retrieved puzzle data:", puzzleData);
           
            // Set default score if not available
            let totalPoints = puzzleData.score || puzzleData.totalPoints || 0;
            const severity = calculateSeverity(totalPoints);
           
            // Process puzzle levels data with improved handling for various data structures
            const puzzleLevels = [];
            let levelsCompleted = 0;
            let totalTime = 0;
            let totalMoves = 0;
            let totalAttempts = 0;
           
            // Check for different data structures
            if (Array.isArray(puzzleData.levels)) {
              // Array-based levels structure
              puzzleData.levels.forEach((level, index) => {
                if (level && level.completed) {
                  puzzleLevels.push({
                    level: index + 1,
                    timeTaken: level.timeTaken || 0,
                    moves: level.moves || 0,
                    attempts: level.attempts || 0,
                    points: level.points || 0,
                    completed: level.completed,
                    difficulty: level.difficulty || puzzleData.stage || puzzleData.difficulty || 'moderate'
                  });
                 
                  totalTime += level.timeTaken || 0;
                  totalMoves += level.moves || 0;
                  totalAttempts += level.attempts || 0;
                  levelsCompleted++;
                }
              });
            } else {
              // Object-based levels structure
              // First try level1, level2 format
              for (let i = 1; i <= 10; i++) {
                const levelKey = `level${i}`;
                if (puzzleData[levelKey]) {
                  const levelData = puzzleData[levelKey];
                  if (levelData.completed) {
                    puzzleLevels.push({
                      level: i,
                      timeTaken: levelData.timeTaken || 0,
                      moves: levelData.moves || 0,
                      attempts: levelData.attempts || 0,
                      points: levelData.points || 0,
                      completed: levelData.completed,
                      difficulty: levelData.difficulty || puzzleData.stage || puzzleData.difficulty || 'moderate'
                    });
                   
                    totalTime += levelData.timeTaken || 0;
                    totalMoves += levelData.moves || 0;
                    totalAttempts += levelData.attempts || 0;
                    levelsCompleted++;
                  }
                }
              }
             
              // Also try levels.1, levels.2 format
              if (puzzleData.levels && typeof puzzleData.levels === 'object' && !Array.isArray(puzzleData.levels)) {
                Object.keys(puzzleData.levels).forEach(key => {
                  const levelNum = parseInt(key);
                  if (!isNaN(levelNum) && puzzleData.levels[key].completed) {
                    // Skip if we already have this level from the previous format
                    if (!puzzleLevels.some(l => l.level === levelNum)) {
                      const levelData = puzzleData.levels[key];
                      puzzleLevels.push({
                        level: levelNum,
                        timeTaken: levelData.timeTaken || 0,
                        moves: levelData.moves || 0,
                        attempts: levelData.attempts || 0,
                        points: levelData.points || 0,
                        completed: levelData.completed,
                        difficulty: levelData.difficulty || puzzleData.stage || puzzleData.difficulty || 'moderate'
                      });
                     
                      totalTime += levelData.timeTaken || 0;
                      totalMoves += levelData.moves || 0;
                      totalAttempts += levelData.attempts || 0;
                      levelsCompleted++;
                    }
                  }
                });
              }
            }
           
            // Manually calculate total points if not provided or if levels data provides a different total
            if (levelsCompleted > 0 && (!totalPoints || totalPoints === 0)) {
              totalPoints = puzzleLevels.reduce((sum, level) => sum + (level.points || 0), 0);
            }
           
            setPuzzleReport({
              severity,
              totalPoints,
              averageTime: levelsCompleted > 0 ? totalTime / levelsCompleted : 0,
              averageMoves: levelsCompleted > 0 ? totalMoves / levelsCompleted : 0,
              averageAttempts: levelsCompleted > 0 ? totalAttempts / levelsCompleted : 0,
              levelsCompleted,
              difficulty: puzzleData.stage || puzzleData.difficulty || 'moderate',
              finalReport: puzzleData.finalReport || false,
              lastUpdated: puzzleData.lastUpdated || new Date().toISOString()
            });
           
            setPuzzlePoints(totalPoints);
            setPuzzleLevelDetails(puzzleLevels);
           
            console.log("Processed puzzle data:", {
              totalPoints,
              levelsCompleted,
              puzzleLevels: puzzleLevels.length,
              severity: calculateSeverity(totalPoints)
            });
          }

          // Fetch storytelling data
          const storyDocRef = doc(db, 'userStorytellingData', user.uid);
          const storyDocSnap = await getDoc(storyDocRef);
         
          if (storyDocSnap.exists()) {
            const storyData = storyDocSnap.data();
            const totalPoints = storyData.totalPoints || 0;
            const severity = calculateSeverity(totalPoints);
           
            // Process storytelling levels
            const storyLevels = [];
            let totalTime = 0;
            let totalMoves = 0;
            let levelsCompleted = 0;
           
            if (storyData.levels) {
              for (let i = 1; i <= 10; i++) {
                const levelKey = `level${i}`;
                if (storyData.levels[levelKey]) {
                  const levelData = storyData.levels[levelKey];
                  storyLevels.push({
                    level: i,
                    timeTaken: levelData.timeTaken || 0,
                    moves: levelData.movementCount || 0,
                    attempts: levelData.attemptNumber || 1,
                    points: levelData.points || 0
                  });
                 
                  totalTime += levelData.timeTaken || 0;
                  totalMoves += levelData.movementCount || 0;
                  levelsCompleted++;
                }
              }
            }
           
            setStoryReport({
              ...storyData.report,
              severity,
              totalLevelsCompleted: levelsCompleted,
              averageTime: levelsCompleted > 0 ? totalTime / levelsCompleted : 0,
              averageMoves: levelsCompleted > 0 ? totalMoves / levelsCompleted : 0
            });
           
            setStoryPoints(totalPoints);
            setStoryLevelDetails(storyLevels);
          }

          // Fetch memory match data
          const memoryDocRef = doc(db, 'memorymatchreport', user.uid);
          const memoryDocSnap = await getDoc(memoryDocRef);
         
          if (memoryDocSnap.exists()) {
            const memoryData = memoryDocSnap.data();
           
            let totalPoints = 0;
            let totalLevelsCompleted = 0;
            let totalTime = 0;
            let totalFlips = 0;
            let totalAttempts = 0;
            const memoryLevels = [];
           
            for (let i = 1; i <= 10; i++) {
              let bestAttempt = null;
              let attemptNum = 1;
             
              while (true) {
                const attemptKey = `level_${i}_attempt_${attemptNum}`;
                if (memoryData[attemptKey]) {
                  if (!bestAttempt || memoryData[attemptKey].points > bestAttempt.points) {
                    bestAttempt = memoryData[attemptKey];
                  }
                  attemptNum++;
                } else {
                  break;
                }
              }
             
              if (bestAttempt) {
                totalPoints += bestAttempt.points;
                totalLevelsCompleted++;
                totalTime += bestAttempt.timeTaken;
                totalFlips += bestAttempt.moves;
                totalAttempts += bestAttempt.attempts;
               
                memoryLevels.push({
                  level: i,
                  timeTaken: bestAttempt.timeTaken,
                  flips: bestAttempt.moves,
                  attempts: bestAttempt.attempts,
                  points: bestAttempt.points,
                  difficulty: bestAttempt.difficulty,
                  completed: bestAttempt.completed
                });
              }
            }
           
            const severity = calculateSeverity(totalPoints);
            setMemoryReport({
              severity,
              totalLevelsCompleted,
              averageTime: totalLevelsCompleted > 0 ? totalTime / totalLevelsCompleted : 0,
              averageFlips: totalLevelsCompleted > 0 ? totalFlips / totalLevelsCompleted : 0,
              totalPoints
            });
           
            setMemoryPoints(totalPoints);
            setMemoryLevelDetails(memoryLevels);
          }

          // Fetch object identification data
          const objectDocRef = doc(db, 'objectidentificationreport', user.uid);
          const objectDocSnap = await getDoc(objectDocRef);
         
          if (objectDocSnap.exists()) {
            const objectData = objectDocSnap.data();
            const totalPoints = objectData.totalPoints || 0;
            const severity = calculateSeverity(totalPoints);
           
            setObjectReport({
              severity,
              totalLevelsCompleted: objectData.totalLevelsCompleted || 0,
              averageTime: calculateAverageTime(objectData.levels || []),
              averageHintsUsed: calculateAverageHints(objectData.levels || []),
              totalPoints
            });
           
            setObjectPoints(totalPoints);
           
            const objectLevels = [];
            if (objectData.levels) {
              objectData.levels.forEach((level, index) => {
                objectLevels.push({
                  level: index + 1,
                  timeTaken: level.timeTaken,
                  hintsUsed: level.hintsUsed,
                  points: level.pointsEarned,
                  question: level.question
                });
              });
            }
            setObjectLevelDetails(objectLevels);
          }

          // Fetch sequence recall data
          const sequenceDocRef = doc(db, 'sequenceRecallReports', user.uid);
          const sequenceDocSnap = await getDoc(sequenceDocRef);
         
          if (sequenceDocSnap.exists()) {
            const sequenceData = sequenceDocSnap.data();
            const totalPoints = sequenceData.report?.score || 0;
            const severity = calculateSeverity(totalPoints);
           
            let averageDeselects = sequenceData.report?.averageDeselects;
            if (!averageDeselects) {
              let totalDeselects = 0;
              let levelsCount = 0;
              for (let i=1;i<=10;i++) {
                const lvl = sequenceData[`level${i}`];
                if (lvl && typeof lvl.deselects === 'number') {
                  totalDeselects += lvl.deselects;
                  levelsCount++;
                }
              }
              averageDeselects = levelsCount > 0 ? totalDeselects / levelsCount : 0;
            }
           
            // Calculate sequence recall average time from level data
            let totalTime = 0;
            let completedLevels = 0;
           
            for (let i = 1; i <= 10; i++) {
              if (sequenceData[`level${i}`] && typeof sequenceData[`level${i}`].timeTaken === 'number') {
                totalTime += sequenceData[`level${i}`].timeTaken;
                completedLevels++;
              }
            }
           
            const averageTime = completedLevels > 0 ? totalTime / completedLevels : 0;
           
            setSequenceReport({
              ...sequenceData.report,
              severity,
              averageDeselects,
              averageTime,
              totalPoints
            });
           
            setSequencePoints(totalPoints);
           
            const sequenceLevels = [];
            for (let i = 1; i <= 10; i++) {
              if (sequenceData[`level${i}`]) {
                sequenceLevels.push({
                  level: i,
                  timeTaken: sequenceData[`level${i}`].timeTaken,
                  deselects: sequenceData[`level${i}`].deselects,
                  attempts: sequenceData[`level${i}`].attempts,
                  points: sequenceData[`level${i}`].points,
                  difficulty: sequenceData[`level${i}`].difficulty
                });
              }
            }
            setSequenceLevelDetails(sequenceLevels);
          }
        } else {
          setError("User not authenticated. Please log in.");
        }
      } catch (err) {
        setError("Error fetching report: " + err.message);
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  useEffect(() => {
    if (storyPoints > 0 || puzzlePoints > 0 || memoryPoints > 0 || objectPoints > 0 || sequencePoints > 0) {
      setOverallAssessment(calculateOverallAssessment());
    }
  }, [storyPoints, puzzlePoints, memoryPoints, objectPoints, sequencePoints]);

  const calculateAverageTime = (levels) => {
    if (!levels || levels.length === 0) return 0;
    const total = levels.reduce((sum, level) => sum + (level.timeTaken || 0), 0);
    return total / levels.length;
  };

  const calculateAverageHints = (levels) => {
    if (!levels || levels.length === 0) return 0;
    const total = levels.reduce((sum, level) => sum + (level.hintsUsed || 0), 0);
    return total / levels.length;
  };

  const goBack = () => {
    navigate(-1);
  };

  const getSeverityDescription = (severity) => {
    switch (severity) {
      case 'Normal':
        return 'Cognitive performance is within normal expected ranges. No significant impairments detected.';
      case 'Mild':
        return 'Mild cognitive difficulties detected. May indicate early cognitive changes or normal variation. Clinical correlation recommended.';
      case 'Moderate':
        return 'Moderate cognitive impairment detected. Suggests possible cognitive decline. Further clinical evaluation is advised.';
      case 'Severe':
        return 'Severe cognitive impairment detected. Indicates significant cognitive dysfunction. Urgent clinical evaluation recommended.';
      default:
        return 'Assessment data is incomplete. Please complete more levels for a comprehensive evaluation.';
    }
  };

  const getDomainDescription = (domain, score) => {
    if (score === 0) return 'No data available for this domain. Please complete levels to get an assessment.';
   
    const severity = calculateSeverity(score);
   
    switch (domain) {
      case 'Storytelling':
        return `Story Sequencing: ${severity} impairment (${score}/100). ${severity === 'Normal' ?
          'Narrative skills and logical sequencing are intact.' :
          severity === 'Mild' ? 'Mild difficulties with story organization and temporal sequencing.' :
          severity === 'Moderate' ? 'Moderate difficulties with narrative structure and logical flow.' :
          'Severe impairment in organizing and recalling story elements.'}`;
         
      case 'Puzzle Solving':
        return `Visual-Spatial Reasoning: ${severity} impairment (${score}/100). ${severity === 'Normal' ?
          'Spatial reasoning and problem-solving skills are intact.' :
          severity === 'Mild' ? 'Mild difficulties with pattern recognition and spatial manipulation.' :
          severity === 'Moderate' ? 'Moderate difficulties with visual-spatial tasks and problem-solving.' :
          'Severe impairment in visual-spatial reasoning and puzzle-solving.'}`;
         
      case 'Memory':
        return `Memory Recall: ${severity} impairment (${score}/100). ${severity === 'Normal' ?
          'Short-term memory and recall abilities are intact.' :
          severity === 'Mild' ? 'Mild difficulties with memory retention and retrieval.' :
          severity === 'Moderate' ? 'Moderate memory impairment affecting recall accuracy.' :
          'Severe memory impairment with significant retrieval difficulties.'}`;
         
      case 'Object Identification':
        return `Object Recognition: ${severity} impairment (${score}/100). ${severity === 'Normal' ?
          'Semantic knowledge and object identification are intact.' :
          severity === 'Mild' ? 'Mild difficulties with semantic access and object categorization.' :
          severity === 'Moderate' ? 'Moderate impairment in object recognition and naming.' :
          'Severe semantic impairment affecting object identification.'}`;
         
      case 'Sequence Recall':
        return `Working Memory: ${severity} impairment (${score}/100). ${severity === 'Normal' ?
          'Working memory and sequencing abilities are intact.' :
          severity === 'Mild' ? 'Mild difficulties with maintaining and manipulating information.' :
          severity === 'Moderate' ? 'Moderate working memory impairment affecting sequencing.' :
          'Severe working memory deficits impacting sequential tasks.'}`;
         
      default:
        return '';
    }
  };

  const getGeneralRecommendations = (severity) => {
    const baseRecommendations = [
      "Regular cognitive exercises targeting multiple domains",
      "Maintain a healthy lifestyle with proper nutrition and exercise",
      "Engage in social activities and mental stimulation"
    ];

    const severitySpecific = {
      'Normal': [
        "Continue cognitive activities to maintain skills",
        "Challenge yourself with new learning opportunities",
        "Monitor cognitive health annually"
      ],
      'Mild': [
        "Begin targeted cognitive training program",
        "Consider baseline neuropsychological evaluation",
        "Monitor for changes over 3-6 months"
      ],
      'Moderate': [
        "Seek comprehensive neuropsychological assessment",
        "Consider cognitive rehabilitation therapy",
        "Medical evaluation to rule out reversible causes"
      ],
      'Severe': [
        "Urgent medical and neurological evaluation",
        "Comprehensive dementia workup recommended",
        "Consider caregiver support and safety planning"
      ]
    };

    return [...baseRecommendations, ...(severitySpecific[severity] || [])];
  };

  const getPuzzleSpecificRecommendations = (severity, difficulty, averageTime, averageMoves) => {
    let recommendations = [];
   
    // General puzzle recommendations
    recommendations.push("Practice spatial reasoning with jigsaw puzzles and pattern recognition games");
    recommendations.push("Work on visual-spatial tasks like mental rotation exercises");
   
    // Difficulty-specific recommendations
    if (difficulty === 'mild') {
      recommendations.push("Progress to moderate difficulty puzzles to challenge your skills");
    } else if (difficulty === 'moderate') {
      recommendations.push("Try timed puzzles to improve processing speed");
    } else if (difficulty === 'severe') {
      recommendations.push("Break down complex puzzles into smaller sections for better management");
    }
   
    // Performance-based recommendations
    if (averageTime > 30) {
      recommendations.push("Work on timed puzzles to improve speed of visual processing");
    }
   
    if (averageMoves > 20) {
      recommendations.push("Practice planning moves ahead to reduce unnecessary tile movements");
    }
   
    // Severity-specific recommendations
    if (severity === 'Mild') {
      recommendations.push("Try more complex puzzles with irregular shapes to challenge spatial reasoning");
    } else if (severity === 'Moderate') {
      recommendations.push("Focus on basic puzzle strategies before attempting more complex ones");
    } else if (severity === 'Severe') {
      recommendations.push("Start with simple shape matching before attempting full puzzles");
    }
   
    return recommendations;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!overallAssessment || overallAssessment.completedTestsCount === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No report data available. Please complete some levels first.</p>
      </div>
    );
  }

  const currentReport = activeTab === 'storytelling' ? storyReport :
                      activeTab === 'puzzle' ? puzzleReport :
                      activeTab === 'memory' ? memoryReport :
                      activeTab === 'object' ? objectReport :
                      sequenceReport;
                     
  const currentLevelDetails = activeTab === 'storytelling' ? storyLevelDetails :
                            activeTab === 'puzzle' ? puzzleLevelDetails :
                            activeTab === 'memory' ? memoryLevelDetails :
                            activeTab === 'object' ? objectLevelDetails :
                            sequenceLevelDetails;
                           
  const currentPoints = activeTab === 'storytelling' ? storyPoints :
                       activeTab === 'puzzle' ? puzzlePoints :
                       activeTab === 'memory' ? memoryPoints :
                       activeTab === 'object' ? objectPoints :
                       sequencePoints;

  return (
    <div style={{ padding: '40px', background: 'linear-gradient(to bottom right, #f5f5f5, #ffffff)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <button
            onClick={goBack}
            style={{
              backgroundColor: '#1565C0',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 style={{ color: '#333', margin: 0 }}>Cognitive Assessment Report</h1>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* Warning Box */}
        <div style={{
          backgroundColor: '#FFF9C4',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '30px',
          borderLeft: '5px solid #FFD600'
        }}>
          <h3 style={{ marginTop: 0, color: '#795548' }}>Important Notice</h3>
          <p style={{ marginBottom: 0 }}>
            <strong>Please complete game stages in order (Mild → Moderate → Severe)</strong> for accurate reporting.
            The system only considers your latest stage played. Complete the Mild stage first,
            use the report to improve your skills, and only progress to Moderate when your score
            consistently exceeds 60/100. Jumping between stages may result in incomplete assessments.
          </p>
        </div>

        {overallAssessment && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #1565C0', paddingBottom: '10px' }}>Comprehensive Cognitive Evaluation</h2>
           
            <div style={{
              backgroundColor: getSeverityColor(overallAssessment.severity),
              padding: '20px',
              borderRadius: '8px',
              color: 'white',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Overall Cognitive Status: {overallAssessment.severity}</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Average Score: {overallAssessment.averageScore.toFixed(1)}/100</div>
              <p style={{ marginTop: '10px', fontSize: '16px' }}>
                {getSeverityDescription(overallAssessment.severity)}
              </p>
            </div>
           
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ color: '#1565C0', marginTop: '0' }}>Domain Strengths</h4>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{overallAssessment.strongestDomain}</div>
                  <div>Score: {overallAssessment.strongestScore.toFixed(1)}/100</div>
                  <div style={{
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    <div style={{
                      width: `${overallAssessment.strongestScore}%`,
                      height: '100%',
                      backgroundColor: getSeverityColor(calculateSeverity(overallAssessment.strongestScore)),
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
             
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ color: '#1565C0', marginTop: '0' }}>Areas for Improvement</h4>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{overallAssessment.weakestDomain}</div>
                  <div>Score: {overallAssessment.weakestScore.toFixed(1)}/100</div>
                  <div style={{
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    <div style={{
                      width: `${overallAssessment.weakestScore}%`,
                      height: '100%',
                      backgroundColor: getSeverityColor(calculateSeverity(overallAssessment.weakestScore)),
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
           
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#333' }}>Domain Analysis</h3>
             
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(overallAssessment.domainScores).map(([domain, score]) => ({
                    domain,
                    score,
                    color: getSeverityColor(calculateSeverity(score))
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" angle={-45} textAnchor="end" height={70} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)}/100`, 'Score']}
                    labelFormatter={(label) => `Domain: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="score" name="Domain Score" fill="#8884d8" radius={[5, 5, 0, 0]}>
                    {Object.entries(overallAssessment.domainScores).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSeverityColor(calculateSeverity(entry[1]))} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
           
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#333' }}>Domain Insights</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {Object.entries(overallAssessment.domainScores).map(([domain, score]) => (
                  <div key={domain} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    borderLeft: `5px solid ${getSeverityColor(calculateSeverity(score))}`
                  }}>
                    <h4 style={{ color: '#333', marginTop: '0' }}>{domain}</h4>
                    <p>{getDomainDescription(domain, score)}</p>
                  </div>
                ))}
              </div>
            </div>
           
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#333' }}>Professional Recommendations</h3>
              <p style={{ fontStyle: 'italic', color: '#666' }}>
                Note: These recommendations are algorithmic and not a substitute for professional medical advice.
                Please consult with a healthcare provider about these results.
              </p>
             
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginTop: '15px' }}>
                <h4 style={{ color: '#1565C0', marginTop: '0' }}>General Recommendations</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  {getGeneralRecommendations(overallAssessment.severity).map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#333', borderBottom: '2px solid #1565C0', paddingBottom: '10px' }}>Individual Domain Reports</h2>
         
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('storytelling')}
              style={{
                padding: '10px 15px',
                backgroundColor: activeTab === 'storytelling' ? '#1565C0' : 'transparent',
                color: activeTab === 'storytelling' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'storytelling' ? '3px solid #1565C0' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={!storyReport}
            >
              Storytelling
            </button>
            <button
              onClick={() => setActiveTab('puzzle')}
              style={{
                padding: '10px 15px',
                backgroundColor: activeTab === 'puzzle' ? '#1565C0' : 'transparent',
                color: activeTab === 'puzzle' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'puzzle' ? '3px solid #1565C0' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={!puzzleReport}
            >
              Puzzle Solving
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              style={{
                padding: '10px 15px',
                backgroundColor: activeTab === 'memory' ? '#1565C0' : 'transparent',
                color: activeTab === 'memory' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'memory' ? '3px solid #1565C0' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={!memoryReport}
            >
              Memory Match
            </button>
            <button
              onClick={() => setActiveTab('object')}
              style={{
                padding: '10px 15px',
                backgroundColor: activeTab === 'object' ? '#1565C0' : 'transparent',
                color: activeTab === 'object' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'object' ? '3px solid #1565C0' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={!objectReport}
            >
              Object Identification
            </button>
            <button
              onClick={() => setActiveTab('sequence')}
              style={{
                padding: '10px 15px',
                backgroundColor: activeTab === 'sequence' ? '#1565C0' : 'transparent',
                color: activeTab === 'sequence' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'sequence' ? '3px solid #1565C0' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={!sequenceReport}
            >
              Sequence Recall
            </button>
          </div>
         
          {currentReport && (
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <div style={{
                backgroundColor: getSeverityColor(currentReport.severity),
                padding: '15px',
                borderRadius: '8px',
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{activeTab === 'storytelling' ? 'Storytelling' :
                                                       activeTab === 'puzzle' ? 'Puzzle Solving' :
                                                       activeTab === 'memory' ? 'Memory Match' :
                                                       activeTab === 'object' ? 'Object Identification' :
                                                       'Sequence Recall'} Assessment</h3>
                  <div>{currentReport.severity} Cognitive Function</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {currentPoints.toFixed(1)}/100
                </div>
              </div>
             
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <h4 style={{ color: '#1565C0', margin: '0 0 5px 0' }}>Levels Completed</h4>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    {activeTab === 'storytelling' ? currentReport.totalLevelsCompleted :
                     activeTab === 'puzzle' ? currentReport.levelsCompleted :
                     activeTab === 'memory' ? currentReport.totalLevelsCompleted :
                     activeTab === 'object' ? currentReport.totalLevelsCompleted :
                     currentLevelDetails.length}
                  </div>
                </div>
               
                <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <h4 style={{ color: '#1565C0', margin: '0 0 5px 0' }}>Average Time</h4>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    {activeTab === 'storytelling' && currentReport.averageTime ? `${currentReport.averageTime.toFixed(1)}s` :
                     activeTab === 'puzzle' && currentReport.averageTime ? `${currentReport.averageTime.toFixed(1)}s` :
                     activeTab === 'memory' && currentReport.averageTime ? `${currentReport.averageTime.toFixed(1)}s` :
                     activeTab === 'object' && currentReport.averageTime ? `${currentReport.averageTime.toFixed(1)}s` :
                     activeTab === 'sequence' && currentReport.averageTime ? `${currentReport.averageTime.toFixed(1)}s` :
                     'N/A'}
                  </div>
                </div>
               
                <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <h4 style={{ color: '#1565C0', margin: '0 0 5px 0' }}>
                    {activeTab === 'storytelling' ? 'Average Moves' :
                     activeTab === 'puzzle' ? 'Average Moves' :
                     activeTab === 'memory' ? 'Average Flips' :
                     activeTab === 'object' ? 'Average Hints Used' :
                     'Average Deselects'}
                  </h4>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    {activeTab === 'storytelling' && currentReport.averageMoves ? `${currentReport.averageMoves.toFixed(1)}` :
                     activeTab === 'puzzle' && currentReport.averageMoves ? `${currentReport.averageMoves.toFixed(1)}` :
                     activeTab === 'memory' && currentReport.averageFlips ? `${currentReport.averageFlips.toFixed(1)}` :
                     activeTab === 'object' && currentReport.averageHintsUsed ? `${currentReport.averageHintsUsed.toFixed(1)}` :
                     activeTab === 'sequence' && currentReport.averageDeselects ? `${currentReport.averageDeselects.toFixed(1)}` :
                     'N/A'}
                  </div>
                </div>
               
                {activeTab === 'puzzle' && currentReport.averageAttempts && (
                  <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <h4 style={{ color: '#1565C0', margin: '0 0 5px 0' }}>Average Attempts</h4>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      {currentReport.averageAttempts.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
             
              <h3 style={{ color: '#333' }}>Level Performance</h3>
             
              {currentLevelDetails.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Level</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Time Taken</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                          {activeTab === 'storytelling' ? 'Moves' :
                           activeTab === 'puzzle' ? 'Moves' :
                           activeTab === 'memory' ? 'Flips' :
                           activeTab === 'object' ? 'Hints Used' :
                           'Deselects'}
                        </th>
                        {activeTab !== 'object' && (
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                            {activeTab === 'storytelling' ? 'Attempts' :
                             activeTab === 'puzzle' ? 'Attempts' :
                             activeTab === 'memory' ? 'Attempts' :
                             activeTab === 'sequence' ? 'Attempts' : ''}
                          </th>
                        )}
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLevelDetails.map((level, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{level.level}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{level.timeTaken.toFixed(1)}s</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            {activeTab === 'storytelling' ? level.moves :
                             activeTab === 'puzzle' ? level.moves :
                             activeTab === 'memory' ? level.flips :
                             activeTab === 'object' ? level.hintsUsed :
                             level.deselects}
                          </td>
                          {activeTab !== 'object' && (
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                              {level.attempts || 1}
                            </td>
                          )}
                          <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            {level.points.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No level details available.</p>
              )}
             
              {activeTab === 'puzzle' && puzzleReport && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ color: '#333' }}>Puzzle-Specific Recommendations</h3>
                  <ul style={{ paddingLeft: '20px' }}>
                    {getPuzzleSpecificRecommendations(
                      puzzleReport.severity,
                      puzzleReport.difficulty,
                      puzzleReport.averageTime,
                      puzzleReport.averageMoves
                    ).map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;
