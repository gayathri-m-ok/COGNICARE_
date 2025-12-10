import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPuzzlePiece, FaBrain, FaBookOpen, FaFileAlt } from "react-icons/fa";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import bgImage from "../assets/BG.png"; // Add your PNG background here

function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "User");
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const homeContainerStyle = {
    padding: "40px",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "139%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  };

  const timeContainerStyle = {
    position: "absolute",
    top: "20px",
    left: "30px",
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: "12px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    fontSize: "20px",
    color: "#003366",
    textAlign: "left",
    zIndex: 10,
  };

  const innerContainerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
  };

  const logoStyle = {
    width: "120px",
    height: "auto",
    marginRight: "20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
  };

  const textContainerStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  };

  const headingStyle = {
    fontSize: "48px",
    color: "#003366",
    margin: "0",
  };

  const sloganStyle = {
    fontSize: "24px",
    fontWeight: "lighter",
    color: "#003366",
    margin: "10px 0 5px 0",
  };

  const welcomeStyle = {
    fontSize: "22px",
    color: "#007bff",
    margin: "5px 0 0 0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
    marginTop: "20px",
  };

  const boxStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)",
    padding: "24px",
    width: "220px",
    height: "160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#003366",
    fontSize: "18px",
    fontWeight: "bold",
    textDecoration: "none",
    transition: "transform 0.3s ease",
  };

  const iconStyles = {
    games: {
      fontSize: "38px",
      marginBottom: "10px",
      color: "#FF6F61",
    },
    therapy: {
      fontSize: "38px",
      marginBottom: "10px",
      color: "#6A1B9A",
    },
    story: {
      fontSize: "38px",
      marginBottom: "10px",
      color: "#FFA000",
    },
    report: {
      fontSize: "38px",
      marginBottom: "10px",
      color: "#00897B",
    },
  };

  return (
    <div style={homeContainerStyle}>
      {/* Time and Date */}
      <div style={timeContainerStyle}>
        <div>{formattedTime}</div>
        <div>{formattedDate}</div>
      </div>

      <div style={innerContainerStyle}>
        {/* Header: Logo + Text */}
        <div style={headerStyle}>
          <img src={logo} alt="Cognicare Logo" style={logoStyle} />
          <div style={textContainerStyle}>
            <h1 style={headingStyle}>Cognicare</h1>
            <p style={sloganStyle}>Remember. Revive. Reframe.</p>
            {userName && <p style={welcomeStyle}>Hello, {userName}!</p>}
          </div>
        </div>

        {/* Grid Buttons */}
        <div style={gridStyle}>
          <Link to="/brain-games" style={{ textDecoration: "none" }}>
            <div style={boxStyle}>
              <FaPuzzlePiece style={iconStyles.games} />
              Brain Games
            </div>
          </Link>
          <Link to="/therapy" style={{ textDecoration: "none" }}>
            <div style={boxStyle}>
              <FaBrain style={iconStyles.therapy} />
              Therapy
            </div>
          </Link>
          <Link to="/story-telling" style={{ textDecoration: "none" }}>
            <div style={boxStyle}>
              <FaBookOpen style={iconStyles.story} />
              Story Telling
            </div>
          </Link>
          <Link to="/report" style={{ textDecoration: "none" }}>
            <div style={boxStyle}>
              <FaFileAlt style={iconStyles.report} />
              Report
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
