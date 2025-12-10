import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Firebase config

// Import components and screens
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import AboutUs from './screens/AboutUs';
import ContactUs from './screens/ContactUs';
import Profile from './screens/Profile';
import BrainGamesHome from './screens/BrainGames/BrainGamesHome';
import PuzzleGame from './screens/BrainGames/PuzzleGame';
import MemoryMatch from './screens/BrainGames/MemoryMatch';
import SequenceRecall from './screens/BrainGames/SequenceRecall';
import ObjectIdentification from './screens/BrainGames/ObjectIdentification';
import TherapyHome from './screens/Therapy/TherapyHome';
import MemoryReframing from './screens/Therapy/MemoryReframing';
import StoryWeaving from './screens/Therapy/StoryWeaving';
import EmotionVault from './screens/Therapy/EmotionVault';
import StoryTellingStart from './screens/StoryTelling/StoryTellingStart';
import StoryLevel from './screens/StoryTelling/StoryLevel';
import Report from './screens/Report';
import Reminder from './screens/Reminder';
import Logout from './screens/Logout';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const location = useLocation();

  // Check if the current path is login or signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {/* Show Navbar only if user is authenticated and not on login/signup page */}
      {user && !isAuthPage && <Navbar />}

      <Routes>
        <Route path="/" element={user ? <HomeScreen /> : <Navigate to="/login" />} />
        <Route path="/home" element={user ? <HomeScreen /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/about-us" element={user ? <AboutUs /> : <Navigate to="/login" />} />
        <Route path="/contact-us" element={user ? <ContactUs /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/brain-games" element={user ? <BrainGamesHome /> : <Navigate to="/login" />} />
        <Route path="/braingames/puzzlegame" element={user ? <PuzzleGame /> : <Navigate to="/login" />} />
        <Route path="/braingames/report" element={user ? <Report /> : <Navigate to="/login" />} />
        <Route path="/braingames/memorymatch" element={user ? <MemoryMatch /> : <Navigate to="/login" />} />
        <Route path="/braingames/sequencerecall" element={user ? <SequenceRecall /> : <Navigate to="/login" />} />
        <Route path="/braingames/objectidentification" element={user ? <ObjectIdentification /> : <Navigate to="/login" />} />
        <Route path="/therapy" element={user ? <TherapyHome /> : <Navigate to="/login" />} />
        <Route path="/therapy/memory-reframing" element={user ? <MemoryReframing /> : <Navigate to="/login" />} />
        <Route path="/therapy/story-weaving" element={user ? <StoryWeaving /> : <Navigate to="/login" />} />
        <Route path="/therapy/emotion-vault" element={user ? <EmotionVault /> : <Navigate to="/login" />} />
        <Route path="/story-telling" element={user ? <StoryTellingStart /> : <Navigate to="/login" />} />
        <Route path="/story-telling/level/:levelId" element={user ? <StoryLevel /> : <Navigate to="/login" />} />
        <Route path="/story-telling/report" element={<Report />} />
        <Route path="/report" element={user ? <Report /> : <Navigate to="/login" />} />
        <Route path="/reminder" element={user ? <Reminder /> : <Navigate to="/login" />} />
        <Route path="/logout" element={user ? <Logout /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
