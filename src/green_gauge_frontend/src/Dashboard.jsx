import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAllData, getUserProfile, isAuthenticated, login, MOCK_DATA } from './backendActor';
import { FaInfoCircle, FaBell, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data using the new getAllData function
      const fetchedData = await getAllData();
      setData(fetchedData);

      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        // Fetch user profile if authenticated
        const profile = await getUserProfile();
        if (profile && profile.Ok) {
          setUserProfile(profile.Ok);
        }
      }
      
      // Always set mock alerts for demo purposes
      setAlerts(MOCK_DATA.alerts);
      setIsUsingMockData(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      
      // Fall back to mock data
      setAlerts(MOCK_DATA.alerts);
      setIsUsingMockData(true);
      
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {
    try {
      await login();
      // Refresh data after login
      fetchData();
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  // Chart data
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Energy Consumption (kWh)',
        data: data.map(item => item.energy_consumption),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Carbon Emissions (kg)',
        data: data.map(item => item.carbon_emission),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Energy Consumption & Carbon Emissions',
      },
    },
  };

  // Calculate average efficiency score
  const averageEfficiency = data.length 
    ? Math.round(data.reduce((sum, item) => sum + item.efficiency_score, 0) / data.length) 
    : 0;

  // Get latest data entry
  const latestData = data.length ? data[data.length - 1] : null;
  
  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get alert icon based on severity
  const getAlertIcon = (severity) => {
    switch(severity) {
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'medium':
        return <FaBell className="text-orange-500" />;
      case 'low':
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="loader"></div></div>;

  if (error && !isUsingMockData) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <p>{error}</p>
        <button
          className="mt-2 text-white bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {isUsingMockData && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">You are viewing the dashboard with demo data.</span>
        </div>
      )}
      
      {!isLoggedIn && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">You are currently viewing as a guest. <button onClick={handleLogin} className="underline">Login</button> to see your personal carbon data.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Efficiency Score</h3>
          <div className="w-32 h-32 mx-auto">
            <CircularProgressbar
              value={averageEfficiency}
              text={`${averageEfficiency}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: averageEfficiency > 70 ? '#10B981' : averageEfficiency > 50 ? '#F59E0B' : '#EF4444',
                textColor: '#374151',
                trailColor: '#E5E7EB',
              })}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Energy Data</h3>
          {latestData ? (
            <div>
              <p className="mb-2"><span className="text-gray-600">Date:</span> {latestData.date}</p>
              <p className="mb-2"><span className="text-gray-600">Energy consumption:</span> {latestData.energy_consumption} kWh</p>
              <p className="mb-2"><span className="text-gray-600">Carbon emissions:</span> {latestData.carbon_emission} kg</p>
              <p className="mb-2"><span className="text-gray-600">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${latestData.alert === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {latestData.alert}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Carbon Trading Account</h3>
          {userProfile ? (
            <div>
              <p className="mb-2"><span className="text-gray-600">Carbon Allowance:</span> {Number(userProfile.carbon_allowance)} units</p>
              <p className="mb-2"><span className="text-gray-600">Carbon Emitted:</span> {Number(userProfile.carbon_emitted)} units</p>
              <p className="mb-2"><span className="text-gray-600">Available Carbon:</span> {Number(userProfile.carbon_allowance) - Number(userProfile.carbon_emitted)} units</p>
              <p className="mb-2"><span className="text-gray-600">Carbon Tokens:</span> {Number(userProfile.tokens)}</p>
              <button 
                onClick={() => navigate('/carbon')}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                Trade Carbon
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-3">{isLoggedIn ? "Loading account data..." : "Please log in to view your carbon trading account"}</p>
              {!isLoggedIn && (
                <button 
                  onClick={handleLogin}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Consumption & Emissions Trend</h3>
          <div className="h-80">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">
                {alerts.filter(alert => alert.status === 'new').length} new
              </span>
              <button 
                onClick={() => navigate('/alerts')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`border-l-4 p-4 rounded ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' : 
                  alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' : 
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                    </div>
                    <div>
                      {alert.status === 'new' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No alerts at this time</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Alerts & Actions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(alert.timestamp)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' : 
                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      alert.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/alerts/${alert.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {alert.status === 'new' ? 'Review' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">No alerts at this time</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
