#![no_std]
#![no_main]

extern crate alloc;

use alloc::{
    collections::BTreeMap,
    string::{String, ToString},
    vec::Vec,
};

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};

use casper_types::{
    contracts::NamedKeys, CLType, CLValue, EntryPoint, EntryPointAccess, EntryPointType,
    EntryPoints, Key, Parameter, URef,
};

// Contract constants
const CONTRACT_KEY: &str = "casperclicker_contract";
const LEADERBOARD_KEY: &str = "leaderboard";
const CONTRACT_VERSION: &str = "contract_version";

// Entry point names
const ENTRY_SUBMIT_SCORE: &str = "submit_score";
const ENTRY_GET_LEADERBOARD: &str = "get_leaderboard";
const ENTRY_GET_PLAYER_SCORE: &str = "get_player_score";

/// Player score structure stored as serialized data
#[derive(Clone)]
struct PlayerScore {
    player_name: String,
    wallet_address: String,
    total_earned: u64,
    total_clicks: u64,
    play_time: u64,
    timestamp: u64,
}

/// Submit a player's score to the leaderboard
#[no_mangle]
pub extern "C" fn submit_score() {
    // Get parameters from caller
    let player_name: String = runtime::get_named_arg("player_name");
    let wallet_address: String = runtime::get_named_arg("wallet_address");
    let total_earned: u64 = runtime::get_named_arg("total_earned");
    let total_clicks: u64 = runtime::get_named_arg("total_clicks");
    let play_time: u64 = runtime::get_named_arg("play_time");
    let timestamp: u64 = runtime::get_named_arg("timestamp");

    // Anti-cheat validation
    // Check that earned/clicks ratio is reasonable (max 10000 per click)
    let max_per_click = 10000u64;
    if total_clicks > 0 && total_earned / total_clicks > max_per_click {
        runtime::revert(casper_types::ApiError::User(1)); // Cheat detected
    }

    // Check that play time is reasonable (at least 1 second per 100 earned)
    if play_time > 0 && total_earned > 0 {
        let min_play_time = total_earned / 100;
        if play_time < min_play_time {
            runtime::revert(casper_types::ApiError::User(2)); // Impossible play time
        }
    }

    // Get or create leaderboard dictionary
    let leaderboard_uref: URef = runtime::get_key(LEADERBOARD_KEY)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    // Create score data as comma-separated string for storage
    let score_data = alloc::format!(
        "{},{},{},{},{},{}",
        player_name, wallet_address, total_earned, total_clicks, play_time, timestamp
    );

    // Store under wallet address key
    storage::dictionary_put(leaderboard_uref, &wallet_address, score_data);
}

/// Get the entire leaderboard (returns top 100 players)
#[no_mangle]
pub extern "C" fn get_leaderboard() {
    let leaderboard_uref: URef = runtime::get_key(LEADERBOARD_KEY)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    // Note: In production, you would implement pagination
    // For now, we return a success signal
    // The actual data reading happens off-chain via RPC calls
    runtime::ret(CLValue::from_t(true).unwrap_or_revert());
}

/// Get a specific player's score
#[no_mangle]
pub extern "C" fn get_player_score() {
    let wallet_address: String = runtime::get_named_arg("wallet_address");

    let leaderboard_uref: URef = runtime::get_key(LEADERBOARD_KEY)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    let score_data: Option<String> = storage::dictionary_get(leaderboard_uref, &wallet_address)
        .unwrap_or_revert();

    match score_data {
        Some(data) => runtime::ret(CLValue::from_t(data).unwrap_or_revert()),
        None => runtime::ret(CLValue::from_t("".to_string()).unwrap_or_revert()),
    }
}

/// Install the contract
#[no_mangle]
pub extern "C" fn call() {
    // Create entry points
    let mut entry_points = EntryPoints::new();

    // submit_score entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_SUBMIT_SCORE,
        vec![
            Parameter::new("player_name", CLType::String),
            Parameter::new("wallet_address", CLType::String),
            Parameter::new("total_earned", CLType::U64),
            Parameter::new("total_clicks", CLType::U64),
            Parameter::new("play_time", CLType::U64),
            Parameter::new("timestamp", CLType::U64),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // get_leaderboard entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_GET_LEADERBOARD,
        vec![],
        CLType::Bool,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // get_player_score entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_GET_PLAYER_SCORE,
        vec![Parameter::new("wallet_address", CLType::String)],
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create initial leaderboard dictionary
    let leaderboard_dict_uref = storage::new_dictionary(LEADERBOARD_KEY).unwrap_or_revert();

    // Create named keys
    let mut named_keys = NamedKeys::new();
    named_keys.insert(LEADERBOARD_KEY.to_string(), leaderboard_dict_uref.into());

    // Install contract
    let (contract_hash, contract_version) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some(CONTRACT_KEY.to_string()),
        Some(CONTRACT_VERSION.to_string()),
    );

    // Store contract hash for future access
    runtime::put_key(CONTRACT_KEY, contract_hash.into());
    runtime::put_key(CONTRACT_VERSION, storage::new_uref(contract_version).into());
}
