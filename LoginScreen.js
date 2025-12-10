import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import logo from "../assets/logo.png";
import frontImage from "../assets/front.png";
import bgImage from "../assets/BG.png";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("User logged in successfully");
        navigate("/home");
      })
      .catch((error) => {
        console.error(error.message);
        setError("Invalid email or password. Please try again.");
      });
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");
    
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setResetSuccess("Password reset email sent. Please check your inbox.");
      })
      .catch((error) => {
        console.error(error.message);
        setError("Failed to send reset email. Please try again.");
      });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "139%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Darker overlay for better contrast */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 0
      }}></div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            width: "350px",
            maxWidth: "90%"
          }}>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={logo}
                alt="Cognicare Logo"
                style={{
                  width: "40px",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
              />
              <h2 style={{ marginTop: "5px", color: "#003366", fontSize: "1.1rem" }}>Cognicare</h2>
              <h3 style={{ marginTop: "10px" }}>Reset Password</h3>
            </div>

            <form onSubmit={handlePasswordReset}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              {error && (
                <p style={{ color: "red", fontSize: "0.8rem", marginBottom: "10px" }}>
                  {error}
                </p>
              )}

              {resetSuccess && (
                <p style={{ color: "green", fontSize: "0.8rem", marginBottom: "10px" }}>
                  {resetSuccess}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  marginBottom: "10px"
                }}
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError("");
                  setResetSuccess("");
                  setResetEmail("");
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main content container - centered and smaller */}
      <div 
        ref={containerRef}
        style={{ 
          position: "relative",
          display: "flex", 
          width: "50%",
          height: "55%",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", 
          borderRadius: "8px", 
          overflow: "hidden",
          zIndex: 1,
          margin: "auto",
          top: "20%",
          left: "0",
          right: "0",
        }}
      >
        {/* Login Box (order changes based on isSwapped) */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            padding: "15px",
            width: "45%", 
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            order: isSwapped ? 2 : 1, // Swaps position
            transition: "order 0.4s ease", // Smooth transition
          }}
        >
          {/* Logo and Cognicare Title */}
          <div style={{ marginBottom: "10px", textAlign: "center" }}>
            <img
              src={logo}
              alt="Cognicare Logo"
              style={{
                width: "40px",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
              }}
            />
            <h2 style={{ marginTop: "5px", color: "#003366", fontSize: "1.1rem" }}>Cognicare</h2>
          </div>

          <h2 style={{ fontSize: "1.3rem" }}>Login</h2>
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <div>
              <label style={{ fontSize: "0.8rem" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "3px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "0.8rem"
                }}
              />
            </div>
            <div style={{ marginTop: "5px" }}>
              <label style={{ fontSize: "0.8rem" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "3px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "0.8rem"
                }}
              />
            </div>
            {error && (
              <p style={{ color: "red", marginTop: "5px", fontSize: "0.8rem" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "7px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.8rem",
                marginTop: "8px",
              }}
            >
              Login
            </button>
          </form>
          <p style={{ marginTop: "8px", fontSize: "0.8rem" }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
          <p 
            style={{ 
              marginTop: "5px", 
              fontSize: "0.8rem", 
              color: "#007bff", 
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </p>
        </div>

        {/* Image Box (order changes based on isSwapped) */}
        <div
          style={{
            width: "55%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#4877a6",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            order: isSwapped ? 1 : 2, // Swaps position
            transition: "order 0.4s ease", // Smooth transition
          }}
          onMouseEnter={() => setIsSwapped(!isSwapped)}
          onClick={() => setIsSwapped(!isSwapped)}
        >
          <img
            src={frontImage}
            alt="Cognicare Front Image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: "scale(0.8)",
              objectPosition: "center",
              zIndex: 1,
            }}
          />
          {/* Box under the front image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "20px",
              backgroundColor: "#4877a6",
              zIndex: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;