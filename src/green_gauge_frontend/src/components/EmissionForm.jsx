import React, { useState } from 'react';
import { recordEmission } from '../services/api';
import '../styles/EmissionForm.css';

const EmissionForm = ({ onEmissionRecorded }) => {
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
      
      const result = await recordEmission(Number(amount));
      
      if (result.Ok !== undefined) {
        setSuccess(`Successfully recorded ${amount} units of carbon emission`);
        setAmount('');
        
        // Call the callback function to refresh user profile
        if (onEmissionRecorded) {
          onEmissionRecorded();
        }
      } else if (result.Err) {
        setError(result.Err);
      }
    } catch (err) {
      setError(err.message || 'Failed to record emission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emission-form">
      <h2>Record Carbon Emission</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emissionAmount">Emission Amount (units):</label>
          <input
            type="number"
            id="emissionAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={loading}
            min="1"
            required
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Recording...' : 'Record Emission'}
        </button>
      </form>
    </div>
  );
};

export default EmissionForm; 