#!/bin/bash

# CasperClicker Testnet Deployment Script
# Requires: casper-client installed

set -e

echo "🚀 Deploying CasperClicker to Casper Testnet..."

# Configuration
NODE_ADDRESS="http://3.14.161.135:7777"  # Alternative testnet node
CHAIN_NAME="casper-test"
SECRET_KEY="contract/secret_key.pem"
WASM_FILE="contract/wasm/CasperClicker.wasm"
PAYMENT_AMOUNT="200000000000"  # 200 CSPR

# Verify files exist
if [ ! -f "$SECRET_KEY" ]; then
    echo "❌ Secret key not found at $SECRET_KEY"
    exit 1
fi

if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found at $WASM_FILE"
    echo "Run: cd contract && cargo odra build"
    exit 1
fi

echo "📝 Contract: $WASM_FILE"
echo "💰 Payment: $PAYMENT_AMOUNT motes (200 CSPR)"
echo "🌐 Node: $NODE_ADDRESS"
echo ""

# Deploy contract
echo "📤 Sending deployment transaction..."
DEPLOY_HASH=$(casper-client put-transaction session \
  --node-address "$NODE_ADDRESS" \
  --chain-name "$CHAIN_NAME" \
  --secret-key "$SECRET_KEY" \
  --payment-amount "$PAYMENT_AMOUNT" \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --wasm-path "$WASM_FILE" \
  --install-upgrade 2>&1 | grep -oP 'transaction_hash: "\K[^"]+' || echo "")

if [ -z "$DEPLOY_HASH" ]; then
    echo "❌ Deployment failed. Trying legacy put-deploy..."
    casper-client put-deploy \
      --node-address "$NODE_ADDRESS" \
      --chain-name "$CHAIN_NAME" \
      --secret-key "$SECRET_KEY" \
      --payment-amount "$PAYMENT_AMOUNT" \
      --session-path "$WASM_FILE"
    exit 0
fi

echo "✅ Transaction sent successfully!"
echo "📋 Transaction Hash: $DEPLOY_HASH"
echo ""
echo "⏳ Wait ~60 seconds, then check:"
echo "   https://testnet.cspr.live/transaction/$DEPLOY_HASH"
echo ""
echo "To get contract hash, run after confirmation:"
echo "   casper-client get-deploy --node-address $NODE_ADDRESS $DEPLOY_HASH"
