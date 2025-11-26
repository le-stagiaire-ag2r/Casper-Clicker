# 🚀 Déploiement via Casper Signer (Méthode Recommandée)

## Étape 1 : Installer Casper Signer

1. **Chrome/Brave/Edge** : https://chrome.google.com/webstore/detail/casper-signer/djhndpllfiibmcdbnmaaahkhchcoijce
2. **Firefox** : https://addons.mozilla.org/en-US/firefox/addon/casper-signer/

Clique sur "Add to Chrome" (ou Firefox)

## Étape 2 : Configurer Casper Signer

1. Ouvre l'extension (icône en haut à droite de ton navigateur)
2. Crée un nouveau compte ou **"Import existing account"**
3. Sélectionne **"Import from Secret Key"**
4. Colle ta clé privée :
   ```
   MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh
   ```
5. Donne un nom à ton compte : "CasperClicker"
6. Vérifie que tu es sur **Testnet** (pas Mainnet!)

## Étape 3 : Utiliser l'interface de déploiement de Casper Signer

L'extension Casper Signer a une interface de déploiement intégrée :

1. **Ouvre Casper Signer**
2. Clique sur **"Deploy"** ou **"Tools"** → **"Deploy Contract"**
3. Remplis le formulaire :

   **Network** : Testnet

   **Deploy Type** : Wasm

   **WASM File** :
   - Clique "Browse" ou "Choose File"
   - Navigue vers : `C:\Users\pauld\Casper-Clicker\contract\target\wasm32-unknown-unknown\release\casperclicker_contract.wasm`
   - Sélectionne le fichier (224 KB)

   **Payment Amount** : `200000000000` (200 CSPR en motes)

   **Session Arguments** : Laisse vide

   **Gas Price** : 1 (par défaut)

4. **Clique sur "Sign and Deploy"**

5. **Confirme la transaction** dans la popup

## Étape 4 : Récupérer le Deploy Hash

1. Casper Signer affichera le **Deploy Hash**
2. **Copie-le** (format : `abc123def456...`)
3. Va sur : `https://testnet.cspr.live/deploy/[TON_DEPLOY_HASH]`
4. Attends 2-3 minutes que le deploy soit traité

## Étape 5 : Récupérer le Contract Hash

1. Sur la page du deploy, cherche **"Execution Results"**
2. Dans la section **"Transforms"**, trouve :
   - **contract-package-hash** : `hash-xxxxx...`
   - **contract-hash** : `hash-xxxxx...`
3. **Note les deux hash**

## Étape 6 : Mettre à jour le Frontend

Édite `C:\Users\pauld\Casper-Clicker\assets\blockchain.js` :

```javascript
// Ligne 17-18
contractHash: 'hash-XXXXXXX', // ← Ton contract hash
contractPackageHash: 'hash-XXXXXXX', // ← Ton contract package hash
```

---

## 📱 Alternative : Déploiement via casper-client (Windows)

Si tu as fini d'installer Rust + Visual Studio Build Tools, tu peux aussi déployer via CMD :

```cmd
cd C:\Users\pauld\Casper-Clicker

cargo install casper-client

casper-client put-deploy ^
  --node-address http://65.21.235.219:7777 ^
  --chain-name casper-test ^
  --secret-key C:\Users\pauld\.casper\secret_key.pem ^
  --payment-amount 200000000000 ^
  --session-path contract\target\wasm32-unknown-unknown\release\casperclicker_contract.wasm
```

⚠️ Mais les nœuds RPC publics bloquent actuellement (403 Forbidden), donc Casper Signer reste la meilleure option.

---

## 🆘 Problèmes ?

### "Extension not found"
- Rafraîchis la page du Chrome Web Store
- Essaie sur un autre navigateur

### "Invalid secret key"
- Assure-toi de ne pas avoir copié d'espaces avant/après
- Utilise le format base64 : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`

### "Insufficient balance"
- Vérifie ton solde : https://testnet.cspr.live/account/01854e96435611f12bdf9fe5136b338122d1b53e83dd04261a52966edc1099166f
- Tu devrais avoir 999 CSPR

### "File too large"
- Le WASM fait 224 KB, c'est normal
- Si erreur, recompile : `cd contract && cargo build --release --target wasm32-unknown-unknown`

---

## ✅ Checklist Complète

- [ ] Casper Signer installé
- [ ] Compte importé avec ta clé privée
- [ ] Network = Testnet (PAS Mainnet!)
- [ ] WASM uploadé (224 KB)
- [ ] Payment = 200000000000 motes
- [ ] Deploy lancé
- [ ] Deploy hash récupéré
- [ ] Attente 2-3 min
- [ ] Contract hash récupéré depuis testnet.cspr.live
- [ ] `assets/blockchain.js` mis à jour avec les hash

---

## 🎯 Ton Compte

- **Adresse** : `01854e96435611f12bdf9fe5136b338122d1b53e83dd04261a52966edc1099166f`
- **Balance** : 999 CSPR
- **Clé (base64)** : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`
- **Coût déploiement** : 200 CSPR
- **Reste après** : 799 CSPR
