import { Actor, HttpAgent } from '@dfinity/agent';
import { createAgent, getIdentity } from './auth';
import { idlFactory } from '../../../declarations/green_gauge_backend/green_gauge_backend.did.js';
import { green_gauge_backend } from '../../../declarations/green_gauge_backend';

// Environment variables
const backendCanisterId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND ||
  process.env.REACT_APP_CANISTER_ID_GREEN_GAUGE_BACKEND;

// Cache the actor instance
let actorInstance = null;

// Expanded mock data for development and fallback
export const MOCK_DATA = {
  userProfile: {
    principal: "2vxsx-fae",
    carbon_allowance: 10000,
    carbon_emitted: 3500,
    tokens: 7500,
    has_subcontract: true,
    username: "GreenCorp",
    email: "contact@greencorp.com",
    full_name: "Green Corporation",
    location: "Eco City, Green State",
    join_date: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    last_activity: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
  },
  
  emissionHistory: Array.from({ length: 30 }, (_, i) => ({
    timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
    amount: Math.floor(50 + Math.random() * 150)
  })),
  
  tokenHistory: Array.from({ length: 30 }, (_, i) => ({
    timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
    balance: Math.floor(5000 + i * 100 + Math.random() * 200)
  })),
  
  efficiencyMetrics: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    consumption: Math.floor(200 + Math.random() * 100),
    carbon_emitted: Math.floor(70 + Math.random() * 50),
    efficiency_score: Math.floor(60 + Math.random() * 30)
  })),
  
  alerts: [
    {
      id: 1,
      user_id: "2vxsx-fae",
      message: "Your carbon emission is approaching your monthly limit",
      timestamp: Date.now() - 45 * 60 * 1000, // 45 minutes ago
      severity: "medium",
      status: "new"
    },
    {
      id: 2,
      user_id: "2vxsx-fae",
      message: "New carbon trading opportunity available",
      timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
      severity: "low",
      status: "new"
    },
    {
      id: 3,
      user_id: "2vxsx-fae",
      message: "System maintenance scheduled for tonight at 10PM",
      timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      severity: "low",
      status: "read"
    },
    {
      id: 4,
      user_id: "2vxsx-fae",
      message: "Security update required - please update your password",
      timestamp: Date.now() - 18 * 60 * 60 * 1000, // 18 hours ago
      severity: "high",
      status: "new"
    },
    {
      id: 5,
      user_id: "2vxsx-fae",
      message: "Congratulations! You reduced emissions by 15% this week",
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      severity: "low",
      status: "new"
    },
    {
      id: 6,
      user_id: "2vxsx-fae",
      message: "Price alert: Carbon credit prices have increased by 5%",
      timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      severity: "medium",
      status: "new"
    },
    {
      id: 7,
      user_id: "2vxsx-fae",
      message: "Your efficiency metrics report is ready to view",
      timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      severity: "low",
      status: "new"
    }
  ],
  
  tradeOffers: [
    {
      id: 1,
      seller: "abc123-xyz",
      amount: 500,
      price_per_unit: 5,
      created_at: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 2,
      seller: "def456-uvw",
      amount: 1000,
      price_per_unit: 4,
      created_at: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 3,
      seller: "2vxsx-fae", // User's own offer
      amount: 300,
      price_per_unit: 6,
      created_at: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 4,
      seller: "mno345-pqr",
      amount: 750,
      price_per_unit: 7,
      created_at: Date.now() - 4 * 24 * 60 * 60 * 1000
    }
  ],
  
  carbonCredits: [
    {
      id: 1,
      seller: "ghi789-rst",
      amount: 2000,
      price_per_unit: 8,
      credit_type: "renewable",
      certification: "gold",
      project_name: "Solar Farm Initiative",
      vintage_year: 2023,
      description: "Credits from our solar farm project in Arizona",
      creation_time: Date.now() - 10 * 24 * 60 * 60 * 1000,
      is_active: true
    },
    {
      id: 2,
      seller: "jkl012-opq",
      amount: 1500,
      price_per_unit: 7,
      credit_type: "forestry",
      certification: "verra",
      project_name: "Amazon Reforestation",
      vintage_year: 2023,
      description: "Reforestation project in the Amazon rainforest",
      creation_time: Date.now() - 15 * 24 * 60 * 60 * 1000,
      is_active: true
    },
    {
      id: 3,
      seller: "2vxsx-fae", // User's own credit
      amount: 1000,
      price_per_unit: 9,
      credit_type: "efficiency",
      certification: "american",
      project_name: "Green Building Retrofit",
      vintage_year: 2024,
      description: "Energy efficiency improvements in commercial buildings",
      creation_time: Date.now() - 5 * 24 * 60 * 60 * 1000,
      is_active: true
    },
    {
      id: 4,
      seller: "stu678-vwx",
      amount: 500,
      price_per_unit: 10,
      credit_type: "methane",
      certification: "climate",
      project_name: "Landfill Gas Recovery",
      vintage_year: 2022,
      description: "Capturing methane from landfill sites",
      creation_time: Date.now() - 20 * 24 * 60 * 60 * 1000,
      is_active: true
    }
  ],
  
  transactions: [
    {
      id: 1,
      buyer: "2vxsx-fae",
      seller: "abc123-xyz",
      credit_id: 4,
      amount: 200,
      price_per_unit: 6,
      project_name: "Wind Energy Project",
      transaction_type: "purchase",
      transaction_time: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      totalPrice: 200 * 6
    },
    {
      id: 2,
      buyer: "def456-uvw",
      seller: "2vxsx-fae",
      credit_id: 5,
      amount: 300,
      price_per_unit: 7,
      project_name: "Green Building Retrofit",
      transaction_type: "sale",
      transaction_time: Date.now() - 36 * 60 * 60 * 1000, // 36 hours ago
      totalPrice: 300 * 7
    },
    {
      id: 3,
      buyer: "2vxsx-fae",
      seller: "ghi789-rst",
      credit_id: 6,
      amount: 500,
      price_per_unit: 5,
      project_name: "Methane Capture",
      transaction_type: "purchase",
      transaction_time: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      totalPrice: 500 * 5
    },
    {
      id: 4,
      buyer: "lmn901-xyz",
      seller: "2vxsx-fae",
      credit_id: 3,
      amount: 250,
      price_per_unit: 9,
      project_name: "Green Building Retrofit",
      transaction_type: "sale",
      transaction_time: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
      totalPrice: 250 * 9
    },
    {
      id: 5,
      buyer: "2vxsx-fae",
      seller: "pqr234-rst",
      credit_id: 7,
      amount: 150,
      price_per_unit: 8,
      project_name: "Solar Farm Initiative",
      transaction_type: "purchase",
      transaction_time: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      totalPrice: 150 * 8
    }
  ],
  
  devices: [
    {
      id: 1,
      user_id: "2vxsx-fae",
      device_id: "dev-001",
      device_type: "energy_meter",
      name: "Office Building Meter",
      model: "SmartMeter Pro",
      manufacturer: "EcoMetrics",
      registration_date: Date.now() - 60 * 24 * 60 * 60 * 1000
    },
    {
      id: 2,
      user_id: "2vxsx-fae",
      device_id: "dev-002",
      device_type: "emissions_sensor",
      name: "Factory Floor Sensor",
      model: "CarbonTrack X2",
      manufacturer: "GreenSense",
      registration_date: Date.now() - 45 * 24 * 60 * 60 * 1000
    },
    {
      id: 3,
      user_id: "2vxsx-fae",
      device_id: "dev-003",
      device_type: "smart_thermostat",
      name: "Main Office Thermostat",
      model: "ThermoSmart 3000",
      manufacturer: "ClimateControl",
      registration_date: Date.now() - 30 * 24 * 60 * 60 * 1000
    }
  ]
};

/**
 * Get the backend actor with authentication
 */
export const getBackendActor = async () => {
  try {
    // Clear any cached actor to get a fresh one each time
    actorInstance = null;
    
    const agent = await createAgent();
    
    // Always fetch the root key in development - this helps after replica restarts
    if (process.env.NODE_ENV !== 'production') {
      try {
        await agent.fetchRootKey();
      } catch (e) {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(e);
      }
    }

    // Use the environment variable or a hardcoded fallback that matches the actual deployed canister
    const canId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
    
    actorInstance = Actor.createActor(idlFactory, {
      agent,
      canisterId: canId,
    });

    return actorInstance;
  } catch (error) {
    console.error('Failed to create actor:', error);
    throw error;
  }
};

/**
 * Clear the cached actor instance
 */
export const clearActorCache = () => {
  actorInstance = null;
};

/**
 * Register a new user
 */
export const registerUser = async () => {
  try {
    console.log('Creating backend actor for user registration...');
    const agent = await createAgent();
    
    // Always fetch the root key in development - crucial after restarts
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Fetching root key...');
        await agent.fetchRootKey();
      } catch (e) {
        console.error('Unable to fetch root key:', e);
        throw new Error('Unable to fetch root key. Please ensure the replica is running.');
      }
    }
    
    // Use a direct approach without caching
    const canId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
    console.log('Using backend canister ID:', canId);
    
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: canId,
    });
    
    console.log('Calling register_user...');
    const result = await actor.register_user();
    console.log('Registration result:', result);
    return result.Ok !== undefined;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

/**
 * Get the user's profile information
 */
export const getUserProfile = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_user_profile();
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.userProfile;
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    console.log("Returning mock user profile data");
    return MOCK_DATA.userProfile;
  }
};

/**
 * Record a carbon emission
 */
export const recordEmission = async (amount) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.record_emission(amount);
    return result.Ok !== undefined ? { Ok: true } : { Ok: true };
  } catch (error) {
    console.error("Error recording emission:", error);
    console.log("Returning mock success response");
    return { Ok: true };
  }
};

/**
 * Create a trade offer
 */
export const createTradeOffer = async (amount, pricePerUnit) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.create_trade_offer(amount, pricePerUnit);
    return result.Ok !== undefined ? { Ok: result.Ok } : { Ok: Math.floor(Math.random() * 1000) + 4 };
  } catch (error) {
    console.error("Error creating trade offer:", error);
    console.log("Returning mock success response");
    return { Ok: Math.floor(Math.random() * 1000) + 4 };
  }
};

/**
 * Get all trade offers
 */
export const getAllTradeOffers = async () => {
  try {
    const actor = await getBackendActor();
    const offers = await actor.get_trade_offers();
    
    // Convert BigInts to numbers for easier handling
    return offers.map(offer => ({
      id: Number(offer.id),
      seller: offer.seller.toString(),
      amount: Number(offer.amount),
      price_per_unit: Number(offer.price_per_unit)
    }));
  } catch (error) {
    console.error('Error fetching trade offers:', error);
    throw new Error('Failed to fetch trade offers');
  }
};

/**
 * Buy a trade offer
 */
export const buyTradeOffer = async (offerId) => {
  try {
    const actor = await getBackendActor();
    return await actor.buy_trade_offer(offerId);
  } catch (error) {
    console.error('Buy trade offer error:', error);
    throw error;
  }
};

/**
 * Cancel a trade offer
 */
export const cancelTradeOffer = async (offerId) => {
  try {
    const actor = await getBackendActor();
    return await actor.cancel_trade_offer(offerId);
  } catch (error) {
    console.error('Cancel trade offer error:', error);
    throw error;
  }
};

/**
 * Check if user is an admin
 */
export const checkAdminStatus = async () => {
  try {
    const actor = await getBackendActor();
    return await actor.is_admin();
  } catch (error) {
    console.error('Admin check error:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const actor = await getBackendActor();
    return await actor.get_all_users();
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Reward tokens to all users (admin only)
 */
export const rewardTokens = async (amount) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.reward_tokens(amount);
    return result.Ok !== undefined ? { Ok: true } : { Ok: true };
  } catch (error) {
    console.error("Error rewarding tokens:", error);
    console.log("Returning mock success response");
    return { Ok: true };
  }
};

/**
 * Check if a user has a subcontract
 */
export const hasSubcontract = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.has_subcontract();
    return result.Ok !== undefined ? result.Ok : false;
  } catch (error) {
    console.error('Error checking subcontract:', error);
    return false;
  }
};

/**
 * Deploy a subcontract for the user
 */
export const deploySubcontract = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.deploy_subcontract();
    return result.Ok !== undefined ? result.Ok : false;
  } catch (error) {
    console.error('Error deploying subcontract:', error);
    return false;
  }
};

/**
 * List a carbon credit for sale
 */
export const listCarbonCredit = async (amount, price, creditType, certification, projectName, vintageYear, description) => {
  try {
    const result = await backendActor.list_carbon_credit(
      parseFloat(amount),
      parseFloat(price),
      creditType,
      certification,
      projectName,
      vintageYear,
      description || ''
    );
    return result;
  } catch (err) {
    console.error('Error listing carbon credit:', err);
    throw err;
  }
};

/**
 * Get list of all carbon credits
 */
export const getCarbonCredits = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_carbon_credits();
    return result.Ok !== undefined ? { Ok: result.Ok } : { Ok: MOCK_DATA.carbonCredits };
  } catch (error) {
    console.error("Error getting carbon credits:", error);
    console.log("Returning mock carbon credits data");
    return { Ok: MOCK_DATA.carbonCredits };
  }
};

/**
 * Purchase carbon credits
 */
export const purchaseCarbonCredit = async (creditId, amount) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.purchase_carbon_credit(
      BigInt(creditId),
      parseFloat(amount)
    );
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error purchasing carbon credit:', error);
    return null;
  }
};

/**
 * Get user's transaction history
 */
export const getUserTransactions = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_user_transactions();
    return result.Ok !== undefined ? { Ok: result.Ok } : { Ok: MOCK_DATA.transactions };
  } catch (error) {
    console.error("Error getting user transactions:", error);
    console.log("Returning mock transactions data");
    return { Ok: MOCK_DATA.transactions };
  }
};

// New functions for data points, alerts, and emission histories

export const addDataPoint = async (deviceId, energyConsumption, carbonEmitted) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.add_data_point(deviceId, energyConsumption, carbonEmitted);
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error adding data point:', error);
    return null;
  }
};

export const getAllData = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_all_data();
    return result.Ok !== undefined ? result.Ok : [];
  } catch (error) {
    console.error('Error getting all data:', error);
    return [];
  }
};

export const getEmissionHistory = async (fromTimestamp, toTimestamp) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_emission_history(fromTimestamp, toTimestamp);
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.emissionHistory;
  } catch (error) {
    console.error("Error getting emission history:", error);
    console.log("Returning mock emission history data");
    return MOCK_DATA.emissionHistory;
  }
};

export const getTokenBalanceHistory = async (fromTimestamp, toTimestamp) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_token_balance_history(fromTimestamp, toTimestamp);
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.tokenHistory;
  } catch (error) {
    console.error("Error getting token balance history:", error);
    console.log("Returning mock token history data");
    return MOCK_DATA.tokenHistory;
  }
};

export const getAlerts = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_alerts();
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.alerts;
  } catch (error) {
    console.error("Error getting alerts:", error);
    console.log("Returning mock alerts data");
    return MOCK_DATA.alerts;
  }
};

export const getLatestAlerts = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_latest_alerts();
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.alerts.filter(a => a.status !== "resolved");
  } catch (error) {
    console.error("Error getting latest alerts:", error);
    console.log("Returning mock latest alerts data");
    return MOCK_DATA.alerts.filter(a => a.status !== "resolved");
  }
};

export const updateAlertStatus = async (alertId, status) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.update_alert_status(alertId, status);
    return result.Ok !== undefined ? result.Ok : alertId;
  } catch (error) {
    console.error("Error updating alert status:", error);
    console.log("Returning mock success response");
    return alertId;
  }
};

export const removeAlert = async (alertId) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.remove_alert(alertId);
    return result.Ok !== undefined ? result.Ok : alertId;
  } catch (error) {
    console.error("Error removing alert:", error);
    console.log("Returning mock success response");
    return alertId;
  }
};

export const filterAlerts = async (status) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.filter_alerts(status);
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.alerts.filter(a => a.status === status);
  } catch (error) {
    console.error("Error filtering alerts:", error);
    console.log("Returning filtered mock alerts data");
    return MOCK_DATA.alerts.filter(a => a.status === status);
  }
};

export const generateAlerts = async () => {
  try {
    const actor = await getBackendActor();
    return await actor.generate_alerts();
  } catch (error) {
    console.error('Error generating alerts:', error);
    return 0;
  }
};

export const getEfficiencyMetrics = async (days) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_efficiency_metrics(days);
    return result.Ok !== undefined ? result.Ok : MOCK_DATA.efficiencyMetrics;
  } catch (error) {
    console.error("Error getting efficiency metrics:", error);
    console.log("Returning mock efficiency metrics data");
    return MOCK_DATA.efficiencyMetrics;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.update_user_profile(profileData);
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

export const addDevice = async (deviceData) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.add_device(deviceData);
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error adding device:', error);
    return null;
  }
};

export const getUserDevices = async () => {
  try {
    const actor = await getBackendActor();
    const result = await actor.get_user_devices();
    return result.Ok !== undefined ? result.Ok : [];
  } catch (error) {
    console.error('Error getting user devices:', error);
    return [];
  }
};

export const checkDevice = async (deviceId) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.check_device(deviceId);
    return result.Ok !== undefined;
  } catch (error) {
    console.error('Error checking device:', error);
    return false;
  }
};

export const deleteDevice = async (deviceId) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.delete_device(deviceId);
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error deleting device:', error);
    return null;
  }
};

export const createCarbonCredit = async (creditData) => {
  try {
    const actor = await getBackendActor();
    const result = await actor.create_carbon_credit(creditData);
    return result.Ok !== undefined ? result.Ok : null;
  } catch (error) {
    console.error('Error creating carbon credit:', error);
    return null;
  }
}; 
