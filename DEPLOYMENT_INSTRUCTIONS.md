# 🚀 Instructions de Déploiement Simplifiées

## Option 1 : Interface testnet.cspr.live (RECOMMANDÉ)

### Étape par étape avec captures :

1. **Va sur** https://testnet.cspr.live/deploy

2. **Connecte ton wallet :**
   - En haut à droite, clique sur "Connect"
   - Choisis "Sign with your keys"
   - Colle ta clé privée : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`

3. **Remplis le formulaire de déploiement :**

   **Type de déploiement :**
   - Sélectionne **"Wasm Deploy"** (PAS "Transfer")

   **Payment :**
   - Amount : `200000000000` (200 CSPR)

   **Session :**
   - Clique sur **"Upload WASM file"** ou **"Choose File"**
   - Navigue vers : `contract/target/wasm32-unknown-unknown/release/casperclicker_contract.wasm`
   - Sélectionne le fichier (224 KB)

   **Session Arguments :**
   - Laisse VIDE (aucun argument)

4. **Clique sur "Deploy"** ou **"Sign & Deploy"**

5. **Note le Deploy Hash** qui s'affiche (format : `abc123...`)

6. **Attends 2-3 minutes** puis va sur :
   - https://testnet.cspr.live/deploy/[TON_DEPLOY_HASH]

7. **Récupère le Contract Hash :**
   - Cherche dans "Execution Results" → "Transforms"
   - Trouve le **contract-package-hash** (format : `hash-xxxxx...`)
   - ET le **contract-hash** (format : `hash-xxxxx...`)

---

## Option 2 : Casper Signer Extension (si tu l'as installée)

1. **Installe l'extension** (si pas déjà fait) :
   - Chrome : https://chrome.google.com/webstore (cherche "Casper Signer")

2. **Importe ta clé :**
   - Ouvre l'extension
   - "Import Account"
   - Colle ta clé : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`

3. **Va sur testnet.cspr.live/deploy** et connecte l'extension

4. **Suis les mêmes étapes que l'Option 1**

---

## Option 3 : Interface HTML Locale

Si l'interface web ne fonctionne pas :

1. **Ouvre dans ton navigateur** : `deploy-contract.html`

2. **Clique sur "Télécharger casperclicker_contract.wasm"**

3. **Sélectionne le fichier téléchargé** (étape 2)

4. **L'interface te redirigera** vers testnet.cspr.live avec instructions

---

## ⚠️ Problèmes courants

### "Je ne vois pas où uploader le WASM"
- Assure-toi d'avoir sélectionné **"Wasm Deploy"** (pas "Transfer")
- Rafraîchis la page si l'interface ne charge pas complètement
- Essaie un autre navigateur (Chrome/Firefox recommandés)

### "Invalid key format"
- Ta clé doit être au format PEM (commence par `-----BEGIN PRIVATE KEY-----`)
- Ou au format base64 : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`

### "Insufficient balance"
- Vérifie ton solde sur : https://testnet.cspr.live/account/01854e96435611f12bdf9fe5136b338122d1b53e83dd04261a52966edc1099166f
- Tu devrais avoir 999 CSPR

---

## 📝 Checklist

- [ ] Wallet connecté sur testnet.cspr.live
- [ ] Type : "Wasm Deploy" sélectionné
- [ ] Payment : 200000000000 motes
- [ ] WASM uploadé (224 KB)
- [ ] Session Args : vide
- [ ] Deploy lancé
- [ ] Deploy hash récupéré
- [ ] Attente 2-3 min
- [ ] Contract hash récupéré
- [ ] `assets/blockchain.js` mis à jour

---

## 🆘 Besoin d'aide ?

Si aucune de ces méthodes ne fonctionne, partage une capture d'écran de l'interface que tu vois sur testnet.cspr.live/deploy et je t'aiderai à naviguer l'interface exacte.

**Ton compte testnet :**
- Adresse : `01854e96435611f12bdf9fe5136b338122d1b53e83dd04261a52966edc1099166f`
- Balance : 999 CSPR
- Clé privée (base64) : `MC4CAQAwBQYDK2VwBCIEIBTbY7x1St2cwGMzk4OLk3uX+qAhNXCZmglTtEyxdXxh`
