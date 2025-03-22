import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getUserProfile, getAllData, getEfficiencyMetrics, getAlerts, MOCK_DATA } from '../services/api';
import NavigationBar from '../NavigationBar';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [data, setData] = useState([]);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
  };

  // Chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Energy Consumption (kWh)',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Carbon Emissions (kg)',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Efficiency Score',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  });

  // Latest data for the summary card
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get data from backend
        try {
          console.log("Fetching user profile...");
          const profileResult = await getUserProfile();
          if (profileResult.Ok) {
            setUserProfile(profileResult.Ok);
          } else {
            throw new Error(profileResult.Err || "Failed to fetch user profile");
          }
          
          console.log("Fetching efficiency metrics...");
          const metricsResult = await getEfficiencyMetrics(30); // Last 30 days
          if (metricsResult.Ok) {
            setEfficiencyMetrics(metricsResult.Ok);
          } else {
            throw new Error(metricsResult.Err || "Failed to fetch efficiency metrics");
          }
          
          console.log("Fetching alerts...");
          const alertsResult = await getAlerts();
          if (alertsResult.Ok) {
            setAlerts(alertsResult.Ok);
          } else {
            throw new Error(alertsResult.Err || "Failed to fetch alerts");
          }
          
          console.log("Fetching all data...");
          const allDataResult = await getAllData();
          if (allDataResult.Ok) {
            setData(allDataResult.Ok);
          } else {
            throw new Error(allDataResult.Err || "Failed to fetch all data");
          }
        } catch (err) {
          console.error("Error fetching data from backend:", err);
          console.log("Using mock data instead");
          
          // Fall back to mock data
          setUserProfile(MOCK_DATA.userProfile);
          setEfficiencyMetrics(MOCK_DATA.efficiencyMetrics);
          setAlerts(MOCK_DATA.alerts);
          
          // Create sample data points from the mock data
          const mockDataPoints = MOCK_DATA.efficiencyMetrics.map((metric, index) => ({
            id: index + 1,
            date: metric.date,
            energy_consumption: metric.consumption,
            carbon_emission: metric.carbon_emitted,
            efficiency: metric.efficiency_score,
            alert: metric.efficiency_score < 70 ? "High Usage" : "Normal",
            action_required: metric.efficiency_score < 70 ? "Reduce energy consumption" : "",
            resolution: ""
          }));
          
          setData(mockDataPoints);
          setIsUsingMockData(true);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Update chart data when efficiency metrics change
  useEffect(() => {
    if (efficiencyMetrics && efficiencyMetrics.length > 0) {
      // Format data for chart
      const labels = efficiencyMetrics.map(metric => metric.date);
      const consumptionData = efficiencyMetrics.map(metric => metric.consumption);
      const emissionsData = efficiencyMetrics.map(metric => metric.carbon_emitted);
      const efficiencyData = efficiencyMetrics.map(metric => metric.efficiency_score);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Energy Consumption (kWh)',
            data: consumptionData,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'Carbon Emissions (kg)',
            data: emissionsData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Efficiency Score',
            data: efficiencyData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }
        ],
      });
    }
  }, [efficiencyMetrics]);

  // Set latest data when all data changes
  useEffect(() => {
    if (data && data.length > 0) {
      // Find the most recent data point
      const sortedData = [...data].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      setLatestData(sortedData[0]);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Dashboard</h1>
      
      {/* {isUsingMockData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Note:</strong>
          <span className="block sm:inline"> Using demo data. Backend connection unavailable.</span>
                  </div>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Energy Data</h3>
          {latestData ? (
                  <div>
              <p className="mb-2"><span className="text-gray-600">Date:</span> {latestData.date}</p>
              <p className="mb-2"><span className="text-gray-600">Energy consumption:</span> {latestData.energy_consumption.toFixed(2)} kWh</p>
              <p className="mb-2"><span className="text-gray-600">Carbon emissions:</span> {latestData.carbon_emission.toFixed(2)} kg</p>
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
              <p className="mb-2"><span className="text-gray-600">Carbon Allowance:</span> {userProfile.carbon_allowance.toLocaleString()} units</p>
              <p className="mb-2"><span className="text-gray-600">Carbon Emitted:</span> {userProfile.carbon_emitted.toLocaleString()} units</p>
              <p className="mb-2"><span className="text-gray-600">Available Carbon:</span> {(userProfile.carbon_allowance - userProfile.carbon_emitted).toLocaleString()} units</p>
              <p className="mb-2"><span className="text-gray-600">Carbon Tokens:</span> {userProfile.tokens.toLocaleString()}</p>
              <button 
                onClick={() => navigate('/carbon')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                Trade Carbon
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-3">Please log in to view your carbon trading account</p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Login
              </button>
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
              {data.filter(item => item.alert !== "Normal").map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.alert === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.alert}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.action_required || "Reduce energy consumption"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.resolution || (
                      <button
                        onClick={() => navigate('/alerts')}
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