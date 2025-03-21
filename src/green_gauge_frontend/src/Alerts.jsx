import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllData, resolveAction, getDataAboveLimit } from './backendActor';

const Alerts = ({ isAuthenticated, setIsAuthenticated }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [status, setStatus] = useState('Normal');
  const [showDialog, setShowDialog] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState('');

  const threshold = 500;

  useEffect(() => {
    // Scroll to the top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  const fetchAlerts = async () => {
    try {
      // Use our backendActor instead of axios
      const response = await getDataAboveLimit(threshold);
      console.log("Data above limit:", response);

      if (Array.isArray(response)) {
        const sortedAlerts = response.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAlerts(sortedAlerts);
        setFilteredAlerts(sortedAlerts);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const showPendingAlerts = () => {
    setFilteredAlerts(alerts.filter(alert => !alert.resolution || alert.resolution === 'N/A'));
  };

  const showResolvedAlerts = () => {
    setFilteredAlerts(alerts.filter(alert => alert.resolution && alert.resolution !== 'N/A' && alert.resolution !== 'Already Efficient.'));
  };

  const showAllAlerts = () => {
    setFilteredAlerts(alerts);
  };

  const fetchRealTimeData = async () => {
    try {
      // Use our backendActor instead of axios
      const allData = await getAllData();
      console.log("All data:", allData);

      if (Array.isArray(allData) && allData.length > 0) {
        // Sort the data in descending order by date
        allData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get the latest data
        const latestData = allData[0];
        console.log("Latest Data:", latestData);

        if (latestData && latestData.energy_consumption) {
          updateRealTimeData(latestData.energy_consumption);
        } else {
          console.error('Failed to fetch valid data:', latestData);
        }
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const updateRealTimeData = (value) => {
    const realTimeElement = document.getElementById('realTimeData');
    if (realTimeElement) {
      realTimeElement.innerHTML = `Electricity Consumption <br> Observed: ${value} kWh <br> Normal Consumption: < 500 kWh <br> Normal Efficiency Score: < 1 kg/KWh`;
      updateStatus(value >= threshold ? 'Alert' : 'Normal', value);
    }
  };

  const updateStatus = (status, value) => {
    setStatus(status);
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.innerText = `Status: ${status}`;
    }
  };

  const handleResolveAlert = async () => {
    if (currentAlert) {
      try {
        // Use our backendActor instead of axios
        const response = await resolveAction(currentAlert.id, resolutionDetails);
        console.log("Resolution response:", response);

        setShowDialog(false);
        setResolutionDetails('');
        fetchAlerts(); // Re-fetch alerts to update the UI after resolving
      } catch (error) {
        console.error('Error resolving alert:', error);
      }
    }
  };

  const displayAlerts = () => {
    return filteredAlerts
      .filter(alert => !alert.resolution || alert.resolution !== 'Already Efficient.')
      .map(alert => (
        <div key={alert.id} className={!alert.resolution || alert.resolution === 'N/A' ? 'alert p-4 bg-red-100 border-l-4 border-l-red-600 rounded-lg shadow-lg mb-4' : 'resolved-alert p-4 bg-green-100 rounded-lg shadow-md border-l-4 border-l-green-600 mb-4'}>
          <p className="font-semibold"><strong>Alert:</strong> {alert.alert}</p>
          <p><strong>Efficiency Score:</strong> {alert.efficiency_score}</p>
          <p><strong>Current Consumption:</strong> {alert.energy_consumption} kWh</p>
          <p><strong>Status:</strong> {!alert.resolution || alert.resolution === 'N/A' ? 'Pending' : 'Resolved'}</p>
          {(!alert.resolution || alert.resolution === 'N/A') && (
            <button onClick={() => {
              setCurrentAlert(alert);
              setShowDialog(true);
            }} className="bg-green-500 text-white px-4 py-2 mt-3 rounded hover:bg-green-600">
              Mark as Resolved
            </button>
          )}
        </div>
      ));
  };

  useEffect(() => {
    fetchAlerts();
    fetchRealTimeData();
    const intervalId = setInterval(fetchRealTimeData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Font styles */}
      <style jsx>{`
        .alerts-container {
          font-family: "Hanuman", serif;
          font-weight: 400;
          font-style: normal;
        }
      `}</style>

      <div className='alerts-container mt-20'>
        <div className="p-6 bg-white shadow-lg fixed w-full z-10 flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-700">Alerts Dashboard</h1>
          <div className="flex space-x-4">
            <button onClick={showPendingAlerts} className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500">Pending</button>
            <button onClick={showResolvedAlerts} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Resolved</button>
            <button onClick={showAllAlerts} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">All</button>
          </div>
        </div>

        <div className="flex pt-32 px-10 space-x-6">
          <div className="w-1/4 p-5 bg-white rounded-lg shadow-md sticky top-24 h-64">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Real-time Data</h2>
            <div id="realTimeData" className="space-y-3 text-gray-600">
            </div>
            <div id="status" className="mt-4 text-gray-800 font-semibold">
              Status: {status}
            </div>
          </div>

          <div className="w-2/4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Alerts</h2>
            <div id="alertsSection" className="space-y-4">
              {displayAlerts()}
            </div>
          </div>
        </div>

        {showDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl mb-4 font-semibold">Resolve Alert</h2>
              <textarea
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                className="border p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter resolution details"
              />
              <div className="flex justify-end">
                <button onClick={() => setShowDialog(false)} className="bg-gray-400 text-white px-4 py-2 rounded mr-2 hover:bg-gray-500">Cancel</button>
                <button onClick={handleResolveAlert} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Resolve</button>
              </div>
            </div>
          </div>
        )}
        <br /><br />
        <footer className="bg-[#D5E7FF] text-gray-700 p-5 ">
          <div className="container flex justify-between items-center">
            <ul className="text-left mx-10 flex space-x-10 py-10">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/contactus" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/privacypolicy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/termsconditions" className="hover:underline">Terms & Conditions</Link></li>
            </ul>
            <p className="text-center text-gray-500 text-sm">&copy; 2024 Energy Credit & Carbon Offset Tracking. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Alerts;
