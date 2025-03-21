import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css'; // Tailwind CSS
import './index.scss'; // Additional styles
import { ThresholdProvider } from './thresholdcontext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThresholdProvider>
        <App />
      </ThresholdProvider>
    </Router>
  </React.StrictMode>,
);
