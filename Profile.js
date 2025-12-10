// src/components/Profile.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  LinearProgress,
  Box
} from "@mui/material";

const Profile = () => {
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    allergies: "",
    address: "",
    emergencyContact: "",
  });

  const [caretaker, setCaretaker] = useState({
    name: "",
    age: "",
    gender: "",
    relationship: "",
    contact: "",
    email: "",
    address: "",
    experience: "",
  });

  const [patientErrors, setPatientErrors] = useState({});
  const [caretakerErrors, setCaretakerErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [loading, setLoading] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const experienceOptions = [
    { value: "0", label: "Less than 1 year" },
    { value: "1-3", label: "1-3 years" },
    { value: "4-6", label: "4-6 years" },
    { value: "7+", label: "7+ years" },
  ];

  useEffect(() => {
    const loadProfileData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        try {
          setLoading(true);
          const docRef = doc(db, "profileReports", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.patient) setPatient(data.patient);
            if (data.caretaker) setCaretaker(data.caretaker); // Fixed typo here (was setPatient)
          } else {
            // Load from local storage if no Firestore data
            const savedPatient = localStorage.getItem("patientDetails");
            const savedCaretaker = localStorage.getItem("caretakerDetails");
            if (savedPatient) setPatient(JSON.parse(savedPatient));
            if (savedCaretaker) setCaretaker(JSON.parse(savedCaretaker));
          }
          setHasLoadedData(true);
        } catch (error) {
          console.error("Error loading profile:", error);
          setSnackbar({
            open: true,
            message: "Error loading profile data",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, []);

  const calculateCompletion = () => {
    const requiredFields = [
      patient.name,
      patient.age,
      patient.gender,
      patient.emergencyContact,
      caretaker.name,
      caretaker.age,
      caretaker.gender,
      caretaker.contact,
      caretaker.email,
    ];

    const filledFields = requiredFields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const validatePatient = () => {
    const errors = {};
    let isValid = true;

    if (!/^[a-zA-Z\s]*$/.test(patient.name)) {
      errors.name = "Name should contain only alphabets";
      isValid = false;
    }
    if (!patient.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!/^\d+$/.test(patient.age)) {
      errors.age = "Age should be a number";
      isValid = false;
    }
    if (!patient.age) {
      errors.age = "Age is required";
      isValid = false;
    }
    if (!patient.gender) {
      errors.gender = "Gender is required";
      isValid = false;
    }
    if (!/^\d{10}$/.test(patient.emergencyContact)) {
      errors.emergencyContact = "Emergency contact should be a 10-digit number";
      isValid = false;
    }
    if (!patient.emergencyContact) {
      errors.emergencyContact = "Emergency contact is required";
      isValid = false;
    }

    setPatientErrors(errors);
    return isValid;
  };

  const validateCaretaker = () => {
    const errors = {};
    let isValid = true;

    if (!/^[a-zA-Z\s]*$/.test(caretaker.name)) {
      errors.name = "Name should contain only alphabets";
      isValid = false;
    }
    if (!caretaker.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!/^\d+$/.test(caretaker.age)) {
      errors.age = "Age should be a number";
      isValid = false;
    }
    if (!caretaker.age) {
      errors.age = "Age is required";
      isValid = false;
    }
    if (!caretaker.gender) {
      errors.gender = "Gender is required";
      isValid = false;
    }
    if (!/^\d{10}$/.test(caretaker.contact)) {
      errors.contact = "Contact should be a 10-digit number";
      isValid = false;
    }
    if (!caretaker.contact) {
      errors.contact = "Contact is required";
      isValid = false;
    }
    if (!caretaker.experience) {
      errors.experience = "Experience is required";
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(caretaker.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }
    if (!caretaker.email) {
      errors.email = "Email is required";
      isValid = false;
    }

    setCaretakerErrors(errors);
    return isValid;
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaretakerChange = (e) => {
    const { name, value } = e.target;
    setCaretaker((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const isPatientValid = validatePatient();
    const isCaretakerValid = validateCaretaker();

    if (!isPatientValid || !isCaretakerValid) {
      setSnackbar({
        open: true,
        message: "Please fix all errors before saving",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const user = getAuth().currentUser;
      if (user) {
        const profileData = {
          patient,
          caretaker,
          updatedAt: new Date().toISOString(),
          userId: user.uid,
        };

        // Include createdAt only if it's a new document
        if (!hasLoadedData) {
          profileData.createdAt = new Date().toISOString();
        }

        // Save profile report to Firestore
        await setDoc(doc(db, "profileReports", user.uid), profileData, { merge: true });

        // Save details to local storage as well
        localStorage.setItem("patientDetails", JSON.stringify(patient));
        localStorage.setItem("caretakerDetails", JSON.stringify(caretaker));

        setSnackbar({
          open: true,
          message: "Profile saved successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "User is not authenticated",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSnackbar({
        open: true,
        message: `Error saving profile: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const completionPercentage = calculateCompletion();

  return (
    <div
      style={{
        padding: "40px",
        background: "linear-gradient(to bottom right, #e0f7fa, #ffffff)",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Patient & Caretaker Profile 👤
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ width: "100%", mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Form Completion: {completionPercentage}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: completionPercentage === 100 ? "#4caf50" : "#1976d2",
              },
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Patient Details */}
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: "20px", borderRadius: "10px" }} elevation={3}>
              <Typography variant="h5" gutterBottom>
                Patient Details
              </Typography>

              <TextField
                label="Name"
                name="name"
                value={patient.name}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                error={!!patientErrors.name}
                helperText={patientErrors.name}
                required
                disabled={loading}
              />
              <TextField
                label="Age"
                name="age"
                value={patient.age}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                error={!!patientErrors.age}
                helperText={patientErrors.age}
                required
                disabled={loading}
              />
              <TextField
                select
                label="Gender"
                name="gender"
                value={patient.gender}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                error={!!patientErrors.gender}
                helperText={patientErrors.gender}
                required
                disabled={loading}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Allergies"
                name="allergies"
                value={patient.allergies}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                label="Residential Address"
                name="address"
                value={patient.address}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                label="Emergency Contact Number"
                name="emergencyContact"
                value={patient.emergencyContact}
                onChange={handlePatientChange}
                fullWidth
                margin="normal"
                error={!!patientErrors.emergencyContact}
                helperText={patientErrors.emergencyContact}
                inputProps={{ maxLength: 10 }}
                required
                disabled={loading}
              />
            </Paper>
          </Grid>

          {/* Caretaker Details */}
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: "20px", borderRadius: "10px" }} elevation={3}>
              <Typography variant="h5" gutterBottom>
                Caretaker Details
              </Typography>

              <TextField
                label="Name"
                name="name"
                value={caretaker.name}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                error={!!caretakerErrors.name}
                helperText={caretakerErrors.name}
                required
                disabled={loading}
              />
              <TextField
                label="Age"
                name="age"
                value={caretaker.age}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                error={!!caretakerErrors.age}
                helperText={caretakerErrors.age}
                required
                disabled={loading}
              />
              <TextField
                select
                label="Gender"
                name="gender"
                value={caretaker.gender}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                error={!!caretakerErrors.gender}
                helperText={caretakerErrors.gender}
                required
                disabled={loading}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Relationship to Patient"
                name="relationship"
                value={caretaker.relationship}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                label="Contact Number"
                name="contact"
                value={caretaker.contact}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                error={!!caretakerErrors.contact}
                helperText={caretakerErrors.contact}
                inputProps={{ maxLength: 10 }}
                required
                disabled={loading}
              />
              <TextField
                label="Email Address"
                name="email"
                value={caretaker.email}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                type="email"
                error={!!caretakerErrors.email}
                helperText={caretakerErrors.email}
                required
                disabled={loading}
              />
              <TextField
                label="Residential Address"
                name="address"
                value={caretaker.address}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                select
                label="Experience in Caregiving"
                name="experience"
                value={caretaker.experience}
                onChange={handleCaretakerChange}
                fullWidth
                margin="normal"
                error={!!caretakerErrors.experience}
                helperText={caretakerErrors.experience}
                required
                disabled={loading}
              >
                {experienceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>
        </Grid>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSave}
            disabled={completionPercentage !== 100 || loading}
            style={{ width: "100%", maxWidth: "300px" }}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;