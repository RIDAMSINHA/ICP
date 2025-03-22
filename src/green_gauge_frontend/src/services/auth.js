import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { createActor } from '../../../declarations/green_gauge_backend';

// The II canister ID when in development mode
export const LOCAL_II_CANISTER_ID = process.env.LOCAL_II_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai';

// Time after which authentication will be automatically renewed
const AUTH_EXPIRATION_HOURS = 8;
// Application name registered with Internet Identity
const APP_NAME = 'Green Gauge';

// Create a new auth client
let authClient;
const getAuthClient = async () => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

// Check if the user is already authenticated
export const isAuthenticated = async () => {
  const client = await getAuthClient();
  return await client.isAuthenticated();
};

// Get the identity
export const getIdentity = async () => {
  const client = await getAuthClient();
  return client.getIdentity();
};

// Get the user's principal ID
export const getPrincipal = async () => {
  const client = await getAuthClient();
  if (await client.isAuthenticated()) {
    const identity = client.getIdentity();
    return identity.getPrincipal().toString();
  }
  return null;
};

// Create an agent with the user's identity
export const createAgent = async () => {
  try {
    const identity = await getIdentity();
    
    // Use the correct host port for local development
    const host = process.env.DFX_NETWORK === 'ic' 
      ? 'https://ic0.app' 
      : 'http://localhost:4943';
    
    const agent = new HttpAgent({
      identity,
      host,
    });
    
    // Always fetch the root key in development
    if (process.env.DFX_NETWORK !== 'ic') {
      try {
        await agent.fetchRootKey();
      } catch (err) {
        console.warn('Unable to fetch root key. Check if your local replica is running');
        console.error(err);
      }
    }
    
    return agent;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

// Login with Internet Identity
export const login = async () => {
  try {
    const client = await getAuthClient();
    
    const twoMonthsInNanoSeconds = BigInt(AUTH_EXPIRATION_HOURS * 60 * 60 * 1000 * 1000 * 1000);
    
    // Get the correct Internet Identity canister ID
    // Prefer env variable from .env file, then fallback to hardcoded value
    const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY || 
                         process.env.INTERNET_IDENTITY_CANISTER_ID || 
                         'be2us-64aaa-aaaaa-qaabq-cai';
    
    console.log('Using Internet Identity canister ID:', iiCanisterId);
    
    // Correctly format the identity provider URL
    const identityProviderUrl = process.env.DFX_NETWORK === 'ic' 
      ? 'https://identity.ic0.app/#authorize' 
      : `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943/#authorize`;
      
    console.log('Using identity provider URL:', identityProviderUrl);
    
    return new Promise((resolve, reject) => {
      client.login({
        identityProvider: identityProviderUrl,
        maxTimeToLive: twoMonthsInNanoSeconds,
        derivationOrigin: window.location.origin,
        onSuccess: async () => {
          console.log('Login successful');
          
          try {
            // After login, check if user is registered, if not - register them
            const backendCanisterId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
            const idlFactory = await import('../../../declarations/green_gauge_backend').then(mod => mod.idlFactory);
            const actor = await createAuthenticatedActor(backendCanisterId, idlFactory);
            
            try {
              // Try to get user profile, if it fails, user needs to be registered
              await actor.get_user_profile();
              console.log('User already registered');
              
              // Check if user has a subcontract
              const hasSubcontract = await actor.has_subcontract();
              if (!hasSubcontract.Ok || !hasSubcontract.Ok) {
                console.log('Deploying subcontract for user...');
                await actor.deploy_subcontract();
                console.log('Subcontract deployed successfully');
              }
            } catch (error) {
              // If user is not registered, register them
              console.log('User not registered, registering now...');
              await actor.register_user();
              console.log('User registered successfully');
            }
          } catch (error) {
            console.error('Error during post-login process:', error);
            // We don't reject here, as login was successful
          }
          
          resolve(true);
        },
        onError: (error) => {
          console.error('Login error:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Login initialization error:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  const client = await getAuthClient();
  await client.logout();
  // Reload the page to reset the application state
  window.location.href = '/';
};

// Create an actor with the current identity
export const createAuthenticatedActor = async (canisterId, idlFactory) => {
  try {
    // Create an authenticated agent
    const agent = await createAgent();
    
    if (!idlFactory) {
      console.error('Missing IDL factory');
      throw new Error('Missing IDL factory for actor creation');
    }
    
    if (!canisterId) {
      console.error('Missing canister ID');
      throw new Error('Missing canister ID for actor creation');
    }
    
    console.log('Creating actor for canister:', canisterId);
    
    return createActor(canisterId, {
      agent,
    });
  } catch (error) {
    console.error('Error creating authenticated actor:', error);
    throw error;
  }
};

// Check if user is an admin
export const checkAdminStatus = async () => {
  try {
    const backendCanisterId = process.env.CANISTER_ID_GREEN_GAUGE_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
    const idlFactory = await import('../../../declarations/green_gauge_backend').then(mod => mod.idlFactory);
    const actor = await createAuthenticatedActor(backendCanisterId, idlFactory);
    
    // If there's no isAdmin method in your backend canister, you can use a workaround
    // For example, check if the user's principal is in a list of admin principals
    const principal = await getPrincipal();
    return principal === 'ADMIN_PRINCIPAL_ID_HERE'; // Replace with actual admin principal
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 