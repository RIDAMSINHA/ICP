import React, { useState } from 'react';
import { rewardTokens } from '../services/api';
import '../styles/TokenReward.css';

const TokenReward = ({ onTokensRewarded }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await rewardTokens(Number(amount));
      
      if (result.Ok !== undefined) {
        setSuccess(`Successfully rewarded ${amount} tokens to your account`);
        setAmount('');
        
        // Call the callback function to refresh user profile
        if (onTokensRewarded) {
          onTokensRewarded();
        }
      } else if (result.Err) {
        setError(result.Err);
      }
    } catch (err) {
      setError(err.message || 'Failed to reward tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-reward">
      <h2>Reward Tokens (Admin)</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tokenAmount">Token Amount:</label>
          <input
            type="number"
            id="tokenAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={loading}
            min="1"
            required
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Rewarding...' : 'Reward Tokens'}
        </button>
      </form>
    </div>
  );
};

export default TokenReward; 