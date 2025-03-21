import React, { useState } from 'react';
import { createTradeOffer } from '../services/api';
import '../styles/TradeOfferForm.css';

const TradeOfferForm = ({ availableCarbon, onOfferCreated }) => {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError('Please enter a valid price greater than zero');
      return;
    }
    
    if (Number(amount) > availableCarbon) {
      setError(`You only have ${availableCarbon} carbon units available to trade`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await createTradeOffer(Number(amount), Number(price));
      
      if (result.Ok !== undefined) {
        const tradeId = Number(result.Ok);
        setSuccess(`Trade offer created successfully with ID: ${tradeId}`);
        setAmount('');
        setPrice('');
        
        // Call the callback function to refresh trade offers
        if (onOfferCreated) {
          onOfferCreated();
        }
      } else if (result.Err) {
        setError(result.Err);
      }
    } catch (err) {
      setError(err.message || 'Failed to create trade offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-offer-form">
      <h2>Create Trade Offer</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tradeAmount">Carbon Amount (units):</label>
          <input
            type="number"
            id="tradeAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to sell"
            disabled={loading}
            min="1"
            max={availableCarbon}
            required
          />
          <small>Available: {availableCarbon} units</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="tradePrice">Price per Unit (tokens):</label>
          <input
            type="number"
            id="tradePrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price per unit"
            disabled={loading}
            min="1"
            required
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={loading || availableCarbon <= 0}>
          {loading ? 'Creating offer...' : 'Create Offer'}
        </button>
      </form>
    </div>
  );
};

export default TradeOfferForm; 