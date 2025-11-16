# 🚀 CasperClicker - Blockchain Deployment Guide

This guide explains how to deploy the CasperClicker smart contract to Casper Testnet and enable the **global multiplayer leaderboard** feature.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Build the Smart Contract](#build-the-smart-contract)
3. [Deploy to Casper Testnet](#deploy-to-casper-testnet)
4. [Configure Frontend](#configure-frontend)
5. [Testing Multiplayer](#testing-multiplayer)
6. [Architecture Overview](#architecture-overview)

---

## ✅ Prerequisites

### 1. Install Rust Toolchain

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install nightly toolchain
rustup install nightly-2024-02-07

# Add WASM target
rustup target add --toolchain nightly-2024-02-07 wasm32-unknown-unknown
```

### 2. Install Casper Client

```bash
cargo install casper-client
```

Verify installation:
```bash
casper-client --version
```

### 3. Get Testnet Tokens

1. Visit: https://testnet.cspr.live/tools/faucet
2. Enter your wallet address
3. Request test CSPR tokens (you'll need ~100 CSPR for deployment)

### 4. Install CSPR.click Wallet

- Browser Extension: https://cspr.click
- Mobile App: Available on iOS/Android

---

## 🔨 Build the Smart Contract

### Option 1: Using Makefile (Recommended)

```bash
# Install dependencies
make install-deps

# Build contract
make build-contract
```

### Option 2: Manual Build

```bash
cd contract
cargo build --release --target wasm32-unknown-unknown
```

The compiled WASM file will be at:
```
contract/target/wasm32-unknown-unknown/release/casperclicker.wasm
```

**Expected file size:** ~50-100 KB

---

## 🌐 Deploy to Casper Testnet

### Step 1: Generate Keys (if you don't have them)

```bash
casper-client keygen /path/to/keys
```

This creates:
- `secret_key.pem` - Private key (KEEP SECURE!)
- `public_key.pem` - Public key
- `public_key_hex` - Public key in hex format

### Step 2: Deploy the Contract

```bash
casper-client put-deploy \
  --node-address http://65.21.235.219:7777 \
  --chain-name casper-test \
  --secret-key ~/casper/secret_key.pem \
  --payment-amount 100000000000 \
  --session-path contract/target/wasm32-unknown-unknown/release/casperclicker.wasm
```

**Parameters explained:**
- `node-address`: Casper Testnet RPC endpoint
- `chain-name`: casper-test (for testnet)
- `payment-amount`: 100 CSPR (100000000000 motes)
- `session-path`: Path to compiled WASM

### Step 3: Get Deploy Hash

The command will return a deploy hash:
```
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "api_version": "1.5.6",
    "deploy_hash": "1234567890abcdef..."
  }
}
```

**Save this deploy hash!** You'll need it to check deployment status.

### Step 4: Check Deployment Status

```bash
casper-client get-deploy \
  --node-address http://65.21.235.219:7777 \
  <YOUR_DEPLOY_HASH>
```

Wait for `"execution_result": "Success"`.

### Step 5: Get Contract Hash

After successful deployment, query your account to find the contract hash:

```bash
casper-client query-global-state \
  --node-address http://65.21.235.219:7777 \
  --state-root-hash <STATE_ROOT_HASH> \
  --key <YOUR_PUBLIC_KEY_HEX>
```

Look for `casperclicker_contract` in the named keys. Copy the contract hash.

---

## ⚙️ Configure Frontend

### Step 1: Update Contract Hash

Edit `blockchain.js` and set your contract hash:

```javascript
const CASPER_CONFIG = {
    nodeAddress: 'http://65.21.235.219:7777/rpc',
    chainName: 'casper-test',

    // ADD YOUR CONTRACT HASH HERE
    contractHash: 'hash-1234567890abcdef...', // ← Replace with your contract hash
    contractPackageHash: '', // ← Also update if available

    entryPoints: {
        submitScore: 'submit_score',
        getLeaderboard: 'get_leaderboard',
        getPlayerScore: 'get_player_score'
    }
};
```

### Step 2: Deploy Frontend

Push changes to GitHub:

```bash
git add blockchain.js
git commit -m "✅ Add contract hash for Testnet deployment"
git push
```

GitHub Pages will automatically redeploy within 2-3 minutes.

### Step 3: Test the Integration

1. Visit: https://your-username.github.io/Casper-Clicker/
2. Click "Connect Wallet"
3. Approve connection in CSPR.click
4. Play the game to earn some score
5. Click "📤 Submit to Blockchain"
6. Confirm transaction in wallet
7. Wait ~30 seconds for confirmation
8. Click "🔄 Refresh" to see updated leaderboard

---

## 🧪 Testing Multiplayer

### Test with Multiple Accounts

1. **Create test accounts:**
   - Use CSPR.click to create multiple wallets
   - Request testnet tokens for each wallet

2. **Submit scores from different accounts:**
   ```bash
   # Account 1: Play normally
   # Account 2: Open in incognito window
   # Account 3: Use different browser
   ```

3. **Verify leaderboard updates:**
   - All players should see the same global leaderboard
   - Rankings update based on total earned
   - No local storage conflicts

### Anti-Cheat Testing

The smart contract includes anti-cheat validation:

**Test 1: Impossible Click Ratio**
```javascript
// This will FAIL (10M earned with 1 click)
{
  total_earned: 10000000,
  total_clicks: 1
}
// Error: Cheat detected (User Error 1)
```

**Test 2: Impossible Play Time**
```javascript
// This will FAIL (10M earned in 1 second)
{
  total_earned: 10000000,
  play_time: 1
}
// Error: Impossible play time (User Error 2)
```

**Valid submission example:**
```javascript
{
  player_name: "TestPlayer",
  total_earned: 10000,
  total_clicks: 500,
  play_time: 300  // 5 minutes
}
// Success! Reasonable ratios
```

---

## 📊 Architecture Overview

### System Components

```
┌─────────────────┐
│   Player 1      │
│  (Browser A)    │
└────────┬────────┘
         │
         │ CSPR.click
         ▼
┌─────────────────────────────┐
│  Casper Testnet Blockchain  │
│  ┌────────────────────────┐ │
│  │ CasperClicker Contract │ │
│  │ - submit_score()       │ │
│  │ - get_leaderboard()    │ │
│  │ - get_player_score()   │ │
│  │ - Anti-cheat logic     │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
         ▲
         │ CSPR.click
         │
┌────────┴────────┐
│   Player 2      │
│  (Browser B)    │
└─────────────────┘
```

### Data Flow

1. **Player submits score:**
   - Frontend: `submitScoreToBlockchain(playerData)`
   - Blockchain.js: Creates deploy with contract call
   - CSPR.click: Signs transaction with player's private key
   - Casper Network: Executes contract, validates data, stores on-chain

2. **Player views leaderboard:**
   - Frontend: `fetchGlobalLeaderboard()`
   - Blockchain.js: Queries contract state via RPC
   - Casper Network: Returns all player scores
   - Frontend: Displays ranked leaderboard

### Smart Contract Functions

#### `submit_score`
Stores player score on-chain with anti-cheat validation.

**Parameters:**
- `player_name`: String
- `wallet_address`: String
- `total_earned`: U64
- `total_clicks`: U64
- `play_time`: U64
- `timestamp`: U64

**Validation:**
- Checks earned/clicks ratio (max 10,000 per click)
- Checks play_time reasonableness (min 1 sec per 100 earned)

#### `get_player_score`
Retrieves a specific player's score.

**Parameters:**
- `wallet_address`: String

**Returns:**
- CSV string: "name,address,earned,clicks,time,timestamp"

#### `get_leaderboard`
Returns signal for off-chain indexing.

**Note:** Full leaderboard retrieval requires iterating dictionary keys via RPC calls. In production, implement an event listener service.

---

## 🎯 Production Deployment (Mainnet)

### Differences from Testnet

1. **Chain name:** `casper` instead of `casper-test`
2. **Node address:** https://node.mainnet.casperlabs.io/rpc
3. **Real CSPR:** Deployment costs real money (~$10-20 USD)
4. **Immutable:** Contract cannot be changed after deployment

### Mainnet Deployment Command

```bash
casper-client put-deploy \
  --node-address https://node.mainnet.casperlabs.io/rpc \
  --chain-name casper \
  --secret-key ~/casper/mainnet_secret_key.pem \
  --payment-amount 100000000000 \
  --session-path contract/target/wasm32-unknown-unknown/release/casperclicker.wasm
```

### Recommended: Audit Before Mainnet

- Test thoroughly on Testnet with multiple users
- Perform security audit of smart contract
- Test all anti-cheat mechanisms
- Ensure all edge cases are handled

---

## 🐛 Troubleshooting

### "Insufficient funds" error
- Get more testnet tokens from faucet
- Minimum required: 100 CSPR for deployment

### "Contract not found" error
- Verify contract hash is correct in `blockchain.js`
- Check deployment succeeded with `get-deploy`

### "CSPR.click not detected" error
- Install browser extension from https://cspr.click
- Refresh page after installation

### Leaderboard shows demo data
- Contract hash not configured in `blockchain.js`
- Or contract not deployed yet

### Score submission fails
- Check wallet has CSPR for gas fees (~1 CSPR per submission)
- Verify anti-cheat validation passes
- Check browser console for detailed errors

---

## 📚 Additional Resources

- **Casper Documentation:** https://docs.casper.network
- **CSPR.click Wallet:** https://cspr.click
- **Testnet Explorer:** https://testnet.cspr.live
- **Mainnet Explorer:** https://cspr.live
- **Casper Discord:** https://discord.gg/casperblockchain

---

## 🎮 Next Steps

After successful deployment:

1. ✅ Test with multiple accounts
2. ✅ Share game link with community
3. ✅ Monitor leaderboard for submissions
4. ✅ Consider adding features:
   - NFT rewards for top players
   - Seasonal competitions
   - Achievement NFTs
   - Integration with StakeVue protocol

**Built for Casper Hackathon 2026** 🏆
