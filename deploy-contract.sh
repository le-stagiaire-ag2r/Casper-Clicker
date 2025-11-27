#!/bin/bash
#
# Script de déploiement du contrat CasperClicker sur le testnet Casper
# Usage: ./deploy-contract.sh [PAYMENT_AMOUNT]
#
# Par défaut: 75 CSPR (75000000000 motes)
#

set -e

# Configuration
NODE_ADDRESS="https://node.testnet.casper.network/rpc"
CHAIN_NAME="casper-test"
SECRET_KEY="/root/casper/secret_key.pem"
WASM_PATH="./contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm"
PAYMENT_AMOUNT="${1:-75000000000}"  # 75 CSPR par défaut

echo "🚀 Déploiement du contrat CasperClicker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Node: $NODE_ADDRESS"
echo "⛓️  Chain: $CHAIN_NAME"
echo "💰 Payment: $PAYMENT_AMOUNT motes ($(echo "scale=2; $PAYMENT_AMOUNT / 1000000000" | bc) CSPR)"
echo "📦 WASM: $WASM_PATH"
echo ""

# Vérifier que le WASM existe
if [ ! -f "$WASM_PATH" ]; then
    echo "❌ ERREUR: Le fichier WASM n'existe pas !"
    echo "   Exécutez d'abord: cd contract && cargo build --target wasm32-unknown-unknown --release"
    exit 1
fi

# Vérifier que la clé existe
if [ ! -f "$SECRET_KEY" ]; then
    echo "❌ ERREUR: La clé secrète n'existe pas à $SECRET_KEY"
    exit 1
fi

echo "⏳ Déploiement en cours..."
echo ""

# Déployer le contrat
casper-client put-transaction session \
  --node-address "$NODE_ADDRESS" \
  --secret-key "$SECRET_KEY" \
  --chain-name "$CHAIN_NAME" \
  --wasm-path "$WASM_PATH" \
  --payment-amount "$PAYMENT_AMOUNT" \
  --gas-price-tolerance 5 \
  --install-upgrade \
  --standard-payment true \
  --ttl 30min

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Transaction soumise avec succès !"
echo ""
echo "📌 Prochaines étapes:"
echo "   1. Copie le transaction hash ci-dessus"
echo "   2. Attends 2-3 minutes que la transaction soit traitée"
echo "   3. Vérifie sur: https://testnet.cspr.live/transaction/[HASH]"
echo "   4. Récupère le contract package hash depuis le block explorer"
echo ""
