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
DEPLOY_OUTPUT=$(casper-client put-deploy \
    --node-address "$NODE_ADDRESS" \
    --chain-name "$CHAIN_NAME" \
    --secret-key "$SECRET_KEY" \
    --payment-amount 200000000000 \
    --session-path "$WASM_PATH" 2>&1)

# Check for 403 Forbidden error
if echo "$DEPLOY_OUTPUT" | grep -q "403 Forbidden"; then
    echo -e "${RED}❌ RPC node blocked the deployment (403 Forbidden)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Les nœuds RPC publics bloquent actuellement les déploiements directs.${NC}"
    echo ""
    echo -e "${GREEN}📋 Solution Alternative : Utilise l'interface web${NC}"
    echo ""
    echo "Option 1 : Interface HTML locale"
    echo "  1. Ouvre deploy-contract.html dans ton navigateur"
    echo "  2. Télécharge le WASM"
    echo "  3. Suis les instructions"
    echo ""
    echo "Option 2 : Directement sur testnet.cspr.live"
    echo "  1. Va sur https://testnet.cspr.live/deploy"
    echo "  2. Connecte ton wallet ou importe ta clé"
    echo "  3. Upload: $WASM_PATH ($(du -h $WASM_PATH | cut -f1))"
    echo "  4. Payment: 200000000000 motes"
    echo "  5. Session Args: (vide)"
    echo "  6. Clique 'Sign & Deploy'"
    echo ""
    exit 1
fi

DEPLOY_HASH=$(echo "$DEPLOY_OUTPUT" | grep -oP '(?<=deploy_hash": ")[^"]+')

if [ -z "$DEPLOY_HASH" ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
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
