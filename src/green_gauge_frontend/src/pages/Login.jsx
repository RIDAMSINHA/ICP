import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/auth';
import '../styles/Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [navigate, setIsAuthenticated]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      await login();
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Sign In to Green Gauge</h1>
        <p className="login-description">
          Access your carbon trading account securely using Internet Identity
        </p>
        
        {error && <div className="login-error">{error}</div>}
        
        <button 
          onClick={handleLogin} 
          className="ii-button"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign in with Internet Identity'}
        </button>
        
        <div className="login-help">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
        
        <div className="whats-ii">
          <h3>What is Internet Identity?</h3>
          <p>
            Internet Identity is a new authentication method for the Internet Computer
            that allows you to sign in without usernames, passwords, or third-party authentication providers.
          </p>
          <p>
            It's secure, anonymous, and puts you in control of your digital identity.
          </p>
          <a href="https://internetcomputer.org/internet-identity" target="_blank" rel="noopener noreferrer">
            Learn more about Internet Identity
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login; 