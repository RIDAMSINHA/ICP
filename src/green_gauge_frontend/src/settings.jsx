import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import backend from './backendActor'; // Import the ICP actor for backend calls

const Settings = ({ isAuthenticated, setIsAuthenticated }) => {
  // State for modal and file upload responses
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState('');

  // State for the "store data" form inputs and response message
  const [storeData, setStoreData] = useState({
    date: '',
    energyConsumption: '',
    carbonEmission: '',
    efficiencyScore: '',
  });
  const [storeResponse, setStoreResponse] = useState('');

  // Function to update form state when a field changes
  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle form submission for storing data using the ICP actor
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      const { date, energyConsumption, carbonEmission, efficiencyScore } = storeData;
      console.log('Sending payload:', storeData);
      // Call backend actor's store_data function
      await backend.store_data(
        date,
        Number(energyConsumption),
        Number(carbonEmission),
        Number(efficiencyScore)
      );
      setStoreResponse('Data stored successfully!');
    } catch (error) {
      console.error('Error storing data:', error);
      setStoreResponse(`Error: ${error.message}`);
    }
  };

  // Handle file change event for file upload
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Function to handle file upload using the ICP actor
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadResponse('Please select a file first.');
      return;
    }
  
    // Read file content as text (or base64 if preferred)
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      // Get subcontract address from localStorage
      const subcontractAddress = localStorage.getItem('subcontract_address');
      if (!subcontractAddress) {
        setUploadResponse('No subcontract address found. Please login again.');
        return;
      }
      try {
        // Call backend actor's upload_data function with the file content
        const response = await backend.upload_data(fileContent, subcontractAddress);
        setUploadResponse(response.message);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadResponse(error.message || 'File upload failed.');
      }
    };
    reader.readAsText(selectedFile);
  };

  useEffect(() => {
    // Scroll to the top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* External styles should be moved to index.html or index.css */}
      <div className="flex font-[Hanuman] bg-[#f0f9ff]">
        {/* Navigation Bar */}
        <NavigationBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

        {/* Sidebar */}
        <aside className="w-60 h-screen bg-green-50 fixed mt-[93px] left-0 border-r-4 shadow-xl hidden lg:block">
          <div>
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
                      The website is a renewable energy monitoring platform that provides alerts based on companies' energy consumption relative to their carbon emission ratios.
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
                      Details about energy usage and metrics: Normal Consumption is less than 500 kWh; Normal Efficiency Score is less than 1 kg/KWh.
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
                      Information on carbon offset initiatives and goals: Normal Range is below 0.5 kg CO₂ per kWh; Hazardous Range is above 0.8 kg CO₂ per kWh.
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
                    <p>
                      View alerts and notifications regarding energy usage.
                    </p>
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

        {/* Main Content Section */}
        <div className="ml-64 m-16 p-10 w-full">
          <h2 className="text-3xl font-semibold mb-6">Settings</h2>

          {/* Existing Settings Form Sections */}
          <form id="settingsForm" className="space-y-8 w-full">
            {/* Database Configuration Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-2xl font-semibold mb-4">Database Configuration</h3>
              <div className="space-y-4">
                <label htmlFor="dbHost" className="block">Database Host:</label>
                <input type="text" id="dbHost" name="dbHost" placeholder="Enter database host"
                  className="border border-gray-300 rounded p-2 w-full" required />

                <label htmlFor="dbPort" className="block">Database Port:</label>
                <input type="number" id="dbPort" name="dbPort" placeholder="Enter database port"
                  className="border border-gray-300 rounded p-2 w-full" required />

                <label htmlFor="dbName" className="block">Database Name:</label>
                <input type="text" id="dbName" name="dbName" placeholder="Enter database name"
                  className="border border-gray-300 rounded p-2 w-full" required />

                <label htmlFor="dbUser" className="block">Database User:</label>
                <input type="text" id="dbUser" name="dbUser" placeholder="Enter database user"
                  className="border border-gray-300 rounded p-2 w-full" required />

                <label htmlFor="dbPassword" className="block">Database Password:</label>
                <input type="password" id="dbPassword" name="dbPassword" placeholder="Enter database password"
                  className="border border-gray-300 rounded p-2 w-full" required />
              </div>
            </div>

            {/* Threshold Settings Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-2xl font-semibold mb-4">Threshold Settings</h3>
              <label htmlFor="thresholdValue" className="block">Threshold Value:</label>
              <input type="number" id="thresholdValue" name="thresholdValue" placeholder="Enter threshold value"
                className="border border-gray-300 rounded p-2 w-full" required />
            </div>

            {/* Normal Behavior Settings Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-2xl font-semibold mb-4">Normal Behavior Settings</h3>
              <label htmlFor="normalBehavior" className="block">Normal Behavior Description:</label>
              <textarea id="normalBehavior" name="normalBehavior" rows="4" placeholder="Describe normal behavior"
                className="border border-gray-300 rounded p-2 w-full" required></textarea>
            </div>

            {/* Additional Settings Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-2xl font-semibold mb-4">Additional Settings</h3>
              <label htmlFor="alertFrequency" className="block">Alert Frequency (minutes):</label>
              <input type="number" id="alertFrequency" name="alertFrequency" placeholder="Set alert frequency"
                className="border border-gray-300 rounded p-2 w-full" required />

              <label htmlFor="notificationEmail" className="block mt-4">Notification Email:</label>
              <input type="email" id="notificationEmail" name="notificationEmail" placeholder="Enter notification email"
                className="border border-gray-300 rounded p-2 w-full" />
            </div>

            {/* Submit Button for Settings */}
            <div className="flex justify-end mt-4">
              <button type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600 transition">
                Save Settings
              </button>
            </div>
          </form>

          {/* New "Store Data" Section */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full mt-8">
            <h2 className="text-2xl font-bold mb-2">Upload Data File</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <input type="file" accept=".csv,text/plain" onChange={handleFileChange} />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
            </form>
            {uploadResponse && (
              <div className="mt-4 p-4 border rounded bg-gray-100">
                {uploadResponse}
              </div>
            )}

            <h3 className="text-2xl font-semibold mb-4 mt-8">Store Data</h3>
            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label htmlFor="date" className="block">Date:</label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  placeholder="Enter date"
                  value={storeData.date}
                  onChange={handleStoreInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="energyConsumption" className="block">Energy Consumption:</label>
                <input
                  type="number"
                  name="energyConsumption"
                  id="energyConsumption"
                  placeholder="Enter energy consumption"
                  value={storeData.energyConsumption}
                  onChange={handleStoreInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="carbonEmission" className="block">Carbon Emission:</label>
                <input
                  type="number"
                  name="carbonEmission"
                  id="carbonEmission"
                  placeholder="Enter carbon emission"
                  value={storeData.carbonEmission}
                  onChange={handleStoreInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="efficiencyScore" className="block">Efficiency Score:</label>
                <input
                  type="number"
                  name="efficiencyScore"
                  id="efficiencyScore"
                  placeholder="Enter efficiency score"
                  value={storeData.efficiencyScore}
                  onChange={handleStoreInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="submit"
                  className="bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600 transition">
                  Submit Data
                </button>
              </div>
            </form>
            {storeResponse && (
              <div className="mt-4 p-4 border rounded bg-gray-100">
                {storeResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
