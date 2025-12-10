import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography, TextField, Button, Dialog, DialogActions, 
  DialogContent, DialogTitle, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import alarmSound from '../assets/alarm.wav';
import logo from '../assets/logo.png';
import bgImage from '../assets/BG.png';

const Reminder = () => {
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [reminders, setReminders] = useState({});
  const [reminderData, setReminderData] = useState({
    date: '',
    time: '',
    purpose: '',
    recurring: false,
    days: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    }
  });
  const alarmAudio = useRef(null);
  const [alarmTimeout, setAlarmTimeout] = useState(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const storedReminders = localStorage.getItem('reminders');
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever reminders change
  useEffect(() => {
    if (Object.keys(reminders).length > 0) {
      localStorage.setItem('reminders', JSON.stringify(reminders));
    } else {
      localStorage.removeItem('reminders');
    }
  }, [reminders]);

  // Alarm checker every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = formatDateKey(now);
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      // Get day of week in lowercase (0 = Sunday, 1 = Monday, etc.)
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = daysOfWeek[now.getDay()];

      // Check one-time reminders
      if (reminders[currentDate]) {
        reminders[currentDate].forEach((reminder, index) => {
          if (reminder.time === currentTime && !isAlarmActive) {
            triggerAlarm(reminder, currentDate, index);
          }
        });
      }

      // Check recurring reminders (stored with 'recurring' key)
      if (reminders['recurring']) {
        reminders['recurring'].forEach((reminder, index) => {
          if (reminder.time === currentTime && reminder.days[currentDay] && !isAlarmActive) {
            triggerAlarm(reminder, 'recurring', index, true);
          }
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders, isAlarmActive]);

  // Ask for Notification permission on load
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const triggerAlarm = (reminder, dateKey, reminderIndex, isRecurring = false) => {
    if (alarmAudio.current) {
      alarmAudio.current.play();
    }

    // Show the pop-up with the reminder details
    setShowAlarmPopup(true);
    setIsAlarmActive(true);
    setActiveReminder({...reminder, dateKey, reminderIndex, isRecurring});

    // Set alarm to repeat every 10 minutes if the user doesn't take any action
    if (!alarmTimeout) {
      setAlarmTimeout(setInterval(() => {
        if (alarmAudio.current) {
          alarmAudio.current.play();
        }
        setShowAlarmPopup(true);
      }, 600000)); // Repeat every 10 minutes
    }

    // Notification will only display the reminder name (purpose)
    if (Notification.permission === 'granted') {
      new Notification(reminder.purpose);
    }
  };

  const stopAlarm = () => {
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }

    if (alarmTimeout) {
      clearInterval(alarmTimeout);
      setAlarmTimeout(null);
    }

    // Delete one-time reminders after they ring
    if (activeReminder && !activeReminder.isRecurring) {
      handleDeleteReminder(activeReminder.dateKey, activeReminder.reminderIndex);
    }

    setShowAlarmPopup(false);
    setIsAlarmActive(false);
    setActiveReminder(null);
  };

  const snoozeAlarm = () => {
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }

    // Close the popup immediately
    setShowAlarmPopup(false);
    setIsAlarmActive(false);

    // Set timeout to show popup again after 40 seconds
    setTimeout(() => {
      if (activeReminder) {
        triggerAlarm(
          activeReminder, 
          activeReminder.dateKey, 
          activeReminder.reminderIndex, 
          activeReminder.isRecurring
        );
      }
    }, 40000); // 40 seconds
  };

  const formatDateKey = (dateObj) => {
    return dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const formatDisplayDate = (clickedDate) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return clickedDate.toLocaleDateString(undefined, options);
  };

  const isPastDate = (clickedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);
    return clickedDate < today;
  };

  const handleDateClick = (clickedDate) => {
    if (isPastDate(new Date(clickedDate))) {
      alert('Please choose today or a future date.');
      return;
    }

    setDate(clickedDate);
    const formattedDate = formatDateKey(clickedDate);
    setReminderData({
      date: formattedDate,
      time: '',
      purpose: '',
      recurring: false,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'recurring') {
      setReminderData(prev => ({ ...prev, recurring: checked }));
    } else if (name.startsWith('day-')) {
      const day = name.replace('day-', '');
      setReminderData(prev => ({
        ...prev,
        days: {
          ...prev.days,
          [day]: checked
        }
      }));
    } else {
      setReminderData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveReminder = () => {
    const newReminders = { ...reminders };
    const reminderToSave = {
      time: reminderData.time,
      purpose: reminderData.purpose,
    };

    if (reminderData.recurring) {
      reminderToSave.days = reminderData.days;
      
      if (!newReminders['recurring']) {
        newReminders['recurring'] = [];
      }
      newReminders['recurring'].push(reminderToSave);
    } else {
      const formattedDate = reminderData.date;
      
      if (!newReminders[formattedDate]) {
        newReminders[formattedDate] = [];
      }
      newReminders[formattedDate].push(reminderToSave);
    }

    setReminders(newReminders);
    setShowForm(false);
    setReminderData({
      date: '',
      time: '',
      purpose: '',
      recurring: false,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    });
  };

  const handleCancel = () => {
    setReminderData({
      date: '',
      time: '',
      purpose: '',
      recurring: false,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    });
    setShowForm(false);
  };

  const handleDeleteReminder = (dateKey, reminderIndex) => {
    const updatedReminders = { ...reminders };
    updatedReminders[dateKey].splice(reminderIndex, 1);
    if (updatedReminders[dateKey].length === 0) {
      delete updatedReminders[dateKey];
    }
    setReminders(updatedReminders);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = formatDateKey(date);
      if (reminders[formattedDate]?.length > 0) {
        return (
          <div
            style={{
              marginTop: 2,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#3f51b5',
              margin: '0 auto',
            }}
          />
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = formatDateKey(date);
      if (reminders[formattedDate]?.length > 0) {
        return 'highlighted-tile';
      }
    }
    return '';
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: `url(${bgImage}) no-repeat center center fixed`,
      backgroundSize: '139%',
      minHeight: '100vh' 
    }}>
      {/* Logo in top right corner */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <img src={logo} alt="Logo" style={{ height: '80px' }} />
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <Typography variant="h4" align="center" gutterBottom>
          Reminder Calendar 🗓
        </Typography>

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <Calendar
                onClickDay={handleDateClick}
                value={date}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="custom-calendar"
              />
            </div>
          </Grid>
        </Grid>

        {/* Reminder Form Dialog */}
        <Dialog open={showForm} onClose={handleCancel}>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogContent>
            <FormControlLabel
              control={
                <Checkbox
                  name="recurring"
                  checked={reminderData.recurring}
                  onChange={handleChange}
                />
              }
              label="Set as recurring reminder"
            />

            {!reminderData.recurring ? (
              <TextField
                label="Date"
                value={formatDisplayDate(new Date(reminderData.date))}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            ) : (
              <FormGroup row style={{ marginTop: '15px' }}>
                <Typography variant="subtitle1" style={{ width: '100%', marginBottom: '10px' }}>
                  Select days for reminder:
                </Typography>
                <FormControlLabel
                  control={<Checkbox name="day-monday" checked={reminderData.days.monday} onChange={handleChange} />}
                  label="Monday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-tuesday" checked={reminderData.days.tuesday} onChange={handleChange} />}
                  label="Tuesday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-wednesday" checked={reminderData.days.wednesday} onChange={handleChange} />}
                  label="Wednesday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-thursday" checked={reminderData.days.thursday} onChange={handleChange} />}
                  label="Thursday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-friday" checked={reminderData.days.friday} onChange={handleChange} />}
                  label="Friday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-saturday" checked={reminderData.days.saturday} onChange={handleChange} />}
                  label="Saturday"
                />
                <FormControlLabel
                  control={<Checkbox name="day-sunday" checked={reminderData.days.sunday} onChange={handleChange} />}
                  label="Sunday"
                />
              </FormGroup>
            )}

            <TextField
              label="Time"
              type="time"
              name="time"
              value={reminderData.time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: 300 }}
            />
            <TextField
              label="Purpose"
              name="purpose"
              value={reminderData.purpose}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSaveReminder}
              color="primary"
              disabled={
                !reminderData.time || 
                !reminderData.purpose || 
                (reminderData.recurring && !Object.values(reminderData.days).some(day => day))
              }
            >
              Save Reminder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reminder List */}
        <div style={{ marginTop: '40px' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Your Reminders
          </Typography>
          
          {/* No reminders message */}
          {Object.keys(reminders).length === 0 ? (
            <Typography variant="body1" align="center" color="textSecondary">
              No reminders set yet.
            </Typography>
          ) : (
            <>
              {/* Recurring Reminders Section */}
              {reminders['recurring'] && (
                <div style={{ marginBottom: '30px' }}>
                  <Typography variant="h6" style={{ background: '#e3f2fd', padding: '10px', borderRadius: '5px' }}>
                    ↻ Recurring Reminders
                  </Typography>
                  {reminders['recurring'].map((reminder, index) => (
                    <div
                      key={`recurring-${index}`}
                      style={{
                        marginBottom: '10px',
                        background: '#f5f5f5',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <Typography variant="body1">🕓 Time: {reminder.time}</Typography>
                        <Typography variant="body1">📋 Purpose: {reminder.purpose}</Typography>
                        <Typography variant="body2" style={{ marginTop: '5px' }}>
                          Days: {Object.entries(reminder.days)
                            .filter(([_, isActive]) => isActive)
                            .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                            .join(', ')}
                        </Typography>
                      </div>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleDeleteReminder('recurring', index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* One-time Reminders Section */}
              {Object.keys(reminders)
                .filter(key => key !== 'recurring')
                .map((reminderDate) => (
                  <div
                    key={reminderDate}
                    style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}
                  >
                    <Typography variant="h6">{formatDisplayDate(new Date(reminderDate))}</Typography>
                    {reminders[reminderDate].map((reminder, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <Typography variant="body1">🕓 Time: {reminder.time}</Typography>
                          <Typography variant="body1">📋 Purpose: {reminder.purpose}</Typography>
                        </div>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleDeleteReminder(reminderDate, index)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Alarm Popup */}
        {showAlarmPopup && (
          <Dialog open={showAlarmPopup} onClose={snoozeAlarm}>
            <DialogTitle>Reminder</DialogTitle>
            <DialogContent>
              <Typography variant="body1">🕓 Time: {activeReminder?.time}</Typography>
              <Typography variant="body1">📋 Purpose: {activeReminder?.purpose}</Typography>
              {activeReminder?.isRecurring && (
                <Typography variant="body2" style={{ marginTop: '10px', fontStyle: 'italic' }}>
                  This is a recurring reminder
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={stopAlarm} color="primary">
                {activeReminder?.isRecurring ? 'Dismiss' : 'Complete'}
              </Button>
              <Button onClick={snoozeAlarm} color="secondary">
                Snooze
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>

      <audio ref={alarmAudio} src={alarmSound} />
    </div>
  );
};

export default Reminder;