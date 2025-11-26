# 🚀 Guide de Déploiement CasperClicker

## Étape 1️⃣ : Prérequis (5 min)

### Installer Rust et casper-client
```bash
# Installer Rust (si pas déjà fait)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installer casper-client
cargo install casper-client --version 2.0.0
```

## Étape 2️⃣ : Préparer ta clé (2 min)

Crée le fichier `secret_key.pem` :

```bash
mkdir -p ~/casper
cat > ~/casper/secret_key.pem << 'EOF'
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh
-----END PRIVATE KEY-----
EOF

chmod 600 ~/casper/secret_key.pem
```

## Étape 3️⃣ : Cloner et compiler (5 min)

```bash
# Cloner le repo
git clone https://github.com/le-stagiaire-ag2r/Casper-Clicker.git
cd Casper-Clicker
git checkout claude/debug-cspr-transfer-test-01EQVkdKtc7hFi6NME1VR6qi

# Le WASM est déjà compilé et inclus dans le repo !
# Sinon, pour recompiler :
cd contract
cargo build --release --target wasm32-unknown-unknown
cd ..
```

## Étape 4️⃣ : DÉPLOYER ! (2 min) 🎯

```bash
./deploy.sh testnet ~/casper/secret_key.pem
```

Le script va :
- ✅ Vérifier le WASM (224 KB)
- ✅ Vérifier ta clé
- ✅ Te demander confirmation
- ✅ Déployer sur testnet Casper
- ✅ Afficher le deploy hash

**Coût : ~200 CSPR** (tu en as 999 ✅)

## Étape 5️⃣ : Vérifier le déploiement

Une fois déployé, tu recevras :

```
Deploy Hash: 0123456789abcdef...
```

Vérifie sur l'explorateur :
```
https://testnet.cspr.live/deploy/TON_DEPLOY_HASH
```

## Étape 6️⃣ : Récupérer le Contract Hash

Après ~2 minutes, le contrat sera déployé. Récupère le **contract hash** depuis l'explorateur.

Mets-le dans `assets/blockchain.js` :

```javascript
const CONTRACT_HASH = "hash-XXXXXXXXXXXXXXXX"; // ← Ton nouveau hash
```

## 🎮 Tester le jeu !

1. Ouvre `index.html` dans ton navigateur
2. Connecte ton wallet CSPR.click
3. Joue et soumets un score
4. Vérifie sur l'explorateur que l'événement `ScoreSubmitted` est émis !

---

## ⚠️ Problème ?

Si le déploiement échoue :

**Vérifier ton solde :**
```bash
casper-client get-balance \
  --node-address https://rpc.testnet.casperlabs.io \
  --state-root-hash $(casper-client get-state-root-hash --node-address https://rpc.testnet.casperlabs.io | jq -r .result.state_root_hash) \
  --purse-uref $(casper-client account-address --public-key ~/casper/secret_key.pem)
```

**Endpoints alternatifs :**
- `http://65.21.235.219:7777`
- `http://95.216.24.237:7777`
- `https://rpc.testnet.casperlabs.io`

---

## 📊 Résumé des tests

✅ **10 tests unitaires passent** :
```bash
cd contract
cargo test
```

Résultat : `10 passed; 0 failed` ✅
