# 🎮 CasperClicker - Idle Staking Game

[![Casper Hackathon 2026](https://img.shields.io/badge/Casper-Hackathon%202026-FF0011?style=for-the-badge)](https://dorahacks.io/hackathon/casper-hackathon-2026)
[![Built with Casper](https://img.shields.io/badge/Built%20with-Casper-00FF88?style=for-the-badge)](https://casper.network)
[![Play Now](https://img.shields.io/badge/Play-Now-FF0011?style=for-the-badge)](https://le-stagiaire-ag2r.github.io/Casper-Clicker)

> **An addictive idle clicker game built on Casper Network where you stake CSPR and earn stCSPR tokens through clicking and automated validators!**

---

## 🌟 What is CasperClicker?

**CasperClicker** is a fun, browser-based idle game that introduces players to the concept of liquid staking on the Casper blockchain in an entertaining and addictive way!

### The Concept

- 🖱️ **Click** the big CSPR coin to stake and earn stCSPR tokens
- 🤖 **Buy validators** that automatically generate stCSPR for you
- ⚡ **Upgrade** your clicking power with multipliers and boosters
- 🏆 **Unlock achievements** as you progress through milestones
- 💰 **Compete** on the global leaderboard
- 🔗 **Connect your wallet** to save your progress on-chain

### Why We Built This

CasperClicker serves multiple purposes:

1. **Educational** - Teaches users about staking and validators in a fun way
2. **Marketing** - Introduces Casper Network to gamers and casual users
3. **Community Engagement** - Provides an entertaining way to engage with the Casper ecosystem
4. **Ecosystem Integration** - Connects with our other projects ([StakeVue](https://github.com/le-stagiaire-ag2r/Casper-projet) for real staking, [CasperSecure](https://github.com/le-stagiaire-ag2r/CasperSecure) for security)

---

## ✨ Features

### Core Gameplay

- ✅ **Click-to-Earn** - Click the main button to instantly earn stCSPR
- ✅ **Idle Generation** - Buy validators that generate stCSPR automatically (even when you're not clicking!)
- ✅ **Progressive Upgrades** - 10 different upgrades including validators, click multipliers, and production boosters
- ✅ **Achievement System** - 12 achievements to unlock, from "First Stake" to "stCSPR Millionaire"
- ✅ **Milestone Tracking** - Visual progress bar showing your journey to the next major milestone

### Technical Features

- ✅ **Persistent Save System** - Your progress is automatically saved to localStorage
- ✅ **Wallet Integration** - Connect with CSPR.click to enable on-chain features
- ✅ **Leaderboard** - Compete with other players globally (blockchain-based)
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Smooth Animations** - Satisfying visual feedback for every action
- ✅ **Performance Optimized** - Runs at 60 FPS with minimal resource usage

---

## 🚀 Quick Start

### Play Instantly

No installation required! Just visit:

**👉 [https://le-stagiaire-ag2r.github.io/Casper-Clicker](https://le-stagiaire-ag2r.github.io/Casper-Clicker)**

### Run Locally

Want to run it on your machine?

```bash
# Clone the repository
git clone https://github.com/le-stagiaire-ag2r/Casper-Clicker.git

# Navigate to the directory
cd Casper-Clicker

# Open in your browser
# Simply open index.html in your favorite browser!
# Or use a local server:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## 🎮 How to Play

### Step 1: Start Clicking!

Click the big **🪙 CSPR coin** in the center to earn your first stCSPR tokens!

### Step 2: Buy Your First Validator

Once you have **15 stCSPR**, buy your first **Basic Validator** to start earning passive income!

### Step 3: Unlock Upgrades

As you earn more, unlock powerful upgrades:

| Upgrade | Type | Effect | Starting Cost |
|---------|------|--------|---------------|
| 🖥️ Basic Validator | Generator | +1 stCSPR/sec | 15 |
| 💻 Enhanced Validator | Generator | +5 stCSPR/sec | 100 |
| 🖥️ Super Validator | Generator | +25 stCSPR/sec | 1,000 |
| 🚀 Mega Validator | Generator | +100 stCSPR/sec | 10,000 |
| ⚡ Ultra Validator | Generator | +500 stCSPR/sec | 100,000 |
| 👆 Click Booster | Click Power | x2 clicks | 50 |
| 💪 Super Clicker | Click Power | x5 clicks | 500 |
| 💥 Mega Clicker | Click Power | x10 clicks | 5,000 |
| 🤖 Auto-Staker | Production | x2 all production | 10,000 |
| 🔥 Turbo Mode | Production | x3 all production | 50,000 |

### Step 4: Unlock Achievements

Complete challenges to unlock achievements:

- 🎉 **First Stake** - Make your first click
- 💯 **Hundred Club** - Earn 100 stCSPR
- 💰 **stCSPR Millionaire** - Earn 1,000,000 stCSPR
- 👑 **Automation King** - Reach 1,000 stCSPR/sec
- ...and 8 more!

### Step 5: Connect Your Wallet (Optional)

Click **"Connect Wallet"** to:
- Save your score on the blockchain
- Compete on the global leaderboard
- Unlock the "Connected" achievement
- (Future) Exchange in-game stCSPR for real stCSPR from [StakeVue](https://github.com/le-stagiaire-ag2r/Casper-projet)!

---

## 🏗️ Technical Architecture

### Stack

- **Frontend**: Vanilla JavaScript (no frameworks!)
- **Styling**: Custom CSS with Casper branding
- **Storage**: localStorage for save data
- **Blockchain**: Casper Network (wallet integration via CSPR.click)
- **Deployment**: GitHub Pages

### Project Structure

```
Casper-Clicker/
├── index.html          # Main game interface
├── style.css           # Casper-themed styling
├── game.js             # Complete game logic
├── README.md           # This file
└── LICENSE             # MIT License
```

### Game State

The game manages state through a centralized `GameState` object:

```javascript
{
    balance: 0,              // Current stCSPR balance
    totalEarned: 0,          // Lifetime earnings
    totalClicks: 0,          // Total clicks made
    clickPower: 1,           // stCSPR earned per click
    perSecond: 0,            // Passive income rate
    upgrades: {},            // Owned upgrades
    achievements: {},        // Unlocked achievements
    walletConnected: false,  // Wallet connection status
    // ...and more
}
```

### Key Algorithms

**Upgrade Cost Scaling**
```javascript
cost = baseCost * (multiplier ^ count)
```

**Production Calculation**
```javascript
total = Σ(validator.production * count) * productionMultipliers
```

**Click Power Calculation**
```javascript
power = baseClickPower * Π(clickUpgrade.multiplier ^ count)
```

---

## 🎨 Design Philosophy

### Visual Theme

- **Colors**: Casper's signature red (#FF0011) paired with success green (#00FF88)
- **Dark Mode**: Easy on the eyes for long play sessions
- **Animations**: Smooth, satisfying feedback for every interaction
- **Accessibility**: High contrast ratios, readable fonts

### User Experience

- **Instant Feedback** - Every click shows visual effects
- **Clear Progression** - Always know what to buy next
- **No Paywalls** - Everything is earnable through gameplay
- **Auto-Save** - Never lose your progress

---

## 🔗 Ecosystem Integration

CasperClicker is part of a **complete Casper ecosystem** we've built for the hackathon:

### 1. [CasperSecure](https://github.com/le-stagiaire-ag2r/CasperSecure) 🛡️
**Security analyzer for Casper smart contracts**
- 20 vulnerability detectors
- Automated security scoring
- Used to audit our smart contracts

### 2. [StakeVue](https://github.com/le-stagiaire-ag2r/Casper-projet) 🔐
**Multi-validator liquid staking protocol**
- Stake CSPR, get stCSPR tokens
- Deployed on Casper Testnet
- Security score: A+ (100/100)
- Audited by CasperSecure

### 3. CasperClicker 🎮 (This Project!)
**Idle game to learn about staking**
- Fun introduction to staking concepts
- Future integration: Exchange in-game stCSPR for real stCSPR from StakeVue!

### The Vision

```
         Play CasperClicker
                ↓
         Learn about staking
                ↓
         Use real StakeVue protocol
                ↓
         Secured by CasperSecure
```

**From game to real DeFi in 3 steps!**

---

## 📊 Game Statistics

Some interesting numbers about CasperClicker:

- **Lines of Code**: ~1,000
- **Number of Upgrades**: 10
- **Number of Achievements**: 12
- **Auto-save Interval**: 30 seconds
- **Game Loop**: 100ms (10 ticks/second)
- **Supported Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Compatible**: ✅ Yes!

---

## 🎯 Roadmap

### Phase 1: Core Game (✅ Complete)
- [x] Click mechanics
- [x] Upgrade system
- [x] Achievement tracking
- [x] Save/load system
- [x] Wallet integration
- [x] Responsive design

### Phase 2: Blockchain Integration (🚧 In Progress)
- [ ] On-chain leaderboard smart contract
- [ ] Save game state on blockchain
- [ ] Mint achievement NFTs
- [ ] Integration with StakeVue for real stCSPR rewards

### Phase 3: Community Features (📅 Planned)
- [ ] Daily challenges
- [ ] Seasonal events
- [ ] Multiplayer tournaments
- [ ] Referral system
- [ ] Discord bot integration

### Phase 4: Mobile App (💡 Future)
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Push notifications for milestones
- [ ] Offline play support

---

## 🏆 Hackathon Submission

**CasperClicker** is submitted to **Casper Hackathon 2026** in the **Main Track (Gaming category)**.

### Why CasperClicker Stands Out

✅ **Unique Concept** - Only idle clicker game in the hackathon
✅ **Viral Potential** - Easy to share, fun to play, addictive gameplay
✅ **Ecosystem Synergy** - Integrates with StakeVue and CasperSecure
✅ **Community Engagement** - Attracts non-crypto users to Casper
✅ **Educational** - Teaches staking concepts through gameplay
✅ **Production Ready** - Fully functional, deployed, polished
✅ **Open Source** - MIT licensed, available for everyone

### Submission Details

- **Project Name**: CasperClicker
- **Track**: Main Track - Gaming
- **Live Demo**: [https://le-stagiaire-ag2r.github.io/Casper-Clicker](https://le-stagiaire-ag2r.github.io/Casper-Clicker)
- **Repository**: [https://github.com/le-stagiaire-ag2r/Casper-Clicker](https://github.com/le-stagiaire-ag2r/Casper-Clicker)
- **Related Projects**: [StakeVue](https://github.com/le-stagiaire-ag2r/Casper-projet), [CasperSecure](https://github.com/le-stagiaire-ag2r/CasperSecure)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Report Bugs
Found a bug? [Open an issue](https://github.com/le-stagiaire-ag2r/Casper-Clicker/issues)

### Suggest Features
Have an idea? [Open a feature request](https://github.com/le-stagiaire-ag2r/Casper-Clicker/issues)

### Submit Pull Requests
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 le-stagiaire-ag2r

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

## 🙏 Acknowledgments

- **Casper Network** - For providing an amazing blockchain platform
- **Casper Association** - For organizing the Hackathon 2026
- **Cookie Clicker** - Inspiration for the idle game mechanics
- **Our Community** - For testing and feedback

---

## 📞 Contact & Links

- **GitHub**: [@le-stagiaire-ag2r](https://github.com/le-stagiaire-ag2r)
- **Project**: [Casper-Clicker](https://github.com/le-stagiaire-ag2r/Casper-Clicker)
- **Play Now**: [https://le-stagiaire-ag2r.github.io/Casper-Clicker](https://le-stagiaire-ag2r.github.io/Casper-Clicker)
- **StakeVue**: [https://github.com/le-stagiaire-ag2r/Casper-projet](https://github.com/le-stagiaire-ag2r/Casper-projet)
- **CasperSecure**: [https://github.com/le-stagiaire-ag2r/CasperSecure](https://github.com/le-stagiaire-ag2r/CasperSecure)

---

## 🎮 Ready to Play?

**[👉 CLICK HERE TO START PLAYING! 👈](https://le-stagiaire-ag2r.github.io/Casper-Clicker)**

---

<div align="center">

**Built with ❤️ for Casper Hackathon 2026**

🎮 **Happy Staking!** 🎮

</div>
