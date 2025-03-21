import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from '../../declarations/green_gauge_backend';

// Get canister ID from environment variable or use default
const canisterId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND || process.env.GREEN_GAUGE_BACKEND_CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

// Create an agent and configure it to use the local host (for development)
const host = process.env.NODE_ENV === "production" ? "https://icp-api.io" : "http://127.0.0.1:4943";
const agent = new HttpAgent({ host });

// Fetch root key for certificate validation during development
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey().catch(err => {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
    console.error(err);
  });
}

// Function to create an authenticated actor
export async function getAuthenticatedActor() {
  try {
    const authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();

    if (isAuthenticated) {
      const identity = await authClient.getIdentity();
      const agent = new HttpAgent({ host, identity });
      
      if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(err => {
          console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
          console.error(err);
        });
      }
      
      return Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });
    }
    return null;
  } catch (error) {
    console.error("Error getting authenticated actor:", error);
    return null;
  }
}

// Create an anonymous actor for public methods or before authentication
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

// Authentication functions
export async function login() {
  const authClient = await AuthClient.create();
  
  const identityProviderUrl = process.env.NODE_ENV === "production" 
    ? "https://identity.ic0.app/#authorize" 
    : `http://127.0.0.1:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}#authorize`;
  
  return new Promise((resolve) => {
    authClient.login({
      identityProvider: identityProviderUrl,
      onSuccess: async () => {
        const authenticatedActor = await getAuthenticatedActor();
        resolve(authenticatedActor);
      },
      onError: (error) => {
        console.error("Login failed:", error);
        resolve(null);
      }
    });
  });
}

export async function logout() {
  const authClient = await AuthClient.create();
  await authClient.logout();
}

export async function isAuthenticated() {
  const authClient = await AuthClient.create();
  return authClient.isAuthenticated();
}

// User profile functions
export async function registerUser() {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.register_user();
  } catch (error) {
    console.error("Error registering user:", error);
    return { Err: error.message || "Failed to register user" };
  }
}

export async function getUserProfile() {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.get_user_profile();
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { Err: error.message || "Failed to get user profile" };
  }
}

// Carbon management functions
export async function recordEmission(amount) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.record_emission(BigInt(amount));
  } catch (error) {
    console.error("Error recording emission:", error);
    return { Err: error.message || "Failed to record emission" };
  }
}

export async function rewardTokens(amount) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.reward_tokens(BigInt(amount));
  } catch (error) {
    console.error("Error rewarding tokens:", error);
    return { Err: error.message || "Failed to reward tokens" };
  }
}

// Carbon trading functions
export async function createTradeOffer(amount, pricePerUnit) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.create_trade_offer(BigInt(amount), BigInt(pricePerUnit));
  } catch (error) {
    console.error("Error creating trade offer:", error);
    return { Err: error.message || "Failed to create trade offer" };
  }
}

export async function getTradeOffers() {
  try {
    const result = await actor.get_trade_offers();
    
    // Convert BigInt values to strings for JSON serialization
    return result.map(trade => ({
      id: Number(trade.id),
      seller: trade.seller.toString(),
      amount: Number(trade.amount),
      price_per_unit: Number(trade.price_per_unit)
    }));
  } catch (error) {
    console.error("Error getting trade offers:", error);
    return [];
  }
}

export async function buyCarbon(tradeId, amount) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.buy_carbon(BigInt(tradeId), BigInt(amount));
  } catch (error) {
    console.error("Error buying carbon:", error);
    return { Err: error.message || "Failed to buy carbon" };
  }
}

// Data storage and retrieval functions
export async function storeData(date, energyConsumption, carbonEmission, efficiencyScore) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.store_data(
      date,
      BigInt(energyConsumption),
      BigInt(carbonEmission),
      BigInt(efficiencyScore)
    );
  } catch (error) {
    console.error("Error storing data:", error);
    return { Err: error.message || "Failed to store data" };
  }
}

export async function getAllData() {
  try {
    const result = await actor.get_all_data();
    
    // Convert BigInt values to numbers for JSON serialization
    return result.map(item => ({
      id: Number(item.id),
      energy_consumption: Number(item.energy_consumption),
      carbon_emission: Number(item.carbon_emission),
      efficiency_score: Number(item.efficiency_score),
      date: item.date,
      alert: item.alert,
      resolution: item.resolution,
      action_required: item.action_required
    }));
  } catch (error) {
    console.error("Error getting all data:", error);
    return [];
  }
}

export async function getDataAboveLimit(threshold) {
  try {
    const result = await actor.get_data_above_limit(BigInt(threshold));
    
    // Convert BigInt values to numbers for JSON serialization
    return result.map(item => ({
      id: Number(item.id),
      energy_consumption: Number(item.energy_consumption),
      carbon_emission: Number(item.carbon_emission),
      efficiency_score: Number(item.efficiency_score),
      date: item.date,
      alert: item.alert,
      resolution: item.resolution,
      action_required: item.action_required
    }));
  } catch (error) {
    console.error("Error getting data above limit:", error);
    return [];
  }
}

export async function resolveAction(id, resolution) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.action(BigInt(id), resolution);
  } catch (error) {
    console.error("Error resolving action:", error);
    return { Err: error.message || "Failed to resolve action" };
  }
}

// File upload function
export async function uploadData(fileContent, contractAddress) {
  try {
    const authenticatedActor = await getAuthenticatedActor();
    if (!authenticatedActor) {
      return { Err: "Not authenticated" };
    }
    return await authenticatedActor.upload_data(fileContent, contractAddress);
  } catch (error) {
    console.error("Error uploading data:", error);
    return { Err: error.message || "Failed to upload data" };
  }
}

// Password reset function
export async function resetPassword(id, token, password) {
  try {
    return await actor.reset_password(id, token, password);
  } catch (error) {
    console.error("Error resetting password:", error);
    return { Err: error.message || "Failed to reset password" };
  }
}

// OTP verification functions
export async function sendOTP(email) {
  try {
    return await actor.send_otp(email);
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { Err: error.message || "Failed to send OTP" };
  }
}

export async function verifyOTP(email, otp) {
  try {
    return await actor.verify_otp(email, otp);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { Err: error.message || "Failed to verify OTP" };
  }
}

export default actor;
