import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAllData, getUserProfile, isAuthenticated, login } from './backendActor';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
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

  if (loading) return <div className="flex justify-center mt-20"><div className="loader"></div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Consumption & Emissions Trend</h3>
        <div className="h-80">
          <Line options={chartOptions} data={chartData} />
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.filter(item => item.alert !== "Normal").map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.alert === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.alert}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.action_required}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.resolution || (
                      <button
                        onClick={() => navigate(`/alerts`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Take Action
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.filter(item => item.alert !== "Normal").length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">No alerts at this time</td>
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
