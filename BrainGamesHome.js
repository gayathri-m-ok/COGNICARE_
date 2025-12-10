import React from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import { GiPuzzle, GiCardPick } from "react-icons/gi";
import { FaListOl, FaSearch } from "react-icons/fa";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/BG.png";  // Import your background image

const BrainGamesHome = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const gameBoxes = [
    {
      title: "Puzzle Game",
      icon: <GiPuzzle size={50} color="#1e88e5" />,
      path: "/braingames/puzzlegame",
    },
    {
      title: "Memory Match",
      icon: <GiCardPick size={50} color="#43a047" />,
      path: "/braingames/memorymatch",
    },
    {
      title: "Sequence Recall",
      icon: <FaListOl size={50} color="#fb8c00" />,
      path: "/braingames/sequencerecall",
    },
    {
      title: "Object Identification",
      icon: <FaSearch size={50} color="#8e24aa" />,
      path: "/braingames/objectidentification",
    },
  ];

  const headingWrapperStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.8)", // white transparent
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "40px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const headingStyle = {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "bold",
    color: "#003366",
    margin: 0,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    maxWidth: "700px",
    margin: "0 auto",
  };

  const boxStyle = {
    padding: "40px 20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const titleStyle = {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#000000",
    transition: "color 0.2s",
  };

  const logoStyle = {
    position: "absolute",
    top: "20px",
    right: "40px",
    width: "80px",
    height: "auto",
  };

  const containerStyle = {
    position: "relative",
    padding: "40px",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "139%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
  };

  return (
    <div style={containerStyle}>
      <img src={logo} alt="Logo" style={logoStyle} />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={headingWrapperStyle}>
          <h2 style={headingStyle}>Select Your Game</h2>
        </div>
        <div style={gridStyle}>
          {gameBoxes.map((game, index) => (
            <div
              key={index}
              style={boxStyle}
              onClick={() => navigate(game.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
                e.currentTarget.querySelector("h3").style.color = "#1e88e5"; // Highlight title on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                e.currentTarget.querySelector("h3").style.color = "#000000"; // Reset title color
              }}
            >
              {game.icon}
              <h3 style={titleStyle}>{game.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrainGamesHome;
