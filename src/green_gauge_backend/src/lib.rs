use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller;
use ic_cdk_macros::{init, update, query};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

// Data Structures
#[derive(CandidType, Deserialize, Clone, Debug)]
struct UserProfile {
    principal: Principal,
    carbon_allowance: u64,
    carbon_emitted: u64,
    tokens: u64,
    has_subcontract: bool,  // New field to track if user has a subcontract
    // New fields for enhanced profile
    username: Option<String>,
    email: Option<String>,
    full_name: Option<String>,
    location: Option<String>,
    join_date: u64,
    last_activity: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct CarbonTrade {
    id: u64,
    seller: Principal,
    amount: u64,
    price_per_unit: u64,
}

// New structures for enhanced marketplace
#[derive(CandidType, Deserialize, Clone, Debug)]
struct CarbonCredit {
    id: u64,
    seller: Principal,
    amount: f64,
    price_per_unit: f64,
    credit_type: String,     // renewable, forestry, methane, efficiency
    certification: String,   // gold, verra, american
    project_name: String,
    vintage_year: u32,
    description: String,
    creation_time: u64,
    is_active: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Transaction {
    id: u64,
    buyer: Principal,
    seller: Principal,
    credit_id: u64,
    amount: f64,
    price_per_unit: f64,
    project_name: String,
    transaction_type: String, // purchase, sale
    transaction_time: u64,
}

// New structure for DataPoint (for emission and energy consumption data)
#[derive(CandidType, Deserialize, Clone, Debug)]
struct DataPoint {
    id: u64,
    user_id: Principal,
    device_id: String,
    energy_consumption: f32,
    carbon_emitted: f32,
    timestamp: u64,
}

// New structure for Alert system
#[derive(CandidType, Deserialize, Clone, Debug)]
struct Alert {
    id: u64,
    user_id: Principal,
    message: String,
    timestamp: u64,
    severity: String, // "low", "medium", "high"
    status: String,   // "new", "read", "resolved"
}

// New structure for EmissionHistory (time series data)
#[derive(CandidType, Deserialize, Clone, Debug)]
struct EmissionHistoryPoint {
    timestamp: u64,
    amount: f64,
}

// New structure for TokenBalanceHistory (time series data)
#[derive(CandidType, Deserialize, Clone, Debug)]
struct TokenBalancePoint {
    timestamp: u64,
    balance: u64,
}

// New structure for efficiency metrics
#[derive(CandidType, Deserialize, Clone, Debug)]
struct EfficiencyMetric {
    date: String,
    consumption: f32,
    carbon_emitted: f32,
    efficiency_score: f32,
}

// Define thread-local variables for stable storage
thread_local! {
    static USERS: RefCell<BTreeMap<Principal, UserProfile>> = RefCell::new(BTreeMap::new());
    static TRADES: RefCell<BTreeMap<u64, CarbonTrade>> = RefCell::new(BTreeMap::new());
    static NEXT_TRADE_ID: RefCell<u64> = RefCell::new(1);
    
    // New storage for enhanced marketplace
    static CARBON_CREDITS: RefCell<Vec<CarbonCredit>> = RefCell::new(Vec::new());
    static CARBON_CREDIT_ID_COUNTER: RefCell<u64> = RefCell::new(0);
    
    static TRANSACTIONS: RefCell<Vec<Transaction>> = RefCell::new(Vec::new());
    static TRANSACTION_ID_COUNTER: RefCell<u64> = RefCell::new(0);
    
    // New storage for data points
    static DATA_POINTS: RefCell<Vec<DataPoint>> = RefCell::new(Vec::new());
    static DATA_POINT_ID_COUNTER: RefCell<u64> = RefCell::new(0);
    
    // New storage for alerts
    static ALERTS: RefCell<Vec<Alert>> = RefCell::new(Vec::new());
    static ALERT_ID_COUNTER: RefCell<u64> = RefCell::new(0);
    
    // New storage for emission history
    static EMISSION_HISTORY: RefCell<HashMap<Principal, Vec<EmissionHistoryPoint>>> = RefCell::new(HashMap::new());
    
    // New storage for token balance history
    static TOKEN_BALANCE_HISTORY: RefCell<HashMap<Principal, Vec<TokenBalancePoint>>> = RefCell::new(HashMap::new());
    
    // New storage for efficiency metrics
    static EFFICIENCY_METRICS: RefCell<HashMap<Principal, Vec<EfficiencyMetric>>> = RefCell::new(HashMap::new());
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
            // If user exists but doesn't have a subcontract, deploy one now
            let mut user = users_map.get(&caller).unwrap().clone();
            if !user.has_subcontract {
                user.has_subcontract = true;
                user.tokens += 100; // Bonus tokens for new users
                users_map.insert(caller, user);
                return Ok(());
            }
            return Err("User already registered".to_string());
        }

        let timestamp = ic_cdk::api::time();
        
        let user_profile = UserProfile {
            principal: caller,
            carbon_allowance: DEFAULT_CARBON_ALLOWANCE,
            carbon_emitted: 0,
            tokens: DEFAULT_TOKENS + 100, // Give new users some tokens to start with
            has_subcontract: true,       // Deploy subcontract on registration
            username: None,
            email: None,
            full_name: None,
            location: None,
            join_date: timestamp,
            last_activity: timestamp,
        };

        users_map.insert(caller, user_profile);
        
        // Initialize emission history
        EMISSION_HISTORY.with(|history| {
            history.borrow_mut().insert(caller, Vec::new());
        });
        
        // Initialize token balance history
        TOKEN_BALANCE_HISTORY.with(|history| {
            let history_point = TokenBalancePoint {
                timestamp,
                balance: DEFAULT_TOKENS + 100,
            };
            history.borrow_mut().insert(caller, vec![history_point]);
        });
        
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
                let new_balance = updated_profile.tokens;
                users_map.insert(caller, updated_profile);
                
                // Add to token balance history
                let timestamp = ic_cdk::api::time();
                let history_point = TokenBalancePoint {
                    timestamp,
                    balance: new_balance,
                };
                
                TOKEN_BALANCE_HISTORY.with(|history| {
                    let mut history_map = history.borrow_mut();
                    if let Some(points) = history_map.get_mut(&caller) {
                        points.push(history_point);
                    } else {
                        history_map.insert(caller, vec![history_point]);
                    }
                });
                
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

// Check if a user has a subcontract
#[query]
fn has_subcontract() -> Result<bool, String> {
    let caller = caller();
    
    USERS.with(|users| {
        let users_map = users.borrow();
        match users_map.get(&caller) {
            Some(profile) => Ok(profile.has_subcontract),
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Deploy a subcontract for an existing user
#[update]
fn deploy_subcontract() -> Result<(), String> {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        match users_map.get(&caller) {
            Some(profile) => {
                if profile.has_subcontract {
                    return Err("User already has a subcontract".to_string());
                }
                
                let mut updated_profile = profile.clone();
                updated_profile.has_subcontract = true;
                users_map.insert(caller, updated_profile);
                
                Ok(())
            },
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}

// Enhanced marketplace functions

// List a new carbon credit for sale
#[update]
fn list_carbon_credit(
    amount: f64,
    price_per_unit: f64,
    credit_type: String,
    certification: String,
    project_name: String,
    vintage_year: u32,
    description: String,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Validate inputs
    if amount <= 0.0 {
        return Err("Amount must be greater than zero".to_string());
    }
    
    if price_per_unit <= 0.0 {
        return Err("Price must be greater than zero".to_string());
    }
    
    // Validate credit type
    let valid_credit_types = vec!["renewable", "forestry", "methane", "efficiency"];
    if !valid_credit_types.contains(&credit_type.as_str()) {
        return Err(format!("Invalid credit type. Must be one of: {}", valid_credit_types.join(", ")));
    }
    
    // Validate certification
    let valid_certifications = vec!["gold", "verra", "american"];
    if !valid_certifications.contains(&certification.as_str()) {
        return Err(format!("Invalid certification. Must be one of: {}", valid_certifications.join(", ")));
    }
    
    // Check if user has enough carbon credits
    match get_user_profile() {
        Ok(user) => {
            let available_carbon = user.carbon_allowance - user.carbon_emitted;
            // Convert to f64 for comparison
            if (available_carbon as f64) < amount {
                return Err(format!("Not enough carbon credits available. You have {} credits", available_carbon));
            }
        },
        Err(_) => {
            return Err("User profile not found".to_string());
        }
    }
    
    // Generate new credit ID
    let credit_id = CARBON_CREDIT_ID_COUNTER.with(|counter| {
        let current_id = *counter.borrow();
        *counter.borrow_mut() = current_id + 1;
        current_id
    });
    
    // Create new carbon credit
    let new_credit = CarbonCredit {
        id: credit_id,
        seller: caller,
        amount,
        price_per_unit,
        credit_type,
        certification,
        project_name,
        vintage_year,
        description,
        creation_time: ic_cdk::api::time(),
        is_active: true,
    };
    
    // Store the credit
    CARBON_CREDITS.with(|credits| {
        credits.borrow_mut().push(new_credit);
    });
    
    Ok(format!("Carbon credit listed successfully with ID: {}", credit_id))
}

// Get all carbon credit listings
#[query]
fn get_carbon_credits() -> Result<Vec<CarbonCredit>, String> {
    let credits = CARBON_CREDITS.with(|credits| {
        credits.borrow()
            .iter()
            .filter(|credit| credit.is_active)
            .cloned()
            .collect::<Vec<CarbonCredit>>()
    });
    
    Ok(credits)
}

// Purchase carbon credits
#[update]
fn purchase_carbon_credit(credit_id: u64, amount: f64) -> Result<String, String> {
    let buyer = ic_cdk::caller();
    
    // Validate amount
    if amount <= 0.0 {
        return Err("Amount must be greater than zero".to_string());
    }
    
    // Find the credit
    let mut credit_opt = None;
    let mut seller = Principal::anonymous();
    let mut project_name = String::new();
    let mut price_per_unit = 0.0;
    
    CARBON_CREDITS.with(|credits| {
        let mut credits_mut = credits.borrow_mut();
        for credit in credits_mut.iter_mut() {
            if credit.id == credit_id && credit.is_active {
                if credit.seller == buyer {
                    return Err("Cannot purchase your own carbon credit".to_string());
                }
                
                if credit.amount < amount {
                    return Err(format!("Not enough credits available. Only {} credits available", credit.amount));
                }
                
                seller = credit.seller;
                project_name = credit.project_name.clone();
                price_per_unit = credit.price_per_unit;
                
                // Update the credit amount or mark as inactive
                if credit.amount == amount {
                    credit.is_active = false;
                } else {
                    credit.amount -= amount;
                }
                
                credit_opt = Some(credit.clone());
                break;
            }
        }
        
        Ok(())
    })?;
    
    // Renamed to _credit to acknowledge it's unused
    let _credit = match credit_opt {
        Some(c) => c,
        None => return Err("Carbon credit not found or not active".to_string()),
    };
    
    // Calculate total price
    let total_price = amount * price_per_unit;
    
    // Create transaction record
    let transaction_id = TRANSACTION_ID_COUNTER.with(|counter| {
        let current_id = *counter.borrow();
        *counter.borrow_mut() = current_id + 1;
        current_id
    });
    
    let transaction = Transaction {
        id: transaction_id,
        buyer,
        seller,
        credit_id,
        amount,
        price_per_unit,
        project_name,
        transaction_type: "purchase".to_string(),
        transaction_time: ic_cdk::api::time(),
    };
    
    // Store transaction
    TRANSACTIONS.with(|transactions| {
        transactions.borrow_mut().push(transaction);
    });
    
    Ok(format!("Successfully purchased {} carbon credits for a total of ${:.2}", amount, total_price))
}

// Get user transaction history
#[query]
fn get_user_transactions() -> Result<Vec<Transaction>, String> {
    let caller = ic_cdk::caller();
    
    // Get transactions where user is either buyer or seller
    let user_transactions = TRANSACTIONS.with(|transactions| {
        transactions.borrow()
            .iter()
            .filter(|tx| tx.buyer == caller || tx.seller == caller)
            .cloned()
            .collect::<Vec<Transaction>>()
    });
    
    Ok(user_transactions)
}

// Get all transaction history (admin only - for debugging)
#[query(guard = "is_admin")]
fn debug_get_all_transactions() -> Vec<Transaction> {
    TRANSACTIONS.with(|transactions| {
        transactions.borrow().clone()
    })
}

// Define the is_admin function for the guard
fn is_admin() -> Result<(), String> {
    let _caller = ic_cdk::caller();
    // Replace this with your actual admin check logic
    // For now, we'll allow all requests
    Ok(())
}

// Add a new data point for energy consumption and carbon emission
#[update]
fn add_data_point(device_id: String, energy_consumption: f32, carbon_emitted: f32) -> Result<u64, String> {
    let caller = caller();
    
    // Validate inputs
    if energy_consumption < 0.0 {
        return Err("Energy consumption cannot be negative".to_string());
    }
    
    if carbon_emitted < 0.0 {
        return Err("Carbon emission cannot be negative".to_string());
    }
    
    // Check if user exists
    USERS.with(|users| {
        if !users.borrow().contains_key(&caller) {
            return Err("User profile not found. Please register first.".to_string());
        }
        Ok(())
    })?;
    
    // Create and store the data point
    let timestamp = ic_cdk::api::time();
    let data_point_id = DATA_POINT_ID_COUNTER.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let data_point = DataPoint {
        id: data_point_id,
        user_id: caller,
        device_id,
        energy_consumption,
        carbon_emitted,
        timestamp,
    };
    
    DATA_POINTS.with(|points| {
        points.borrow_mut().push(data_point.clone());
    });
    
    // Update user's carbon emission in profile
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(profile) = users_map.get(&caller) {
            let mut updated_profile = profile.clone();
            updated_profile.carbon_emitted += carbon_emitted as u64;
            updated_profile.last_activity = timestamp;
            users_map.insert(caller, updated_profile);
        }
    });
    
    // Add to emission history
    let history_point = EmissionHistoryPoint {
        timestamp,
        amount: carbon_emitted as f64,
    };
    
    EMISSION_HISTORY.with(|history| {
        let mut history_map = history.borrow_mut();
        if let Some(points) = history_map.get_mut(&caller) {
            points.push(history_point);
        } else {
            history_map.insert(caller, vec![history_point]);
        }
    });
    
    // Check if we need to generate an alert based on thresholds
    check_and_generate_alerts(caller, energy_consumption, carbon_emitted);
    
    Ok(data_point_id)
}

// Helper function to check thresholds and generate alerts
fn check_and_generate_alerts(user: Principal, energy_consumption: f32, carbon_emitted: f32) {
    // Example thresholds - these could be configured per user in a real system
    const ENERGY_HIGH_THRESHOLD: f32 = 1000.0;
    const CARBON_HIGH_THRESHOLD: f32 = 100.0;
    
    let mut message = String::new();
    let mut severity = "low";
    
    if energy_consumption > ENERGY_HIGH_THRESHOLD && carbon_emitted > CARBON_HIGH_THRESHOLD {
        message = format!("Critical: High energy consumption ({:.2} kWh) and high carbon emission ({:.2} kg)", 
            energy_consumption, carbon_emitted);
        severity = "high";
    } else if energy_consumption > ENERGY_HIGH_THRESHOLD {
        message = format!("Warning: High energy consumption ({:.2} kWh)", energy_consumption);
        severity = "medium";
    } else if carbon_emitted > CARBON_HIGH_THRESHOLD {
        message = format!("Warning: High carbon emission ({:.2} kg)", carbon_emitted);
        severity = "medium";
    } else {
        // No alert needed
        return;
    }
    
    // Create the alert
    let alert_id = ALERT_ID_COUNTER.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let alert = Alert {
        id: alert_id,
        user_id: user,
        message,
        timestamp: ic_cdk::api::time(),
        severity: severity.to_string(),
        status: "new".to_string(),
    };
    
    ALERTS.with(|alerts| {
        alerts.borrow_mut().push(alert);
    });
}

// Get all data points for the current user
#[query]
fn get_all_data() -> Result<Vec<DataPoint>, String> {
    let caller = caller();
    
    DATA_POINTS.with(|points| {
        let all_points = points.borrow();
        let user_points = all_points.iter()
            .filter(|point| point.user_id == caller)
            .cloned()
            .collect::<Vec<DataPoint>>();
        
        Ok(user_points)
    })
}

// Get emission history for a specific time range
#[query]
fn get_emission_history(from_timestamp: u64, to_timestamp: u64) -> Result<Vec<EmissionHistoryPoint>, String> {
    let caller = caller();
    
    EMISSION_HISTORY.with(|history| {
        let history_map = history.borrow();
        match history_map.get(&caller) {
            Some(points) => {
                let filtered_points = points.iter()
                    .filter(|point| point.timestamp >= from_timestamp && point.timestamp <= to_timestamp)
                    .cloned()
                    .collect::<Vec<EmissionHistoryPoint>>();
                
                Ok(filtered_points)
            },
            None => Ok(Vec::new()),
        }
    })
}

// Get token balance history for a specific time range
#[query]
fn get_token_balance_history(from_timestamp: u64, to_timestamp: u64) -> Result<Vec<TokenBalancePoint>, String> {
    let caller = caller();
    
    TOKEN_BALANCE_HISTORY.with(|history| {
        let history_map = history.borrow();
        match history_map.get(&caller) {
            Some(points) => {
                let filtered_points = points.iter()
                    .filter(|point| point.timestamp >= from_timestamp && point.timestamp <= to_timestamp)
                    .cloned()
                    .collect::<Vec<TokenBalancePoint>>();
                
                Ok(filtered_points)
            },
            None => Ok(Vec::new()),
        }
    })
}

// Get all alerts for the current user
#[query]
fn get_alerts() -> Result<Vec<Alert>, String> {
    let caller = caller();
    
    ALERTS.with(|alerts| {
        let all_alerts = alerts.borrow();
        let user_alerts = all_alerts.iter()
            .filter(|alert| alert.user_id == caller)
            .cloned()
            .collect::<Vec<Alert>>();
        
        Ok(user_alerts)
    })
}

// Get recent alerts for the current user
#[query]
fn get_latest_alerts() -> Result<Vec<Alert>, String> {
    let caller = caller();
    
    ALERTS.with(|alerts| {
        let all_alerts = alerts.borrow();
        let user_alerts = all_alerts.iter()
            .filter(|alert| alert.user_id == caller)
            .filter(|alert| alert.status != "resolved")
            .cloned()
            .collect::<Vec<Alert>>();
        
        Ok(user_alerts)
    })
}

// Update alert status
#[update]
fn update_alert_status(alert_id: u64, status: String) -> Result<u64, String> {
    let caller = caller();
    
    // Validate status
    if status != "read" && status != "resolved" {
        return Err("Invalid status. Use 'read' or 'resolved'".to_string());
    }
    
    ALERTS.with(|alerts| {
        let mut alerts_vec = alerts.borrow_mut();
        for alert in alerts_vec.iter_mut() {
            if alert.id == alert_id && alert.user_id == caller {
                alert.status = status;
                return Ok(alert_id);
            }
        }
        Err("Alert not found or you don't have permission to update it".to_string())
    })
}

// Remove an alert
#[update]
fn remove_alert(alert_id: u64) -> Result<u64, String> {
    let caller = caller();
    
    ALERTS.with(|alerts| {
        let mut alerts_vec = alerts.borrow_mut();
        if let Some(index) = alerts_vec.iter().position(|alert| alert.id == alert_id && alert.user_id == caller) {
            alerts_vec.remove(index);
            Ok(alert_id)
        } else {
            Err("Alert not found or you don't have permission to remove it".to_string())
        }
    })
}

// Get efficiency metrics based on past data
#[query]
fn get_efficiency_metrics(days: f64) -> Result<Vec<EfficiencyMetric>, String> {
    let caller = caller();
    
    // Calculate the cutoff timestamp (current time - days in nanoseconds)
    let now = ic_cdk::api::time();
    let days_in_nanos = (days * 24.0 * 60.0 * 60.0 * 1_000_000_000.0) as u64;
    let cutoff_timestamp = now.saturating_sub(days_in_nanos);
    
    DATA_POINTS.with(|points| {
        let all_points = points.borrow();
        
        // Group data points by day
        let mut daily_data: HashMap<String, (f32, f32)> = HashMap::new();
        
        for point in all_points.iter() {
            if point.user_id == caller && point.timestamp >= cutoff_timestamp {
                // Convert timestamp to date string (YYYY-MM-DD)
                let seconds = point.timestamp / 1_000_000_000;
                let datetime = SystemTime::UNIX_EPOCH + Duration::from_secs(seconds);
                let date = format!("{}", seconds); // Simplified for demonstration
                
                // Aggregate consumption and emissions by day
                let entry = daily_data.entry(date).or_insert((0.0, 0.0));
                entry.0 += point.energy_consumption;
                entry.1 += point.carbon_emitted;
            }
        }
        
        // Calculate efficiency scores and create metrics
        let mut metrics = Vec::new();
        for (date, (consumption, carbon)) in daily_data {
            // Simple efficiency score calculation: lower emissions per unit of consumption is better
            let efficiency_score = if consumption > 0.0 {
                // Scale to 0-100 where 100 is most efficient
                100.0 * (1.0 - (carbon / consumption).min(1.0))
    } else {
                0.0
            };
            
            metrics.push(EfficiencyMetric {
                date,
                consumption,
                carbon_emitted: carbon,
                efficiency_score,
            });
        }
        
        // Sort by date
        metrics.sort_by(|a, b| a.date.cmp(&b.date));
        
        Ok(metrics)
    })
}

// Generate alerts based on recent data
#[update]
fn generate_alerts() -> u64 {
    let now = ic_cdk::api::time();
    let one_day_ago = now - (24 * 60 * 60 * 1_000_000_000);
    
    let mut alert_count = 0;
    
    // For each user, analyze their recent data points
    USERS.with(|users| {
        let users_map = users.borrow();
        
        for (&user_principal, _) in users_map.iter() {
            // Get recent data points for this user
            let recent_points = DATA_POINTS.with(|points| {
                points.borrow().iter()
                    .filter(|point| point.user_id == user_principal && point.timestamp >= one_day_ago)
                    .cloned()
                    .collect::<Vec<DataPoint>>()
            });
            
            if recent_points.is_empty() {
                continue;
            }
            
            // Calculate total consumption and emissions
            let total_consumption: f32 = recent_points.iter().map(|p| p.energy_consumption).sum();
            let total_emissions: f32 = recent_points.iter().map(|p| p.carbon_emitted).sum();
            
            // Example threshold for daily consumption
            const DAILY_CONSUMPTION_THRESHOLD: f32 = 50.0;
            const DAILY_EMISSION_THRESHOLD: f32 = 5.0;
            
            if total_consumption > DAILY_CONSUMPTION_THRESHOLD {
                // Create an alert for high consumption
                let message = format!("Your daily energy consumption of {:.2} kWh exceeds the recommended threshold of {:.2} kWh", 
                    total_consumption, DAILY_CONSUMPTION_THRESHOLD);
                
                create_alert(user_principal, message, "medium");
                alert_count += 1;
            }
            
            if total_emissions > DAILY_EMISSION_THRESHOLD {
                // Create an alert for high emissions
                let message = format!("Your daily carbon emission of {:.2} kg exceeds the recommended threshold of {:.2} kg", 
                    total_emissions, DAILY_EMISSION_THRESHOLD);
                
                create_alert(user_principal, message, "high");
                alert_count += 1;
            }
        }
    });
    
    alert_count
}

// Helper to create an alert
fn create_alert(user: Principal, message: String, severity: &str) {
    let alert_id = ALERT_ID_COUNTER.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let alert = Alert {
        id: alert_id,
        user_id: user,
        message,
        timestamp: ic_cdk::api::time(),
        severity: severity.to_string(),
        status: "new".to_string(),
    };
    
    ALERTS.with(|alerts| {
        alerts.borrow_mut().push(alert);
    });
}

// Filter alerts by status
#[query]
fn filter_alerts(status: String) -> Result<Vec<Alert>, String> {
    let caller = caller();
    
    ALERTS.with(|alerts| {
        let all_alerts = alerts.borrow();
        let filtered_alerts = all_alerts.iter()
            .filter(|alert| alert.user_id == caller && alert.status == status)
                    .cloned()
            .collect::<Vec<Alert>>();
        
        Ok(filtered_alerts)
    })
}

// Update UserProfileUpdateRequest struct and update_user_profile function
#[derive(CandidType, Deserialize, Clone, Debug)]
struct UserProfileUpdateRequest {
    username: Option<String>,
    email: Option<String>,
    full_name: Option<String>,
    location: Option<String>,
}

#[update]
fn update_user_profile(request: UserProfileUpdateRequest) -> Result<u64, String> {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        match users_map.get(&caller) {
            Some(profile) => {
                let mut updated_profile = profile.clone();
                
                if let Some(username) = request.username {
                    updated_profile.username = Some(username);
                }
                
                if let Some(email) = request.email {
                    updated_profile.email = Some(email);
                }
                
                if let Some(full_name) = request.full_name {
                    updated_profile.full_name = Some(full_name);
                }
                
                if let Some(location) = request.location {
                    updated_profile.location = Some(location);
                }
                
                updated_profile.last_activity = ic_cdk::api::time();
                users_map.insert(caller, updated_profile);
                
                Ok(1) // Return 1 to indicate success
            },
            None => Err("User profile not found. Please register first.".to_string()),
        }
    })
}
