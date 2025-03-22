import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_DATA } from '../services/api';
import '../styles/CarbonMarket.css';

// Import icons from react-icons
import { 
  IoFilter as FilterIcon, 
  IoGrid as GridIcon, 
  IoList as ListIcon, 
  IoLeaf as LeafIcon, 
  IoSearch as SearchIcon, 
  IoSettings as SettingsIcon, 
  IoChevronDown as ChevronDownIcon,
  IoArrowUpDown as ArrowUpDownIcon 
} from 'react-icons/io5';

// Hardcoded mock data for immediate display
const HARDCODED_USER = {
  principal: "2vxsx-fae",
  carbon_allowance: 25000,
  carbon_emitted: 8750,
  tokens: 15000,
  username: "GreenCorp Industries",
  email: "contact@greencorp.com",
  full_name: "Green Corporation International",
  location: "Eco City, Green State",
  join_date: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180 days ago
  last_activity: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
  tradingLevel: "Premium",
  verificationStatus: "Verified",
  totalTradesCompleted: 87
};

const HARDCODED_CREDITS = [
  {
    id: 1,
    seller: "abc123-xyz",
    amount: 2500,
    pricePerUnit: 6,
    creditType: "renewable",
    certification: "gold",
    projectName: "Solar Farm Initiative - Arizona",
    vintageYear: 2023,
    description: "Credits generated from our 500MW solar farm project in Arizona desert regions, contributing to clean energy transition.",
    creationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 2,
    seller: "def456-uvw",
    amount: 1800,
    pricePerUnit: 5.5,
    creditType: "forestry",
    certification: "verra",
    projectName: "Amazon Reforestation Project",
    vintageYear: 2023,
    description: "Credits from reforestation efforts in the Amazon rainforest, protecting biodiversity and capturing carbon.",
    creationDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 3,
    seller: "ghi789-rst",
    amount: 3200,
    pricePerUnit: 7,
    creditType: "efficiency",
    certification: "american",
    projectName: "Commercial Building Retrofit Program",
    vintageYear: 2024,
    description: "Energy efficiency improvements in commercial buildings across major metropolitan areas, reducing emissions through better insulation and HVAC upgrades.",
    creationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 4,
    seller: "jkl012-opq",
    amount: 950,
    pricePerUnit: 8,
    creditType: "methane",
    certification: "climate",
    projectName: "Landfill Gas Capture Initiative",
    vintageYear: 2022,
    description: "Capturing methane emissions from landfill sites and converting them to energy, preventing powerful greenhouse gases from reaching the atmosphere.",
    creationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 5,
    seller: "2vxsx-fae", // User's own listing
    amount: 1200,
    pricePerUnit: 7.5,
    creditType: "renewable",
    certification: "gold",
    projectName: "Wind Farm Development - Coastal Regions",
    vintageYear: 2023,
    description: "Credits from our coastal wind farm expansion, harnessing natural wind currents for sustainable electricity production.",
    creationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 6,
    seller: "mno345-pqr",
    amount: 2100,
    pricePerUnit: 6.2,
    creditType: "forestry",
    certification: "verra",
    projectName: "Southeast Asian Mangrove Protection",
    vintageYear: 2024,
    description: "Preserving vital mangrove ecosystems in Southeast Asia, protecting coastal communities while sequestering carbon.",
    creationDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 7,
    seller: "stu678-vwx",
    amount: 1500,
    pricePerUnit: 5.8,
    creditType: "renewable",
    certification: "american",
    projectName: "Geothermal Energy Development",
    vintageYear: 2023,
    description: "Expanding geothermal energy production in geologically active regions, providing reliable renewable baseload power.",
    creationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 8,
    seller: "yz901-abc",
    amount: 800,
    pricePerUnit: 9,
    creditType: "efficiency",
    certification: "gold",
    projectName: "Smart Grid Implementation",
    vintageYear: 2024,
    description: "Modernizing electrical grids with smart technology to reduce transmission losses and improve energy efficiency.",
    creationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  }
];

const HARDCODED_TRANSACTIONS = [
  {
    id: 1,
    buyer: "2vxsx-fae",
    seller: "abc123-xyz",
    projectName: "Solar Farm Initiative - California",
    transactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 500,
    pricePerUnit: 5.5,
    totalPrice: 2750
  },
  {
    id: 2,
    buyer: "def456-uvw",
    seller: "2vxsx-fae",
    projectName: "Wind Farm Development - Coastal Regions",
    transactionDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 300,
    pricePerUnit: 7,
    totalPrice: 2100
  },
  {
    id: 3,
    buyer: "2vxsx-fae",
    seller: "ghi789-rst",
    projectName: "Methane Capture Project",
    transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 800,
    pricePerUnit: 6,
    totalPrice: 4800
  },
  {
    id: 4,
    buyer: "jkl012-opq",
    seller: "2vxsx-fae",
    projectName: "Commercial Building Retrofit Program",
    transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 250,
    pricePerUnit: 8,
    totalPrice: 2000
  },
  {
    id: 5,
    buyer: "2vxsx-fae",
    seller: "mno345-pqr",
    projectName: "Forestry Conservation Initiative",
    transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 600,
    pricePerUnit: 6.5,
    totalPrice: 3900
  }
];

const CarbonMarket = () => {
  // No authentication logic – we directly use mock data.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'sell', or 'history'
  const [view, setView] = useState('grid');
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    price: '',
    creditType: '',
    certification: '',
    projectName: '',
    vintageYear: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filters, setFilters] = useState({
    creditTypes: {
      renewable: false,
      forestry: false,
      methane: false,
      efficiency: false
    },
    certifications: {
      gold: false,
      verra: false,
      american: false
    }
  });
  const [sortOption, setSortOption] = useState('newest');
  const [buyLoading, setBuyLoading] = useState(false);
  const [listingLoading, setListingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state for listing a new credit
  const [newListing, setNewListing] = useState({
    amount: '',
    price_per_unit: '',
    credit_type: 'renewable',
    certification: 'gold',
    project_name: '',
    vintage_year: new Date().getFullYear(),
    description: ''
  });

  useEffect(() => {
    // Set initial hardcoded data immediately
    setUserProfile(HARDCODED_USER);
    setCarbonCredits(HARDCODED_CREDITS);
    setTransactions(HARDCODED_TRANSACTIONS);
    
    // Simulate a brief loading screen for better UI experience
    setTimeout(() => {
      setLoading(false);
    }, 500);
    
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    if (name.startsWith('type-')) {
      const creditType = name.replace('type-', '');
      setFilters({
        ...filters,
        creditTypes: {
          ...filters.creditTypes,
          [creditType]: checked
        }
      });
    } else if (name.startsWith('cert-')) {
      const certification = name.replace('cert-', '');
      setFilters({
        ...filters,
        certifications: {
          ...filters.certifications,
          [certification]: checked
        }
      });
    }
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange({
      ...priceRange,
      [name]: value
    });
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters, priceRange);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    let sortedCredits = [...carbonCredits];
    switch (option) {
      case 'newest':
        sortedCredits.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        break;
      case 'oldest':
        sortedCredits.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
        break;
      case 'price-low':
        sortedCredits.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price-high':
        sortedCredits.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      case 'quantity-high':
        sortedCredits.sort((a, b) => b.amount - a.amount);
        break;
      default:
        break;
    }
    setCarbonCredits(sortedCredits);
  };

  const handleListCredits = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.price || !formData.creditType || 
        !formData.certification || !formData.projectName || !formData.vintageYear) {
      setError('Please fill out all required fields');
      return;
    }
    
    // Simulate listing by adding to local state.
    const newCredit = {
      id: carbonCredits.length + 1,
      seller: userProfile.principal,
      amount: formData.amount,
      pricePerUnit: formData.price,
      creditType: formData.creditType,
      certification: formData.certification,
      projectName: formData.projectName,
      vintageYear: formData.vintageYear,
      description: formData.description,
      creationDate: new Date().toISOString(),
      is_active: true
    };
    
    setCarbonCredits(prev => [...prev, newCredit]);
    setSuccessMessage('Carbon credits listed successfully!');
    setFormData({
      amount: '',
      price: '',
      creditType: '',
      certification: '',
      projectName: '',
      vintageYear: '',
      description: ''
    });
    setTimeout(() => {
      setActiveTab('buy');
      setSuccessMessage('');
    }, 2000);
  };

  const handlePurchaseCredit = (creditId, amount) => {
    // Simulate purchase by updating local state
    setSuccessMessage('Carbon credits purchased successfully!');
    setCarbonCredits(prevCredits => 
      prevCredits
        .map(credit => 
          credit.id === creditId 
            ? { ...credit, amount: credit.amount - amount }
            : credit
        )
        .filter(credit => credit.amount > 0)
    );
    setTimeout(() => {
      setSuccessMessage('');
      setSelectedCredit(null);
    }, 3000);
  };

  const handleBuy = (credit) => {
    setSelectedCredit(credit);
    setPurchaseAmount('');
    setMessage({ text: '', type: '' });
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    if (!purchaseAmount || isNaN(purchaseAmount) || Number(purchaseAmount) <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (Number(purchaseAmount) > selectedCredit.amount) {
      setMessage({ text: 'Amount exceeds available credits', type: 'error' });
      return;
    }
    const totalCost = Number(purchaseAmount) * Number(selectedCredit.pricePerUnit);
    if (totalCost > userProfile.tokens) {
      setMessage({ text: 'Insufficient tokens for this purchase', type: 'error' });
      return;
    }
    setMessage({ 
      text: `Successfully purchased ${purchaseAmount} carbon credits from ${selectedCredit.projectName}`, 
      type: 'success' 
    });
    setTimeout(() => {
      setSelectedCredit(null);
      setCarbonCredits(prevCredits => 
        prevCredits
          .map(credit => 
            credit.id === selectedCredit.id 
              ? { ...credit, amount: credit.amount - Number(purchaseAmount) }
              : credit
          )
          .filter(credit => credit.amount > 0)
      );
      setUserProfile(prev => ({
        ...prev,
        tokens: prev.tokens - totalCost
      }));
    }, 2000);
  };

  const handleListingChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'price_per_unit' || name === 'vintage_year' 
        ? Number(value) 
        : value
    }));
  };

  const handleListingSubmit = (e) => {
    e.preventDefault();
    if (!newListing.amount || newListing.amount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (!newListing.price_per_unit || newListing.price_per_unit <= 0) {
      setMessage({ text: 'Please enter a valid price', type: 'error' });
      return;
    }
    if (!newListing.project_name.trim()) {
      setMessage({ text: 'Please enter a project name', type: 'error' });
      return;
    }
    const newCredit = {
      id: carbonCredits.length + 1,
      seller: userProfile.principal,
      amount: newListing.amount,
      pricePerUnit: newListing.price_per_unit,
      creditType: newListing.credit_type,
      certification: newListing.certification,
      projectName: newListing.project_name,
      vintageYear: newListing.vintage_year,
      description: newListing.description,
      creationDate: new Date().toISOString(),
      is_active: true
    };
    setCarbonCredits(prev => [...prev, newCredit]);
    setNewListing({
      amount: '',
      price_per_unit: '',
      credit_type: 'renewable',
      certification: 'gold',
      project_name: '',
      vintage_year: new Date().getFullYear(),
      description: ''
    });
    setMessage({ text: 'Carbon credit listed successfully!', type: 'success' });
    setActiveTab('buy');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Filter and sort carbon credits
  let filteredCredits = carbonCredits;
  if (searchQuery) {
    filteredCredits = filteredCredits.filter(credit => 
      credit.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credit.creditType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credit.certification.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  const selectedCreditTypes = Object.entries(filters.creditTypes)
    .filter(([_, isSelected]) => isSelected)
    .map(([type]) => type);
  if (selectedCreditTypes.length > 0) {
    filteredCredits = filteredCredits.filter(credit => 
      selectedCreditTypes.includes(credit.creditType)
    );
  }
  
  const selectedCertifications = Object.entries(filters.certifications)
    .filter(([_, isSelected]) => isSelected)
    .map(([cert]) => cert);
  if (selectedCertifications.length > 0) {
    filteredCredits = filteredCredits.filter(credit => 
      selectedCertifications.includes(credit.certification)
    );
  }
  
  if (priceRange.min && !isNaN(priceRange.min)) {
    filteredCredits = filteredCredits.filter(credit => 
      credit.pricePerUnit >= parseFloat(priceRange.min)
    );
  }
  if (priceRange.max && !isNaN(priceRange.max)) {
    filteredCredits = filteredCredits.filter(credit => 
      credit.pricePerUnit <= parseFloat(priceRange.max)
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Carbon Credit Marketplace</h1>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 
          message.type === 'success' ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right">
            &times;
          </button>
        </div>
      )}

      {/* Enhanced User Profile Summary with more details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Carbon Trading Account</h2>
            {userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">Token Balance:</p>
                  <p className="font-semibold text-xl text-green-700">{userProfile.tokens.toLocaleString()} tokens</p>
                </div>
                <div>
                  <p className="text-gray-600">Available Carbon:</p>
                  <p className="font-semibold text-xl text-blue-700">
                    {(userProfile.carbon_allowance - userProfile.carbon_emitted).toLocaleString()} units
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Trading Level:</p>
                  <p className="font-semibold text-xl text-purple-700">{userProfile.tradingLevel}</p>
                  <p className="text-gray-500 text-sm">{userProfile.totalTradesCompleted} trades completed</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('sell')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg focus:outline-none"
            >
              List New Credits
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b">
        <button 
            className={`px-4 py-2 font-medium ${activeTab === 'buy' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('buy')}
        >
            Buy Credits
        </button>
        <button 
            className={`px-4 py-2 font-medium ${activeTab === 'sell' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sell')}
        >
            List New Credits
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('history')}
          >
            Transaction History
        </button>
        </div>
      </div>

      {/* Buy Credits Tab */}
      {activeTab === 'buy' && (
        <>
          {/* Search and filter bar */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center justify-between">
            <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <div className="ml-4">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="quantity-high">Quantity: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-gray-600 mr-2">View:</span>
                <button
                  onClick={() => setView('grid')}
                  className={`p-1 rounded ${view === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
                >
                  <GridIcon size={20} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1 rounded ml-1 ${view === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
                >
                  <ListIcon size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredCredits || []).map(credit => (
              <div key={credit.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-2 text-white text-center ${
                  credit.creditType === 'renewable' ? 'bg-green-600' :
                  credit.creditType === 'forestry' ? 'bg-emerald-600' :
                  credit.creditType === 'efficiency' ? 'bg-blue-600' :
                  'bg-purple-600'
                }`}>
                  {credit.creditType.toUpperCase()} CARBON CREDITS
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{credit.projectName}</h3>
                  <p className="text-gray-600 mb-4">{credit.description}</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount Available:</span>
                    <span className="font-semibold">{credit.amount.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per Unit:</span>
                    <span className="font-semibold">{credit.pricePerUnit} tokens</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Certification:</span>
                    <span className="font-semibold">{credit.certification}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Vintage Year:</span>
                    <span className="font-semibold">{credit.vintageYear}</span>
                  </div>
                  
                  {credit.seller === userProfile.principal ? (
                    <button
                      className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg cursor-not-allowed"
                      disabled
                    >
                      Your Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(credit)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg focus:outline-none"
                    >
                      Buy Credits
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCredits.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No carbon credits are currently available.</p>
            </div>
          )}
        </>
      )}

      {/* Sell/List Credits Tab */}
      {activeTab === 'sell' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">List New Carbon Credits</h2>
          <form onSubmit={handleListingSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Amount (units)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newListing.amount}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount to list"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Price per Unit (tokens)
                </label>
                <input
                  type="number"
                  name="price_per_unit"
                  value={newListing.price_per_unit}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter price per unit"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={newListing.project_name}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Vintage Year
                </label>
                <input
                  type="number"
                  name="vintage_year"
                  value={newListing.vintage_year}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Credit Type
                </label>
                <select
                  name="credit_type"
                  value={newListing.credit_type}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="renewable">Renewable Energy</option>
                  <option value="forestry">Forestry & Conservation</option>
                  <option value="efficiency">Energy Efficiency</option>
                  <option value="methane">Methane Reduction</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Certification Standard
                </label>
                <select
                  name="certification"
                  value={newListing.certification}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="gold">Gold Standard</option>
                  <option value="verra">Verra VCS</option>
                  <option value="american">American Carbon Registry</option>
                  <option value="climate">Climate Action Reserve</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newListing.description}
                  onChange={handleListingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="4"
                  placeholder="Describe your carbon credit project"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg focus:outline-none"
              >
                List Carbon Credits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(transactions || []).map(tx => {
                const isBuyer = tx.buyer === userProfile?.principal?.toString();
                const displayType = isBuyer ? 'Purchase' : 'Sale';
                return (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isBuyer ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {displayType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.amount} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(tx.pricePerUnit || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(tx.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No transaction history yet.</p>
          </div>
        )}
      </div>
      )}

      {/* Purchase Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Purchase Carbon Credits</h3>
                <button onClick={() => setSelectedCredit(null)} className="text-gray-400 hover:text-gray-500">
                  &times;
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Project: <span className="font-semibold">{selectedCredit.projectName}</span></p>
                <p className="text-gray-600 mb-2">Available: <span className="font-semibold">{selectedCredit.amount} units</span></p>
                <p className="text-gray-600 mb-2">Price: <span className="font-semibold">{selectedCredit.pricePerUnit} tokens per unit</span></p>
                <p className="text-gray-600 mb-4">Your token balance: <span className="font-semibold">{userProfile.tokens} tokens</span></p>
              </div>
              
              <form onSubmit={handlePurchaseSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Amount to Purchase (units)
                  </label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                    min="1"
                    max={selectedCredit.amount}
                  />
                </div>
                
                {purchaseAmount && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">
                      Total cost: <span className="font-bold">{Number(purchaseAmount) * selectedCredit.pricePerUnit} tokens</span>
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCredit(null)}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg focus:outline-none"
                  >
                    Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default CarbonMarket; 
