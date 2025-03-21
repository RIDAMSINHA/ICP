import { Actor, HttpAgent } from '@dfinity/agent';
import { createAgent, getIdentity } from './auth';
import { idlFactory } from '../../../declarations/green_gauge_backend/green_gauge_backend.did.js';
import { green_gauge_backend } from '../../../declarations/green_gauge_backend';

// Environment variables
const backendCanisterId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND ||
  process.env.REACT_APP_CANISTER_ID_GREEN_GAUGE_BACKEND;

// Cache the actor instance
let actorInstance = null;

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
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Failed to register user: ' + error.message);
  }
};

/**
 * Get the user's profile information
 */
export const getUserProfile = async () => {
  try {
    const actor = await getBackendActor();
    const profile = await actor.get_user_profile();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Record a carbon emission
 */
export const recordEmission = async (amount) => {
  try {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      throw new Error('Amount must be a valid number');
    }
    
    const actor = await getBackendActor();
    const result = await actor.record_emission(BigInt(Math.floor(numericAmount)));
    return result;
  } catch (error) {
    console.error('Error recording emission:', error);
    throw error;
  }
};

/**
 * Create a trade offer
 */
export const createTradeOffer = async (amount, pricePerUnit) => {
  try {
    const numericAmount = parseFloat(amount);
    const numericPrice = parseFloat(pricePerUnit);
    
    if (isNaN(numericAmount) || isNaN(numericPrice)) {
      throw new Error('Amount and price must be valid numbers');
    }
    
    const actor = await getBackendActor();
    const result = await actor.create_trade_offer(
      BigInt(Math.floor(numericAmount)), 
      BigInt(Math.floor(numericPrice))
    );
    return result;
  } catch (error) {
    console.error('Error creating trade offer:', error);
    throw error;
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
    return await actor.reward_tokens(amount);
  } catch (error) {
    console.error('Reward tokens error:', error);
    throw error;
  }
}; 