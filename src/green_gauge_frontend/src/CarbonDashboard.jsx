import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserProfile,
  registerUser,
  recordEmission,
  rewardTokens,
  createTradeOffer,
  getTradeOffers,
  buyCarbon,
  isAuthenticated,
  login,
  logout
} from './backendActor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getEmissionHistory, getTokenBalanceHistory, getEfficiencyMetrics, getLatestAlerts } from './services/api';
import { formatDate } from './utils/dateUtils';
import Tooltip from './components/Tooltip';

const CarbonDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [tradeOffers, setTradeOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Form state
  const [emissionAmount, setEmissionAmount] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [buyTradeId, setBuyTradeId] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  const [profile, setProfile] = useState(null);
  const [emissionHistory, setEmissionHistory] = useState([]);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Check authentication and fetch user data
  const checkAuthAndFetchData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        // Fetch user profile
        const profile = await getUserProfile();
        
        if (profile && profile.Ok) {
          setUserProfile(profile.Ok);
          setIsRegistered(true);
        } else if (profile && profile.Err) {
          // User is authenticated but not registered
          setIsRegistered(false);
        }
      }
      
      // Fetch trade offers (available to all users)
      const offers = await getTradeOffers();
      setTradeOffers(offers);
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking auth and fetching data:', err);
      setError('Failed to load user data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(checkAuthAndFetchData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const userProfile = await getUserProfile();
      setProfile(userProfile);

      // Calculate timestamp ranges based on selected time range
      const now = Date.now() * 1000000; // Convert to nanoseconds
      let fromTimestamp;

      switch (timeRange) {
        case 'week':
          fromTimestamp = now - 7 * 24 * 60 * 60 * 1000000000;
          break;
        case 'month':
          fromTimestamp = now - 30 * 24 * 60 * 60 * 1000000000;
          break;
        case 'year':
          fromTimestamp = now - 365 * 24 * 60 * 60 * 1000000000;
          break;
        default:
          fromTimestamp = now - 7 * 24 * 60 * 60 * 1000000000;
      }

      // Fetch emission history
      const emissions = await getEmissionHistory(fromTimestamp, now);
      const formattedEmissions = emissions.map(point => ({
        date: formatDate(point.timestamp / 1000000), // Convert nanoseconds to milliseconds
        amount: point.amount
      }));
      setEmissionHistory(formattedEmissions);

      // Fetch token balance history
      const tokens = await getTokenBalanceHistory(fromTimestamp, now);
      const formattedTokens = tokens.map(point => ({
        date: formatDate(point.timestamp / 1000000),
        balance: point.balance
      }));
      setTokenHistory(formattedTokens);

      // Fetch efficiency metrics
      let days = 7;
      if (timeRange === 'month') days = 30;
      if (timeRange === 'year') days = 365;
      
      const metrics = await getEfficiencyMetrics(days);
      setEfficiencyMetrics(metrics);

      // Fetch latest alerts
      const latestAlerts = await getLatestAlerts();
      setAlerts(latestAlerts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setStatusMessage('Logging in...');
      await login();
      await checkAuthAndFetchData();
      setStatusMessage('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
      setStatusMessage('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setIsRegistered(false);
      setUserProfile(null);
      setStatusMessage('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleRegister = async () => {
    try {
      setStatusMessage('Registering...');
      const result = await registerUser();
      
      if (result && result.Ok !== undefined) {
        await checkAuthAndFetchData();
        setStatusMessage('Registration successful');
      } else {
        setError(result.Err || 'Failed to register');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
      setStatusMessage('');
    }
  };

  const handleRecordEmission = async (e) => {
    e.preventDefault();
    if (!emissionAmount || isNaN(Number(emissionAmount)) || Number(emissionAmount) <= 0) {
      setError('Please enter a valid emission amount');
      return;
    }
    
    try {
      setStatusMessage('Recording emission...');
      const result = await recordEmission(emissionAmount);
      
      if (result && result.Ok !== undefined) {
        await checkAuthAndFetchData();
        setEmissionAmount('');
        setStatusMessage('Emission recorded successfully');
      } else {
        setError(result.Err || 'Failed to record emission');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Record emission error:', err);
      setError('Failed to record emission. Please try again.');
      setStatusMessage('');
    }
  };

  const handleRewardTokens = async (e) => {
    e.preventDefault();
    if (!rewardAmount || isNaN(Number(rewardAmount)) || Number(rewardAmount) <= 0) {
      setError('Please enter a valid reward amount');
      return;
    }
    
    try {
      setStatusMessage('Rewarding tokens...');
      const result = await rewardTokens(rewardAmount);
      
      if (result && result.Ok !== undefined) {
        await checkAuthAndFetchData();
        setRewardAmount('');
        setStatusMessage('Tokens rewarded successfully');
      } else {
        setError(result.Err || 'Failed to reward tokens');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Reward tokens error:', err);
      setError('Failed to reward tokens. Please try again.');
      setStatusMessage('');
    }
  };

  const handleCreateTradeOffer = async (e) => {
    e.preventDefault();
    if (!sellAmount || isNaN(Number(sellAmount)) || Number(sellAmount) <= 0) {
      setError('Please enter a valid sell amount');
      return;
    }
    
    if (!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0) {
      setError('Please enter a valid price per unit');
      return;
    }
    
    try {
      setStatusMessage('Creating trade offer...');
      const result = await createTradeOffer(sellAmount, sellPrice);
      
      if (result && result.Ok !== undefined) {
        await checkAuthAndFetchData();
        setSellAmount('');
        setSellPrice('');
        setStatusMessage('Trade offer created successfully');
      } else {
        setError(result.Err || 'Failed to create trade offer');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Create trade offer error:', err);
      setError('Failed to create trade offer. Please try again.');
      setStatusMessage('');
    }
  };

  const handleBuyCarbon = async (e) => {
    e.preventDefault();
    if (!buyTradeId || isNaN(Number(buyTradeId)) || Number(buyTradeId) <= 0) {
      setError('Please enter a valid trade ID');
      return;
    }
    
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      setError('Please enter a valid buy amount');
      return;
    }
    
    try {
      setStatusMessage('Buying carbon...');
      const result = await buyCarbon(buyTradeId, buyAmount);
      
      if (result && result.Ok !== undefined) {
        await checkAuthAndFetchData();
        setBuyTradeId('');
        setBuyAmount('');
        setStatusMessage('Carbon purchased successfully');
      } else {
        setError(result.Err || 'Failed to buy carbon');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Buy carbon error:', err);
      setError('Failed to buy carbon. Please try again.');
      setStatusMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="mb-4">Please register to access your carbon dashboard.</p>
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-800">Carbon Trading Dashboard</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{statusMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setStatusMessage('')}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Green Gauge Carbon Trading</h2>
          <p className="mb-4">Please log in to start trading carbon and managing your emissions.</p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none"
          >
            Login with Internet Identity
          </button>
        </div>
      ) : !isRegistered ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Complete Registration</h2>
          <p className="mb-4">You need to register to use the carbon trading platform.</p>
          <button
            onClick={handleRegister}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none"
          >
            Register Account
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Carbon Profile</h2>
              {userProfile && (
                <div>
                  <div className="flex justify-between mb-4 py-2 border-b">
                    <span>Carbon Allowance:</span>
                    <span className="font-semibold">{Number(userProfile.carbon_allowance)} units</span>
                  </div>
                  <div className="flex justify-between mb-4 py-2 border-b">
                    <span>Carbon Emitted:</span>
                    <span className="font-semibold">{Number(userProfile.carbon_emitted)} units</span>
                  </div>
                  <div className="flex justify-between mb-4 py-2 border-b">
                    <span>Available Carbon:</span>
                    <span className="font-semibold">{Number(userProfile.carbon_allowance) - Number(userProfile.carbon_emitted)} units</span>
                  </div>
                  <div className="flex justify-between mb-4 py-2 border-b">
                    <span>Carbon Tokens:</span>
                    <span className="font-semibold">{Number(userProfile.tokens)}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Record Carbon Emission</h2>
              <form onSubmit={handleRecordEmission}>
                <div className="mb-4">
                  <label htmlFor="emissionAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Emission Amount (units):
                  </label>
                  <input
                    type="number"
                    id="emissionAmount"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={emissionAmount}
                    onChange={(e) => setEmissionAmount(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none w-full"
                >
                  Record Emission
                </button>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Reward Tokens</h3>
                <form onSubmit={handleRewardTokens}>
                  <div className="mb-4">
                    <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Token Amount:
                    </label>
                    <input
                      type="number"
                      id="rewardAmount"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none w-full"
                  >
                    Claim Reward
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Sell Carbon</h2>
              <form onSubmit={handleCreateTradeOffer}>
                <div className="mb-4">
                  <label htmlFor="sellAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Carbon Amount (units):
                  </label>
                  <input
                    type="number"
                    id="sellAmount"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Unit (tokens):
                  </label>
                  <input
                    type="number"
                    id="sellPrice"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none w-full"
                >
                  Create Trade Offer
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Buy Carbon</h2>
              <form onSubmit={handleBuyCarbon}>
                <div className="mb-4">
                  <label htmlFor="buyTradeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Trade ID:
                  </label>
                  <input
                    type="number"
                    id="buyTradeId"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={buyTradeId}
                    onChange={(e) => setBuyTradeId(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="buyAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Buy (units):
                  </label>
                  <input
                    type="number"
                    id="buyAmount"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none w-full"
                >
                  Buy Carbon
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Available Carbon Trades</h2>
        {tradeOffers.length === 0 ? (
          <p className="text-gray-500">No trade offers available at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbon Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Unit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tradeOffers.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.seller.substring(0, 10)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.price_per_unit} tokens</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount * trade.price_per_unit} tokens</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setBuyTradeId(trade.id.toString());
                          setBuyAmount(trade.amount.toString());
                        }}
                        className={`py-1 px-3 rounded text-xs font-semibold ${isLoggedIn && isRegistered ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        disabled={!isLoggedIn || !isRegistered}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 rounded ${timeRange === 'year' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Carbon Allowance</h2>
          <p className="text-3xl font-bold text-green-600">{profile.carbon_allowance} units</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Carbon Emitted</h2>
          <p className="text-3xl font-bold text-red-600">{profile.carbon_emitted} units</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Token Balance</h2>
          <p className="text-3xl font-bold text-blue-600">{profile.tokens} tokens</p>
        </div>
      </div>

      {/* Emissions Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Carbon Emissions Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={emissionHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Carbon Emitted"
                stroke="#ef4444" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Balance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Token Balance History</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tokenHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                name="Token Balance"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficiency Metrics Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Energy Efficiency Metrics</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={efficiencyMetrics}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumption" name="Energy Consumption" fill="#3b82f6" />
              <Bar dataKey="carbon_emitted" name="Carbon Emitted" fill="#ef4444" />
              <Bar dataKey="efficiency_score" name="Efficiency Score" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg ${
                  alert.severity === 'high' 
                    ? 'bg-red-100 border-l-4 border-red-500' 
                    : alert.severity === 'medium'
                    ? 'bg-yellow-100 border-l-4 border-yellow-500'
                    : 'bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">{alert.message}</h3>
                  <span className="text-sm text-gray-500">{formatDate(alert.timestamp / 1000000)}</span>
                </div>
              </div>
            ))}
            <button 
              className="text-green-600 hover:text-green-800 font-semibold"
              onClick={() => navigate('/alerts')}
            >
              View All Alerts
            </button>
          </div>
        ) : (
          <p className="text-gray-500">No recent alerts.</p>
        )}
      </div>
    </div>
  );
};

export default CarbonDashboard; 