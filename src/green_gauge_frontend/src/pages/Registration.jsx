import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated, getPrincipal } from '../services/auth';
import { registerUser } from '../services/api';
import '../styles/Registration.css';

const Registration = ({ setIsAuthenticated }) => {
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const principal = await getPrincipal();
        setPrincipal(principal);
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, [setIsAuthenticated]);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      setError('');
      
      await login();
      
      const principal = await getPrincipal();
      setPrincipal(principal);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!principal) {
      setError('Please authenticate with Internet Identity first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await registerUser();
      
      if (result.Ok !== undefined) {
        setSuccess('Account registered successfully! Redirecting to dashboard...');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (result.Err) {
        if (result.Err.includes('already registered')) {
          setSuccess('You already have an account. Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError(result.Err);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <h1>Create a Green Gauge Account</h1>
        <p className="registration-description">
          Join our platform to monitor and trade your carbon credits.
        </p>
        
        {error && <div className="registration-error">{error}</div>}
        {success && <div className="registration-success">{success}</div>}
        
        {!principal ? (
          <div className="auth-section">
            <p>First, authenticate with Internet Identity:</p>
            <button 
              onClick={handleLogin} 
              className="auth-button"
              disabled={authLoading}
            >
              {authLoading ? 'Authenticating...' : 'Sign in with Internet Identity'}
            </button>
          </div>
        ) : (
          <div className="register-section">
            <p>You're authenticated as:</p>
            <div className="principal-display">{principal}</div>
            
            <button 
              onClick={handleRegister} 
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        )}
        
        <div className="registration-help">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default Registration; 