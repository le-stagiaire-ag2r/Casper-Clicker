#!/bin/bash

# CasperClicker Deployment Script (Odra Edition)
# Usage: ./deploy.sh [testnet|mainnet] [path-to-secret-key.pem]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${1:-testnet}
SECRET_KEY=${2:-"$HOME/casper/secret_key.pem"}
WASM_PATH="contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm"

# Network configurations
if [ "$NETWORK" == "testnet" ]; then
    NODE_ADDRESS="http://65.21.235.219:7777"
    CHAIN_NAME="casper-test"
    echo -e "${YELLOW}📡 Deploying to TESTNET${NC}"
elif [ "$NETWORK" == "mainnet" ]; then
    NODE_ADDRESS="http://65.109.101.174:7777"
    CHAIN_NAME="casper"
    echo -e "${RED}⚠️  Deploying to MAINNET${NC}"
else
    echo -e "${RED}❌ Invalid network: $NETWORK${NC}"
    echo "Usage: ./deploy.sh [testnet|mainnet] [path-to-secret-key.pem]"
    exit 1
fi

# Check if WASM file exists
if [ ! -f "$WASM_PATH" ]; then
    echo -e "${RED}❌ WASM file not found: $WASM_PATH${NC}"
    echo -e "${YELLOW}💡 Building contract first...${NC}"
    cd contract && cargo build --release --target wasm32-unknown-unknown && cd ..
fi

# Check if secret key exists
if [ ! -f "$SECRET_KEY" ]; then
    echo -e "${RED}❌ Secret key not found: $SECRET_KEY${NC}"
    echo "Please provide the path to your secret key:"
    echo "  ./deploy.sh $NETWORK /path/to/secret_key.pem"
    exit 1
fi

echo -e "${GREEN}✅ WASM file found: $WASM_PATH ($(du -h $WASM_PATH | cut -f1))${NC}"
echo -e "${GREEN}✅ Secret key found: $SECRET_KEY${NC}"
echo ""
echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "  Network: $NETWORK"
echo "  Node: $NODE_ADDRESS"
echo "  Chain: $CHAIN_NAME"
echo "  Payment: 200 CSPR"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    exit 0
fi

echo -e "${YELLOW}🚀 Deploying contract...${NC}"

# Deploy the contract
DEPLOY_HASH=$(casper-client put-deploy \
    --node-address "$NODE_ADDRESS" \
    --chain-name "$CHAIN_NAME" \
    --secret-key "$SECRET_KEY" \
    --payment-amount 200000000000 \
    --session-path "$WASM_PATH" \
    | grep -oP '(?<=deploy_hash": ")[^"]+')

if [ -z "$DEPLOY_HASH" ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed!${NC}"
echo ""
echo -e "${GREEN}📝 Deploy Hash: $DEPLOY_HASH${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
echo "   You can check status at:"
echo "   https://testnet.cspr.live/deploy/$DEPLOY_HASH"
echo ""

# Wait and check deploy status
sleep 30

casper-client get-deploy \
    --node-address "$NODE_ADDRESS" \
    "$DEPLOY_HASH" | grep -A 10 "execution_result"

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Note your contract hash from the execution result above"
echo "2. Update assets/blockchain.js with the new contract hash"
echo "3. Test the contract by submitting a score from the frontend"
