import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './backendActor';

// Components
import NavigationBar from './NavigationBar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import CarbonMarket from './pages/CarbonMarket';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './Signup';
import About from './About';
import ContactUs from './ContactUs';
import PrivacyPolicy from './PrivacyPolicy';
import TermsConditions from './TermsConditions';
import Alerts from './Alerts';
import Profile from './Profile';
import './styles/App.css';

const App = () => {
  // For demo purposes, always set isAuthenticated to true
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Commented out the actual auth check since we're hardcoding for demo
  /*
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Authentication check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  */

  useEffect(() => {
    // Simulate a brief loading to make the app feel more realistic
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Green Gauge...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <NavigationBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      
      <main className="app-main pt-20">
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/home" element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/signup" 
            element={<Signup setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={<Registration setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route path="/dashboard" element={<Dashboard isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/carbon" element={<CarbonMarket isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/admin" element={<AdminDashboard isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/alerts" element={<Alerts isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsconditions" element={<TermsConditions />} />
          <Route path="/profile" element={<Profile isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* <footer className="app-footer">
        <p>© {new Date().getFullYear()} Green Gauge - A Carbon Trading Platform on the Internet Computer</p>
      </footer> */}
    </div>
  );
};

export default App;
