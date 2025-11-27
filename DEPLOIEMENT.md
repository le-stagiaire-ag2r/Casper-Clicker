# 📘 Guide de Déploiement - CasperClicker

## 🎯 Résumé

Le contrat CasperClicker est développé avec **Odra 2.4.0** et prêt pour le déploiement sur **Casper 2.0**.

### ✅ Ce qui fonctionne

- ✅ Contrat Odra compilé avec succès
- ✅ WASM généré (225KB) : `contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm`
- ✅ Build script (`build.rs`) ajouté
- ✅ Compatible avec Casper 2.0 testnet
- ✅ Script de déploiement prêt

### ⏳ En attente

- ⏳ Déploiement sur le testnet (RPC temporairement inaccessible)

---

## 🔨 Build du Contrat

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

Le WASM sera généré dans :
```
contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm
```

---

## 🚀 Déploiement

### Option 1 : Script automatique (recommandé)

```bash
./deploy-contract.sh [MONTANT_EN_MOTES]
```

Exemples :
```bash
# Avec 75 CSPR (par défaut)
./deploy-contract.sh

# Avec 100 CSPR
./deploy-contract.sh 100000000000

# Avec 50 CSPR
./deploy-contract.sh 50000000000
```

### Option 2 : Commande manuelle

```bash
casper-client put-transaction session \
  --node-address https://node.testnet.casper.network/rpc \
  --secret-key /root/casper/secret_key.pem \
  --chain-name casper-test \
  --wasm-path ./contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm \
  --payment-amount 75000000000 \
  --gas-price-tolerance 5 \
  --install-upgrade \
  --standard-payment true \
  --ttl 30min
```

---

## 📊 Vérification du Déploiement

### 1. Récupérer le Transaction Hash

Après le déploiement, note le transaction hash qui ressemble à :
```
9ae8ea8e0b0f1e35bcb74fe053c8d86e396ee0395e0024f80b33c0ec33eb0acf
```

### 2. Vérifier sur le Block Explorer

```
https://testnet.cspr.live/transaction/[TRANSACTION_HASH]
```

### 3. Attendre la confirmation (2-3 minutes)

Le statut doit passer de "Pending" à "Success".

### 4. Récupérer le Contract Package Hash

Une fois la transaction confirmée, cherche dans la section "Execution Results" le `contract_package_hash`.

Il ressemble à :
```
hash-c447e9d334a710bc3e0a47cbea854c269e41637d7b9aa9d37a745596f651ed7a
```

---

## 🔍 Vérification avec RPC

### Vérifier le statut de la transaction

```bash
curl -s -X POST https://node.testnet.casper.network/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "info_get_transaction",
    "params": {
      "transaction_hash": {
        "Version1": "VOTRE_TRANSACTION_HASH"
      },
      "finalized_approvals": true
    }
  }' | jq
```

### Vérifier la balance restante

```bash
casper-client account-address --public-key /root/casper/public_key.pem
casper-client query-global-state \
  --node-address https://node.testnet.casper.network/rpc \
  --state-root-hash $(casper-client get-state-root-hash --node-address https://node.testnet.casper.network/rpc | jq -r '.result.state_root_hash') \
  --key account-hash-VOTRE_HASH \
  -q "balance/main-purse"
```

---

## 🔧 Troubleshooting

### ❌ Erreur: "Module doesn't have export call"

**Cause** : Le WASM n'a pas été compilé correctement.

**Solution** :
```bash
cd contract
cargo clean
cargo build --target wasm32-unknown-unknown --release
```

### ❌ Erreur: "error sending request"

**Cause** : Le RPC testnet est temporairement inaccessible.

**Solution** : Attendre quelques minutes et réessayer.

### ❌ Erreur: "Insufficient funds"

**Cause** : Pas assez de CSPR dans le wallet.

**Solution** : Réduire le payment amount ou obtenir des CSPR du faucet :
```
https://testnet.cspr.live/tools/faucet
```

### ❌ Erreur: "Gas limit exceeded"

**Cause** : Le payment amount est trop faible.

**Solution** : Augmenter le payment :
```bash
./deploy-contract.sh 100000000000  # 100 CSPR
```

---

## 📚 Ressources

- [Casper Testnet Explorer](https://testnet.cspr.live)
- [Casper Testnet Faucet](https://testnet.cspr.live/tools/faucet)
- [Odra Framework Docs](https://odra.dev/docs/)
- [Casper 2.0 Docs](https://docs.casper.network/)
- [Donation Demo (référence)](https://github.com/casper-ecosystem/donation-demo)

---

## 📝 Historique des Déploiements

| Date | Transaction Hash | Statut | Gas Used | Notes |
|------|------------------|--------|----------|-------|
| 2025-11-27 | b1f3b5442d35a6... | ❌ Failed | 200 CSPR | Premier test - args Odra manquants |
| 2025-11-27 | aae0fe7f560bdb... | ❌ Failed | 200 CSPR | Deuxième test - même erreur "export call" |
| En attente | - | ⏳ Pending | 75 CSPR | Avec build.rs correct |

---

## ⚡ Quick Start

```bash
# 1. Build
cd contract && cargo build --target wasm32-unknown-unknown --release

# 2. Deploy
cd .. && ./deploy-contract.sh

# 3. Wait 2-3 minutes

# 4. Check on explorer
# https://testnet.cspr.live

# 5. Update frontend with contract hash
# Edit deploy-web.html with the new contract_package_hash
```

---

**Dernière mise à jour** : 2025-11-27
**Statut** : ✅ Prêt pour déploiement (en attente accessibilité RPC)
