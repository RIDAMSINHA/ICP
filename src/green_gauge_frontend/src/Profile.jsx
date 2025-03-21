import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useThreshold } from './thresholdcontext';
import logo from './assets/images/logo.png';
import { getUserProfile, getAllData } from './backendActor';

const normalConsumption = 500;

function Profile({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  
  // States for carousel and modal
  const [activeModal, setActiveModal] = useState(null);
  const [efficientDays, setEfficientDays] = useState([]);
  const [majorAlerts, setMajorAlerts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for carousels
  const daysCarouselRef = useRef(null);
  const alertsCarouselRef = useRef(null);
  
  const { energyThreshold } = useThreshold();
  
  // Modal functions
  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Carousel scroll functionality
  const scrollCarousel = (carouselRef, direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile if authenticated
      if (isAuthenticated) {
        const profileResponse = await getUserProfile();
        if (profileResponse && profileResponse.Ok) {
          setUserProfile(profileResponse.Ok);
        } else if (profileResponse && profileResponse.Err) {
          setError(`Error loading profile: ${profileResponse.Err}`);
        }
      }
      
      // Fetch all data for consumption information
      const allData = await getAllData();
      
      // Create a formatted data array from the backend data
      const formattedData = Array.isArray(allData) ? allData.map(item => ({
        id: item.id,
        energyConsumption: item.energy_consumption,
        carbonEmission: item.carbon_emission,
        efficiencyScore: item.efficiency_score,
        date: item.date,
        alert: item.alert,
        actionRequired: item.action_required,
        resolution: item.resolution
      })) : [];
      
      // Sort all data by date in descending order (latest dates first)
      formattedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Filter efficient days below the threshold
      const efficient = formattedData.filter(item => item.energyConsumption <= energyThreshold);
      setEfficientDays(efficient);

      // Filter major alerts where alert is not "Normal"
      const alerts = formattedData.filter(item => item.alert !== "Normal");
      setMajorAlerts(alerts);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
    
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [isAuthenticated, energyThreshold]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center mt-20">
          <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  // Not logged in view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-10">
          <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Profile Access Restricted</h1>
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-4">
              You need to log in to view your profile information and energy consumption data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">What You'll Get Access To:</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Personal energy consumption tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Carbon trading opportunities</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Usage alerts and notifications</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Personal carbon offset tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 h-screen bg-green-50 fixed left-0 border-r-4 shadow-xl hidden lg:block mt-20">
          <div className="mt-4">
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

        {/* Modal */}
        {activeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 sm:w-2/3 lg:w-1/3 relative">
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
              <h2 className="text-2xl font-semibold mb-4">{activeModal}</h2>
              <div className="text-gray-700">
                {activeModal === "Overview" && (
                  <div>
                    <p>
                      The Green Gauge platform is a renewable energy monitoring platform that provides alerts based on companies' energy consumption relative to their carbon emission ratios. It aims to promote sustainable practices and support the green revolution by helping organizations optimize their energy use and reduce their environmental impact.
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
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="lg:ml-64 p-5 w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl text-green-700 font-bold mb-6">User Profile</h1>
            
            {userProfile ? (
              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Identity Information</h3>
                    <p className="mb-2"><span className="text-gray-600 font-semibold">Principal ID:</span> {userProfile.principal.toString()}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Carbon Stats</h3>
                    <p className="mb-2"><span className="text-gray-600 font-semibold">Carbon Allowance:</span> {Number(userProfile.carbon_allowance)} units</p>
                    <p className="mb-2"><span className="text-gray-600 font-semibold">Carbon Emitted:</span> {Number(userProfile.carbon_emitted)} units</p>
                    <p className="mb-2"><span className="text-gray-600 font-semibold">Available Carbon:</span> {Number(userProfile.carbon_allowance) - Number(userProfile.carbon_emitted)} units</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Token Balance</h3>
                    <p className="mb-2 text-xl"><span className="text-gray-600 font-semibold">Tokens:</span> {Number(userProfile.tokens)}</p>
                    <div className="flex justify-between mt-4">
                      <button 
                        onClick={() => navigate('/carbon')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Trade Carbon
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View Dashboard
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Account Status</h3>
                    <p className="mb-2">
                      <span className="text-gray-600 font-semibold">Status:</span> 
                      <span className="text-green-600 ml-2">Active</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-4">Last updated: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-700">
                  We're having trouble loading your profile data. Please try refreshing the page.
                </p>
                <button 
                  onClick={() => fetchData()}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>

          {/* Efficient Consumption Days */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl text-green-700 font-bold mb-4">Most Efficient Consumption Days</h2>
            <div className="relative px-5">
              {/* Carousel Wrapper */}
              <div className="flex overflow-x-auto space-x-4 pb-2" ref={daysCarouselRef}>
                {efficientDays.length > 0 ? (
                  efficientDays.map((day, index) => (
                    <div key={index} className="min-w-[250px] flex-shrink-0 bg-green-50 p-4 rounded-xl shadow-md text-gray-700">
                      <p className="font-semibold mb-2">Energy Data</p>
                      <p className="mb-1">Energy: {day.energyConsumption} kWh</p>
                      <p className="mb-1">Threshold: {energyThreshold} kWh</p>
                      <p className="mb-1">Date: {new Date(day.date).toLocaleDateString()}</p>
                      <p className="mb-1">Efficiency: {day.efficiencyScore}%</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No efficient consumption days found.</p>
                )}
              </div>

              {efficientDays.length > 3 && (
                <>
                  {/* Left Arrow */}
                  <button className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow"
                    onClick={() => scrollCarousel(daysCarouselRef, 'left')}>
                    &lt;
                  </button>

                  {/* Right Arrow */}
                  <button className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow"
                    onClick={() => scrollCarousel(daysCarouselRef, 'right')}>
                    &gt;
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Major Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl text-green-700 font-bold mb-4">Major Alerts</h2>
            <div className="relative px-5">
              {/* Carousel Wrapper */}
              <div className="flex overflow-x-auto space-x-4 pb-2" ref={alertsCarouselRef}>
                {majorAlerts.length > 0 ? (
                  majorAlerts.map((alert, index) => (
                    <div key={index} className="min-w-[250px] flex-shrink-0 bg-red-50 p-4 rounded-xl shadow-md text-gray-700">
                      <p className="font-semibold text-red-600 mb-2">{alert.alert}</p>
                      <p className="mb-1">Energy: {alert.energyConsumption} kWh</p>
                      <p className="mb-1">Threshold: {energyThreshold} kWh</p>
                      <p className="mb-1">Date: {new Date(alert.date).toLocaleDateString()}</p>
                      <p className="mb-1">Action: {alert.actionRequired}</p>
                      {alert.resolution && (
                        <p className="text-green-600">Resolved: {alert.resolution}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No major alerts found.</p>
                )}
              </div>

              {majorAlerts.length > 3 && (
                <>
                  {/* Left Arrow */}
                  <button className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow"
                    onClick={() => scrollCarousel(alertsCarouselRef, 'left')}>
                    &lt;
                  </button>

                  {/* Right Arrow */}
                  <button className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow"
                    onClick={() => scrollCarousel(alertsCarouselRef, 'right')}>
                    &gt;
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-green-50 text-gray-700 p-5 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <ul className="flex flex-wrap space-x-4 mb-4 md:mb-0">
                <li><Link to="/about" className="hover:underline">About</Link></li>
                <li><Link to="/contactus" className="hover:underline">Contact Us</Link></li>
                <li><Link to="/privacypolicy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link to="/termsconditions" className="hover:underline">Terms & Conditions</Link></li>
              </ul>
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Green Gauge - Carbon Trading Platform. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Profile;
