import React from 'react';
import '../styles/UserProfile.css';

const UserProfile = ({ user, loading, error }) => {
  if (loading) {
    return <div className="user-profile-loading">Loading user profile...</div>;
  }

  if (error) {
    return <div className="user-profile-error">{error}</div>;
  }

  if (!user) {
    return <div className="user-profile-error">User profile not found</div>;
  }

  // Calculate usage percentage for the meter
  const calculateUsagePercentage = (used, total) => {
    if (total <= 0) return 0;
    const percentage = (used / total) * 100;
    return Math.min(percentage, 100); // Ensure it doesn't exceed 100%
  };

  // Determine the level for color coding (low, medium, high)
  const getUsageLevel = (percentage) => {
    if (percentage < 30) return 'low';
    if (percentage < 70) return 'medium';
    return 'high';
  };

  const carbonUsagePercentage = calculateUsagePercentage(
    user.carbonUnits.used,
    user.carbonUnits.total
  );
  const carbonUsageLevel = getUsageLevel(carbonUsagePercentage);

  return (
    <div className="user-profile">
      <h2>Carbon Profile</h2>
      
      <div className="profile-stats">
        <div className="stat-card">
          <h3>Carbon Balance</h3>
          <p className="stat-value">{user.carbonUnits.available} units</p>
        </div>
        
        <div className="stat-card">
          <h3>Carbon Used</h3>
          <p className="stat-value">{user.carbonUnits.used} units</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Allocated</h3>
          <p className="stat-value">{user.carbonUnits.total} units</p>
        </div>
        
        <div className="stat-card">
          <h3>Carbon Usage</h3>
          <div className="usage-meter">
            <div className="meter-container">
              <div 
                className={`meter-fill ${carbonUsageLevel}`} 
                style={{ width: `${carbonUsagePercentage}%` }}
              ></div>
            </div>
            <span className="meter-label">{carbonUsagePercentage.toFixed(1)}% Used</span>
          </div>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <h3>Token Balance</h3>
          <p className="stat-value">{user.tokens} tokens</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Trades</h3>
          <p className="stat-value">{user.totalTrades || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 