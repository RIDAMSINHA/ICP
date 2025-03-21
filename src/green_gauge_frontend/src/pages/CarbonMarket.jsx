import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import { getUserProfile } from '../services/api';
import TradeOfferForm from '../components/TradeOfferForm';
import TradeList from '../components/TradeList';
import '../styles/CarbonMarket.css';

const CarbonMarket = () => {
  const [authenticated, setAuthenticated] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
        
        if (authStatus) {
          await fetchUserProfile();
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        setError('Failed to verify authentication status');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      
      if (profile.Ok) {
        setUserProfile(profile.Ok);
        setError('');
      } else if (profile.Err) {
        setError(profile.Err);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile data');
    }
  };

  const handleTradeCreated = () => {
    // Refresh user profile after trade is created
    fetchUserProfile();
  };

  const handleTradeCompleted = () => {
    // Refresh user profile after trade is completed
    fetchUserProfile();
  };

  if (loading) {
    return (
      <div className="carbon-market-loading">
        <div className="spinner"></div>
        <p>Loading Carbon Market...</p>
      </div>
    );
  }

  if (authenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="carbon-market-page">
      <div className="carbon-market-header">
        <h1>Carbon Market</h1>
        <p>Buy and sell carbon credits on our platform</p>
      </div>

      {error && <div className="carbon-market-error">{error}</div>}

      <div className="carbon-market-tabs">
        <button 
          className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          Buy Carbon Credits
        </button>
        <button 
          className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          Sell Carbon Credits
        </button>
      </div>

      <div className="carbon-market-content">
        {activeTab === 'buy' ? (
          <div className="trade-list-container">
            <h2>Available Trade Offers</h2>
            <TradeList 
              userProfile={userProfile} 
              onTradeCompleted={handleTradeCompleted} 
            />
          </div>
        ) : (
          <div className="trade-form-container">
            <h2>Create a Trade Offer</h2>
            {userProfile && (
              <div className="user-carbon-info">
                <p>Available carbon for trading: <strong>{userProfile.carbonAllowance - userProfile.carbonEmitted} units</strong></p>
              </div>
            )}
            <TradeOfferForm 
              userProfile={userProfile}
              onTradeCreated={handleTradeCreated} 
            />
          </div>
        )}
      </div>

      <div className="carbon-market-info">
        <h3>How Trading Works</h3>
        <ol>
          <li>Browse available carbon credit offers in the "Buy" tab</li>
          <li>Create your own offers to sell excess carbon credits in the "Sell" tab</li>
          <li>Complete transactions using your token balance</li>
          <li>All transactions are securely recorded on the Internet Computer blockchain</li>
        </ol>
      </div>
    </div>
  );
};

export default CarbonMarket; 