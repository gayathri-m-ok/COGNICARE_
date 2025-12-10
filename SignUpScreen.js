import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import logo from "../assets/logo.png";
import frontImage from "../assets/front.png";
import bgImage from "../assets/BG.png";

function SignUpScreen() {
  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  });
  const [error, setError] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setIsSwapped(true);
    } else if (distance < -50) {
      setIsSwapped(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.userName.trim()) {
        setError("User name is required");
        return false;
      }
      if (!formData.dateOfBirth) {
        setError("Date of birth is required");
        return false;
      }
    } else if (step === 2) {
      if (!formData.email) {
        setError("Email is required");
        return false;
      }
      if (!formData.phone) {
        setError("Phone number is required");
        return false;
      }
    } else if (step === 3) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with user name
      await updateProfile(userCredential.user, {
        displayName: formData.userName,
      });

      // Save additional user data to Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        userName: formData.userName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
      });

      navigate("/home");
    } catch (error) {
      setError(error.message);
    }
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Darker overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 0
      }}></div>

      {/* Main container */}
      <div style={{ 
        position: "relative",
        display: "flex", 
        width: "70%",
        maxWidth: "900px",
        height: "550px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", 
        borderRadius: "8px", 
        overflow: "hidden",
        zIndex: 1,
      }}>
        {/* Form Section */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.78)",
            backdropFilter: "blur(5px)",
            padding: "25px",
            width: "50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            order: isSwapped ? 2 : 1,
            transition: "order 0.4s ease",
          }}
        >
          {/* Logo and Title */}
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "40px", marginBottom: "8px" }}
            />
            <h2 style={{ color: "#003366", margin: 0, fontSize: "1.5rem" }}>Cognicare</h2>
            <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "5px" }}>
              {step === 1 && "Personal Information"}
              {step === 2 && "Contact Details"}
              {step === 3 && "Account Security"}
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  backgroundColor: step >= i ? "#007bff" : "#ddd",
                  color: step >= i ? "white" : "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 5px",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              >
                {i}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            {step === 1 && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    User Name*
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Email Address*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Password* (min 6 characters)
                  </label>
                  <input
                    type={formData.showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>
                    Confirm Password*
                  </label>
                  <input
                    type={formData.showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="showPassword"
                    name="showPassword"
                    checked={formData.showPassword}
                    onChange={handleChange}
                    style={{ marginRight: "8px", width: "15px", height: "15px" }}
                  />
                  <label htmlFor="showPassword" style={{ fontSize: "0.8rem" }}>
                    Show Password
                  </label>
                </div>
              </>
            )}

            {error && (
              <div style={{ color: "red", marginBottom: "12px", fontSize: "0.8rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "auto",
                    fontSize: "0.8rem",
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "0.9rem",
                  }}
                >
                  Create Account
                </button>
              )}
            </div>
          </form>

          <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.8rem" }}>
            Already have an account? <Link to="/login" style={{ color: "#007bff" }}>Log in</Link>
          </p>
        </div>

        {/* Image Box */}
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
            order: isSwapped ? 1 : 2,
            transition: "order 0.4s ease",
          }}
          onClick={() => setIsSwapped(!isSwapped)}
          onMouseEnter={() => setIsSwapped(!isSwapped)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={frontImage}
            alt="Welcome"
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SignUpScreen;