import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { useThreshold } from '../thresholdcontext';
import { Link, useLocation } from 'react-router-dom';
import NavigationBar from '../NavigationBar';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = ({ isAuthenticated, setIsAuthenticated }) => {
  const location = useLocation();
  const { efficiencyThreshold } = useThreshold();
  const THRESHOLD = efficiencyThreshold;
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // FOR SMOOTH SCROLLING
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
    else window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    // Only run chart initialization if the elements exist in the DOM
    const energyChartElement = document.getElementById('energyChart');
    const carbonOffsetChartElement = document.getElementById('carbonOffsetChart');
    const efficiencyPieChartElement = document.getElementById('efficiencyPieChart');
    
    if (!energyChartElement || !carbonOffsetChartElement || !efficiencyPieChartElement) {
      console.error("One or more chart elements not found in the DOM");
      return;
    }

    const ctxEnergy = energyChartElement.getContext('2d');
    const energyChart = new Chart(ctxEnergy, {
      type: 'line',
      data: {
        labels: ['Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
        datasets: [{
          label: 'Electrical Energy Consumption (kWh)',
          data: [80, 60, 90, 85, 95, 170],
          backgroundColor: 'rgba(28, 118, 124, 0.1)',
          borderColor: '#1C767C',
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: '#1C767C',
          pointBorderColor: '#1C767C',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Days' } },
          y: { title: { display: true, text: 'Electrical Energy Consumption (kWh)' }, beginAtZero: true }
        }
      }
    });

    const ctxCarbonOffset = carbonOffsetChartElement.getContext('2d');
    const carbonOffsetChart = new Chart(ctxCarbonOffset, {
      type: 'bar',
      data: {
        labels: ['5', '10', '15', '20', '25', '30'],
        datasets: [{
          label: 'Tons of CO₂ offset',
          data: [20, 35, 45, 30, 40, 50],
          backgroundColor: 'rgba(140, 167, 255, 0.5)',
          borderColor: 'rgba(140, 167, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Time (Days)', color: '#6B7280', font: { size: 14 } }, grid: { display: false } },
          y: { title: { display: true, text: 'Tons of CO₂ offset', color: '#6B7280', font: { size: 14 } }, beginAtZero: true, grid: { display: false } }
        }
      }
    });

    const ctxEfficiencyPie = efficiencyPieChartElement.getContext('2d');
    const efficiencyPieChart = new Chart(ctxEfficiencyPie, {
      type: 'pie',
      data: {
        labels: ['Bad Days', 'Good Days'],
        datasets: [{ data: [0, 0], backgroundColor: ['#b22222', '#008000'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const fetchDataAndUpdateCharts = async () => {
      try {
        // Try to fetch from local development API if available
        let data = [];
        
        try {
          // First try to fetch from local development API if available
          const blockchain_response = await axios.get('http://127.0.0.1:5000/getAllData', { 
            withCredentials: true,
            timeout: 5000 // 5 second timeout
          });
          console.log("Blockchain response:", blockchain_response.data.data);
          data = blockchain_response.data.data;
        } catch (localApiError) {
          console.warn("Could not fetch from local API, using mock data:", localApiError);
          // Fallback to mock data
          data = [
            { date: '2024-06-01', energyConsumption: 80, carbonEmission: 20, efficiencyScore: 75, alert: 'Normal', actionRequired: null, resolution: null },
            { date: '2024-06-06', energyConsumption: 60, carbonEmission: 35, efficiencyScore: 90, alert: 'Normal', actionRequired: null, resolution: null },
            { date: '2024-06-11', energyConsumption: 90, carbonEmission: 45, efficiencyScore: 65, alert: 'Warning', actionRequired: 'Check cooling system', resolution: 'Pending' },
            { date: '2024-06-16', energyConsumption: 85, carbonEmission: 30, efficiencyScore: 85, alert: 'Normal', actionRequired: null, resolution: null },
            { date: '2024-06-21', energyConsumption: 95, carbonEmission: 40, efficiencyScore: 70, alert: 'Alert', actionRequired: 'Optimize heaters', resolution: 'Fixed' },
            { date: '2024-06-26', energyConsumption: 170, carbonEmission: 50, efficiencyScore: 55, alert: 'Critical', actionRequired: 'Immediate attention required', resolution: null }
          ];
        }

        updateEnergyChart(data);
        updateCarbonOffsetChart(data);
        updateEfficiencyPieChart(data, efficiencyPieChart);
        updateAlerts(data);
      } catch (error) {
        console.error('Error in fetch and update process:', error);
      }
    };

    function updateEnergyChart(data) {
      const energyData = data.map(item => item.energyConsumption);
      energyChart.data.datasets[0].data = energyData;
      console.log("Energy Data:", energyData);
      energyChart.update();
    }

    function updateCarbonOffsetChart(data) {
      const carbonData = data.map(item => item.carbonEmission);
      carbonOffsetChart.data.datasets[0].data = carbonData;
      carbonOffsetChart.update();
    }

    function updateEfficiencyPieChart(data, pieChart) {
      const efficiencyScores = data.map(item => item.efficiencyScore);
      const goodDays = efficiencyScores.filter(score => score > THRESHOLD).length;
      const badDays = efficiencyScores.length - goodDays;

      pieChart.data.datasets[0].data = [badDays, goodDays];
      pieChart.update();
    }

    function updateAlerts(data) {
      const alertsTable = document.querySelector('table tbody');
      if (!alertsTable) {
        console.error("Alerts table not found in DOM");
        return;
      }
      
      alertsTable.innerHTML = '';

      const filteredAlerts = data.filter(alert =>
        alert.efficiencyScore >= THRESHOLD && (alert.actionRequired !== 'Marked as resolved' && alert.actionRequired !== null)
      ).slice(0, 3);

      filteredAlerts.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-2 lg:px-4 py-2">${new Date(alert.date).toLocaleDateString()}</td>
          <td class="px-2 lg:px-4 py-2">${alert.alert}</td>
          <td class="px-2 lg:px-4 py-2">${alert.actionRequired || 'N/A'}</td>
          <td class="px-2 lg:px-4 py-2">${alert.resolution || 'Pending'}</td>
        `;
        alertsTable.appendChild(row);
      });

      // If no alerts match criteria, show a message
      if (filteredAlerts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td colspan="4" class="px-2 lg:px-4 py-2 text-center text-gray-500">No active alerts at this time</td>
        `;
        alertsTable.appendChild(row);
      }
    }

    // Initial fetch and set up interval
    const intervalId = setInterval(fetchDataAndUpdateCharts, 60000);
    fetchDataAndUpdateCharts();

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      if (energyChart) energyChart.destroy();
      if (carbonOffsetChart) carbonOffsetChart.destroy();
      if (efficiencyPieChart) efficiencyPieChart.destroy();
    };
  }, [THRESHOLD]);

  return (
    <div className="dashboard-container">
      <NavigationBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className='flex'>
        <aside className="w-60 h-screen bg-green-50 fixed top-0 left-0 border-r-4 shadow-xl hidden lg:block">
          <div className="mt-24">
            <nav className="flex flex-col space-y-4 px-4">
              <button onClick={() => openModal("Overview")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer rounded">
                Overview
              </button>
              <button onClick={() => openModal("Energy Usage")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer rounded">
                Energy Usage
              </button>
              <button onClick={() => openModal("Carbon Offset")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer rounded">
                Carbon Offset
              </button>
              <button onClick={() => openModal("Alerts")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer rounded">
                Alerts
              </button>
            </nav>
          </div>
        </aside>

        {activeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 sm:w-2/3 lg:w-1/3 relative">
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
              <h2 className="text-2xl font-semibold mb-4">{activeModal}</h2>
              <p className="text-gray-700">
                {activeModal === "Overview" && (
                  <div>
                    <p>
                      The website is a renewable energy monitoring platform that provides alerts based on companies' energy consumption relative to their carbon emission ratios. It aims to promote sustainable practices and support the green revolution by helping organizations optimize their energy use and reduce their environmental impact.
                    </p>
                    <Link to="/dashboard#hi">
                      <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600">
                        Go to Overview Page
                      </button>
                    </Link>
                  </div>
                )}

                {activeModal === "Energy Usage" && (
                  <div>
                    <p>
                      Details about energy usage and metrics are displayed here: Normal Consumption: less than 500 kWh; Normal Efficiency Score: less than 1 kg/KWh
                    </p>
                    <Link to="/dashboard#energyChart">
                      <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600">
                        Go to Energy Usage Page
                      </button>
                    </Link>
                  </div>
                )}

                {activeModal === "Carbon Offset" && (
                  <div>
                    <p>
                      Information about carbon offset initiatives and goals: Normal Range: below 0.5 kg CO₂ per kWh; Hazardous Range: Above 0.8 kg CO₂ per kWh
                    </p>
                    <Link to="/dashboard#carbonOffsetChart">
                      <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600">
                        Go to Carbon Offset Page
                      </button>
                    </Link>
                  </div>
                )}
                {activeModal === "Alerts" && (
                  <div>
                    <p>View alerts and notifications regarding energy and usage updates.</p>
                    <Link to="/alerts">
                      <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600">
                        Go to Alerts Page
                      </button>
                    </Link>
                  </div>
                )}
              </p>
            </div>
          </div>
        )}

        <main className="lg:ml-64 w-full max-w-full px-4 sm:px-6 md:px-10 space-y-10 mt-16" id="hi">
          <h1 className="text-3xl lg:text-4xl text-[#2D6A4F] font-bold mt-20">Dashboard</h1>
          <h2 className="text-xl lg:text-2xl font-bold mb-6">Real-Time Data Overview</h2>

          <div className="mb-10">
            <p className="text-lg lg:text-xl font-semibold text-[#1C767C] mb-4">• Energy Consumption (Last 30 Days)</p>
            <div className="bg-[#EDF7ED] p-4 lg:p-6 rounded-xl shadow-lg">
              <canvas id="energyChart"></canvas>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-lg lg:text-xl font-semibold text-[#1C767C] mb-4">• Carbon Offset (Last 30 Days)</p>
            <div className="bg-[#E0F7FA] p-4 lg:p-6 rounded-xl shadow-lg">
              <canvas id="carbonOffsetChart"></canvas>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-lg lg:text-xl font-semibold text-[#1C767C] mb-4">• Energy Efficiency Credit Score</p>
            <div className="chart-container flex flex-col justify-center items-center mx-auto h-56 w-56 md:h-64 md:w-64 lg:h-80 lg:w-80 xl:h-96 xl:w-96">
              <div className="chart-box">
                <canvas id="efficiencyPieChart"></canvas>
                <p className="text-base lg:text-lg font-semibold text-[#1C767C] mt-4 text-center">Efficiency Threshold: {THRESHOLD}</p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-lg lg:text-xl font-semibold text-[#1C767C] mb-4">• Important Alerts</p>
            <div className="bg-[#F3F4F6] p-4 lg:p-6 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                    <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action Required</th>
                    <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolution</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200"></tbody>
              </table>
              <div className="text-left mt-4">
                <Link 
                  to="/alerts" 
                  className="inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Show All
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#D5E7FF] text-gray-700 p-5 -ml-20 -mr-10">
            <div className="container flex justify-between items-center">
              {/* Left: Footer Links */}
              <ul className="text-left mx-10 flex space-x-10 py-10">
                <li>
                  <Link to="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contactus" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacypolicy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/termsconditions" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>

              {/* Right: Copyright Text */}
              <p className="text-center text-gray-500 text-sm">
                &copy; 2024 Energy Credit & Carbon Offset Tracking. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 