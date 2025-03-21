import React, { useState, useEffect } from 'react';
import { buyTradeOffer, getAllTradeOffers } from '../services/api';
import '../styles/TradeList.css';

const TradeList = ({ userProfile, onTradeCompleted }) => {
  const [tradeOffers, setTradeOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBuyId, setActiveBuyId] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');

  useEffect(() => {
    fetchTradeOffers();
  }, []);

  const fetchTradeOffers = async () => {
    try {
      setLoading(true);
      const result = await getAllTradeOffers();
      
      if (result.Ok) {
        setTradeOffers(result.Ok);
      } else if (result.Err) {
        setError(result.Err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load trade offers');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (offerId) => {
    setActiveBuyId(offerId);
    setBuyAmount('');
    setBuyError('');
    setBuySuccess('');
  };

  const handleBuyCancel = () => {
    setActiveBuyId(null);
    setBuyAmount('');
    setBuyError('');
    setBuySuccess('');
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    
    if (!activeBuyId) return;
    
    try {
      setBuyLoading(true);
      setBuyError('');
      
      const result = await buyTradeOffer(activeBuyId);
      
      if (result.Ok !== undefined) {
        setBuySuccess('Trade completed successfully!');
        setBuyAmount('');
        setActiveBuyId(null);
        
        // Refresh trade offers
        fetchTradeOffers();
        
        // Call the callback function to refresh user profile
        if (onTradeCompleted) {
          onTradeCompleted();
        }
      } else if (result.Err) {
        setBuyError(result.Err);
      }
    } catch (err) {
      setBuyError(err.message || 'Failed to complete trade');
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) {
    return <div className="trade-list-loading">Loading trade offers...</div>;
  }

  if (error) {
    return <div className="trade-list-error">{error}</div>;
  }

  if (tradeOffers.length === 0) {
    return <div className="trade-list-empty">No trade offers available at the moment.</div>;
  }

  // Get current user's principal
  const userPrincipal = userProfile ? userProfile.principal : '';
  
  return (
    <div className="trade-list">
      {buySuccess && <div className="trade-success">{buySuccess}</div>}
      
      <table className="trade-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Price/Unit</th>
            <th>Total Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tradeOffers.map((offer) => {
            const isOwner = offer.seller.toString() === userPrincipal;
            const totalValue = offer.amount * offer.price_per_unit;
            const hasEnoughTokens = userProfile && userProfile.tokens >= totalValue;
            
            return (
              <tr key={offer.id} className={isOwner ? 'own-offer' : ''}>
                <td>{offer.id.toString()}</td>
                <td>{offer.amount.toString()} units</td>
                <td>{offer.price_per_unit.toString()} tokens</td>
                <td>{totalValue.toString()} tokens</td>
                <td>
                  {isOwner ? (
                    <span className="owner-label">Your offer</span>
                  ) : activeBuyId === offer.id ? (
                    <div className="buy-form">
                      {buyError && <div className="buy-error">{buyError}</div>}
                      <form onSubmit={handleBuySubmit}>
                        <button 
                          type="submit" 
                          className="confirm-button"
                          disabled={buyLoading || !hasEnoughTokens}
                        >
                          {buyLoading ? 'Processing...' : 'Confirm Buy'}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={handleBuyCancel}
                          disabled={buyLoading}
                        >
                          Cancel
                        </button>
                        {!hasEnoughTokens && <div className="token-warning">Insufficient tokens</div>}
                      </form>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBuyClick(offer.id)} 
                      className="buy-button"
                      disabled={!userProfile}
                    >
                      Buy
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradeList; 