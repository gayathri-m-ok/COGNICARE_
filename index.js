import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'
import App from './App';

// Create the root element dynamically and attach it to the body
const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement);

// Global styles applied via JS
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.fontFamily = 'Arial, sans-serif';

// Create the root and render the app
const root = ReactDOM.createRoot(rootElement); // Use createRoot instead of render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
