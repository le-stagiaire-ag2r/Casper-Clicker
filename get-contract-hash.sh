#!/bin/bash

# Script to extract contract hash from deploy hash
DEPLOY_HASH="aae0fe7f560bdb9ab79cb3ed6ea41f5c4e146ece53eab520ad5b8a2f1fc64d62"
NODE="http://3.14.161.135:7777"

echo "🔍 Fetching contract hash from deploy: $DEPLOY_HASH"
echo ""

# Try with casper-client
casper-client get-deploy \
  --node-address "$NODE" \
  "$DEPLOY_HASH" 2>&1 | grep -A 5 "WriteContractPackage\|WriteContract" || echo "Trying alternative method..."

echo ""
echo "📋 To get contract hash manually:"
echo "1. Visit: https://testnet.cspr.live/deploy/$DEPLOY_HASH"
echo "2. Look for 'Contract Package Hash' or 'Contract Hash' in the execution results"
echo "3. Copy the hash (format: contract-...)"
