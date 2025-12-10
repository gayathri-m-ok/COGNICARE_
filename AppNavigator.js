import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Import auth from firebase
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import AboutUs from "../screens/AboutUs";
import ContactUs from "../screens/ContactUs";
import Profile from "../screens/Profile";
import BrainGames from "../screens/BrainGames";
import Therapy from "../screens/Therapy";
import StoryTelling from "../screens/StoryTelling";
import Report from "../screens/Report";
import Reminder from "../screens/Reminder";
import Logout from "../screens/Logout";

const AppNavigator = () => {
  const [user, setUser] = useState(null); // state to store user authentication status

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set user if logged in
      } else {
        setUser(null); // Set user to null if logged out
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <Router>
      <Routes>
        {/* Conditionally render Login and SignUp pages */}
        {!user ? (
          <>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
          </>
        ) : (
          <>
            {/* These routes are visible only when the user is logged in */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/brain-games" element={<BrainGames />} />
            <Route path="/therapy" element={<Therapy />} />
            <Route path="/story-telling" element={<StoryTelling />} />
            <Route path="/report" element={<Report />} />
            <Route path="/reminder" element={<Reminder />} />
            <Route path="/logout" element={<Logout />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppNavigator;
