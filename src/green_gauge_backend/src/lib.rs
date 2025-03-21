use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller;
use ic_cdk_macros::{init, update, query};
use std::cell::RefCell;
use std::collections::BTreeMap;

// Data Structures
#[derive(CandidType, Deserialize, Clone, Debug)]
struct UserProfile {
    principal: Principal,
    carbon_allowance: u64,
    carbon_emitted: u64,
    tokens: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct CarbonTrade {
    id: u64,
    seller: Principal,
    amount: u64,
    price_per_unit: u64,
}

// Define thread-local variables for stable storage
thread_local! {
    static USERS: RefCell<BTreeMap<Principal, UserProfile>> = RefCell::new(BTreeMap::new());
    static TRADES: RefCell<BTreeMap<u64, CarbonTrade>> = RefCell::new(BTreeMap::new());
    static NEXT_TRADE_ID: RefCell<u64> = RefCell::new(1);
}

// Default values
const DEFAULT_CARBON_ALLOWANCE: u64 = 1000;
const DEFAULT_TOKENS: u64 = 0;
const COMMISSION_RATE: f64 = 0.05; // 5% commission on trades

// Register a new user
#[update]
fn register_user() -> Result<(), String> {
    let caller = caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principals cannot register".to_string());
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if users_map.contains_key(&caller) {
            return Err("User already registered".to_string());
        }

        let user_profile = UserProfile {
            principal: caller,
            carbon_allowance: DEFAULT_CARBON_ALLOWANCE,
            carbon_emitted: 0,
            tokens: DEFAULT_TOKENS,
        };

        users_map.insert(caller, user_profile);
        Ok(())
    })
}

// Get the profile of the caller
#[query]
fn get_user_profile() -> Result<UserProfile, String> {
    let caller = caller();
    
    USERS.with(|users| {
        let users_map = users.borrow();
        match users_map.get(&caller) {
            Some(profile) => Ok(profile.clone()),
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Record carbon emission
#[update]
fn record_emission(amount: u64) -> Result<(), String> {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        match users_map.get(&caller) {
            Some(profile) => {
                let new_emitted = profile.carbon_emitted + amount;
                
                if new_emitted > profile.carbon_allowance {
                    return Err("Emission would exceed your carbon allowance. Consider buying more allowance.".to_string());
                }
                
                let mut updated_profile = profile.clone();
                updated_profile.carbon_emitted = new_emitted;
                users_map.insert(caller, updated_profile);
                
                Ok(())
            },
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Reward tokens to a user
#[update]
fn reward_tokens(amount: u64) -> Result<(), String> {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        match users_map.get(&caller) {
            Some(profile) => {
                let mut updated_profile = profile.clone();
                updated_profile.tokens += amount;
                users_map.insert(caller, updated_profile);
                
                Ok(())
            },
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Create a trade offer to sell carbon allowance
#[update]
fn create_trade_offer(amount: u64, price_per_unit: u64) -> Result<u64, String> {
    let caller = caller();
    
    if amount == 0 {
        return Err("Trade amount must be greater than zero".to_string());
    }
    
    if price_per_unit == 0 {
        return Err("Price per unit must be greater than zero".to_string());
    }
    
    USERS.with(|users| {
        let users_map = users.borrow();
        
        match users_map.get(&caller) {
            Some(profile) => {
                let available_carbon = profile.carbon_allowance - profile.carbon_emitted;
                
                if amount > available_carbon {
                    return Err(format!("Not enough available carbon allowance. You have {} units available.", available_carbon));
                }
                
                // Proceed with creating the trade
                NEXT_TRADE_ID.with(|next_id| {
                    let trade_id = *next_id.borrow();
                    *next_id.borrow_mut() = trade_id + 1;
                    
                    let trade = CarbonTrade {
                        id: trade_id,
                        seller: caller,
                        amount,
                        price_per_unit,
                    };
                    
                    TRADES.with(|trades| {
                        trades.borrow_mut().insert(trade_id, trade);
                    });
                    
                    Ok(trade_id)
                })
            },
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Get all active trade offers
#[query]
fn get_trade_offers() -> Vec<CarbonTrade> {
    TRADES.with(|trades| {
        trades.borrow().values().cloned().collect()
    })
}

// Buy carbon from a trade offer
#[update]
fn buy_carbon(trade_id: u64, amount: u64) -> Result<(), String> {
    let buyer = caller();
    
    if amount == 0 {
        return Err("Amount to buy must be greater than zero".to_string());
    }
    
    // First, check if the trade exists and get its details
    let trade = TRADES.with(|trades| {
        match trades.borrow().get(&trade_id) {
            Some(t) => Ok(t.clone()),
            None => Err("Trade offer not found".to_string()),
        }
    })?;
    
    if trade.seller == buyer {
        return Err("You cannot buy your own trade offer".to_string());
    }
    
    if amount > trade.amount {
        return Err(format!("Requested amount exceeds available amount in trade. Available: {}", trade.amount));
    }
    
    // Calculate the total cost
    let total_cost = amount * trade.price_per_unit;
    
    // Check if the buyer has enough tokens
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        let buyer_profile = match users_map.get(&buyer) {
            Some(profile) => profile.clone(),
            None => return Err("Buyer profile not found. Please register first.".to_string()),
        };
        
        if buyer_profile.tokens < total_cost {
            return Err(format!("Not enough tokens. Required: {}, Available: {}", total_cost, buyer_profile.tokens));
        }
        
        let seller_profile = match users_map.get(&trade.seller) {
            Some(profile) => profile.clone(),
            None => return Err("Seller profile not found".to_string()),
        };
        
        // Calculate the seller's earnings (minus commission)
        let commission = (total_cost as f64 * COMMISSION_RATE) as u64;
        let seller_earnings = total_cost - commission;
        
        // Update buyer profile
        let mut updated_buyer = buyer_profile.clone();
        updated_buyer.tokens -= total_cost;
        updated_buyer.carbon_allowance += amount;
        
        // Update seller profile
        let mut updated_seller = seller_profile.clone();
        updated_seller.tokens += seller_earnings;
        
        // Update or remove the trade
        TRADES.with(|trades| {
            let mut trades_map = trades.borrow_mut();
            
            if amount == trade.amount {
                // If buying the entire amount, remove the trade
                trades_map.remove(&trade_id);
            } else {
                // If buying a partial amount, update the trade
                let mut updated_trade = trade.clone();
                updated_trade.amount -= amount;
                trades_map.insert(trade_id, updated_trade);
            }
        });
        
        // Save the updated profiles
        users_map.insert(buyer, updated_buyer);
        users_map.insert(trade.seller, updated_seller);
        
        Ok(())
    })
}

// For testing purposes - allow checking all users
#[query]
fn debug_get_all_users() -> Vec<UserProfile> {
    USERS.with(|users| {
        users.borrow().values().cloned().collect()
    })
}

// Set up the canister
#[init]
fn init() {
    ic_cdk::println!("Green Gauge canister initialized");
}

// Export Candid interface
ic_cdk::export_candid!();
