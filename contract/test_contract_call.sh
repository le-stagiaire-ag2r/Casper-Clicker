#!/bin/bash

# Script de test pour appeler le contrat CasperClicker déployé
# Ce script soumet un score de test au contrat

set -e

echo "🧪 Test d'appel au contrat CasperClicker"
echo "========================================="
echo ""

# Configuration
CONTRACT_HASH="hash-49d21d7f14b34c781d69e0bdb2713d1ded994e51a029f57ef1f593d65d374dcb"
NODE_ADDRESS="https://node.testnet.casper.network/rpc"
CHAIN_NAME="casper-test"
SECRET_KEY="/root/casper/secret_key.pem"

# Données de test (valeurs valides pour passer les anti-cheat)
PLAYER_NAME="TestPlayer"
TOTAL_EARNED=10000        # 10,000 coins
TOTAL_CLICKS=500          # 500 clicks = 20 per click (under 10,000 limit)
PLAY_TIME=200             # 200 seconds (10000/100 = 100 min required, so 200 is safe)
TIMESTAMP=$(date +%s)

echo "📊 Données de test:"
echo "  Player Name: $PLAYER_NAME"
echo "  Total Earned: $TOTAL_EARNED"
echo "  Total Clicks: $TOTAL_CLICKS"
echo "  Play Time: $PLAY_TIME seconds"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Vérifier que la clé privée existe
if [ ! -f "$SECRET_KEY" ]; then
    echo "❌ Clé privée non trouvée: $SECRET_KEY"
    exit 1
fi

echo "📤 Envoi de la transaction..."
echo ""

# Appel via casper-client (si disponible)
if command -v casper-client &> /dev/null; then
    casper-client put-transaction \
        --node-address "$NODE_ADDRESS" \
        --chain-name "$CHAIN_NAME" \
        --secret-key "$SECRET_KEY" \
        --payment-amount 5000000000 \
        --transaction-contract-call \
        --entry-point "submit_score" \
        --contract-hash "$CONTRACT_HASH" \
        --arg "player_name:string='$PLAYER_NAME'" \
        --arg "total_earned:u64='$TOTAL_EARNED'" \
        --arg "total_clicks:u64='$TOTAL_CLICKS'" \
        --arg "play_time:u64='$PLAY_TIME'" \
        --arg "timestamp:u64='$TIMESTAMP'"
else
    echo "⚠️  casper-client non disponible"
    echo "💡 Utilisons une approche alternative via curl..."
    echo ""
    echo "Pour tester manuellement, utilise cette commande:"
    echo ""
    echo "casper-client put-transaction \\"
    echo "  --node-address $NODE_ADDRESS \\"
    echo "  --chain-name $CHAIN_NAME \\"
    echo "  --secret-key $SECRET_KEY \\"
    echo "  --payment-amount 5000000000 \\"
    echo "  --transaction-contract-call \\"
    echo "  --entry-point submit_score \\"
    echo "  --contract-hash $CONTRACT_HASH \\"
    echo "  --arg 'player_name:string=$PLAYER_NAME' \\"
    echo "  --arg 'total_earned:u64=$TOTAL_EARNED' \\"
    echo "  --arg 'total_clicks:u64=$TOTAL_CLICKS' \\"
    echo "  --arg 'play_time:u64=$PLAY_TIME' \\"
    echo "  --arg 'timestamp:u64=$TIMESTAMP'"
    echo ""
fi

echo ""
echo "✅ Script terminé"
