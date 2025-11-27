use casperclicker_contract::casperclicker::CasperClickerContractRef;
use odra::host::{Deployer, HostRef, HostEnv};
use std::str::FromStr;

fn main() {
    println!("🧪 Test d'appel au contrat CasperClicker déployé");
    println!("==================================================\n");

    // Configuration du contrat déployé
    let contract_package_hash = "hash-49d21d7f14b34c781d69e0bdb2713d1ded994e51a029f57ef1f593d65d374dcb";

    println!("📋 Configuration:");
    println!("  Contract Package Hash: {}", contract_package_hash);
    println!("  Network: casper-test (testnet)");
    println!("  Node: https://node.testnet.casper.network/rpc\n");

    // Données de test valides
    let player_name = "TestPlayer".to_string();
    let total_earned = 10_000u64;
    let total_clicks = 500u64;
    let play_time = 200u64;
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    println!("📊 Données de test:");
    println!("  Player Name: {}", player_name);
    println!("  Total Earned: {}", total_earned);
    println!("  Total Clicks: {}", total_clicks);
    println!("  Play Time: {} seconds", play_time);
    println!("  Timestamp: {}\n", timestamp);

    // Vérification anti-cheat locale
    let per_click = total_earned / total_clicks;
    let min_play_time = total_earned / 100;

    println!("✅ Vérifications anti-cheat:");
    println!("  Earned per click: {} (max: 10,000)", per_click);
    println!("  Play time: {} seconds (min: {})", play_time, min_play_time);

    if per_click <= 10_000 && play_time >= min_play_time {
        println!("  ✅ Données valides!\n");
    } else {
        println!("  ❌ Données invalides - ajustez les valeurs\n");
        return;
    }

    println!("📤 Pour appeler le contrat, utilise:");
    println!("\ncasper-client put-transaction \\");
    println!("  --node-address https://node.testnet.casper.network/rpc \\");
    println!("  --chain-name casper-test \\");
    println!("  --secret-key /root/casper/secret_key.pem \\");
    println!("  --payment-amount 5000000000 \\");
    println!("  --transaction-contract-call \\");
    println!("  --entry-point submit_score \\");
    println!("  --contract-hash {} \\", contract_package_hash);
    println!("  --arg 'player_name:string={}' \\", player_name);
    println!("  --arg 'total_earned:u64={}' \\", total_earned);
    println!("  --arg 'total_clicks:u64={}' \\", total_clicks);
    println!("  --arg 'play_time:u64={}' \\", play_time);
    println!("  --arg 'timestamp:u64={}'\n", timestamp);

    println!("💡 Ou teste via le frontend en ouvrant index.html!");
}
