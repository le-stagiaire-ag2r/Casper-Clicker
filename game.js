/**
 * ============================================
 * CASPERCLICKER - IDLE STAKING GAME
 * Built for Casper Hackathon 2026
 * ============================================
 *
 * An addictive idle clicker game where players stake CSPR
 * and earn stCSPR tokens through clicking and automated validators.
 *
 * Features:
 * - Click to earn stCSPR
 * - Auto-generation through validators
 * - Upgrade system with multipliers
 * - Achievement tracking
 * - Wallet integration with Casper Network
 * - On-chain leaderboard
 * - Persistent save system
 */

// ============================================
// GAME STATE
// ============================================

const GameState = {
    // Player info
    playerName: '',

    // Core stats
    balance: 0,
    totalEarned: 0,
    totalClicks: 0,
    clickPower: 1,
    perSecond: 0,

    // Click tracking for achievements
    clickTimestamps: [],

    // Time tracking
    startTime: Date.now(),
    lastTick: Date.now(),
    playTime: 0,
    totalSpent: 0,

    // Wallet connection
    walletConnected: false,
    walletAddress: null,

    // Upgrades owned
    upgrades: {},

    // Achievements unlocked
    achievements: {},

    // Milestones
    nextMilestone: 100,
    milestones: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 10000000]
};

// ============================================
// UPGRADES CONFIGURATION
// ============================================

const UPGRADES = [
    {
        id: 'validator1',
        name: 'Basic Validator',
        icon: '🖥️',
        description: 'Generates +0.1 stCSPR/sec',
        baseCost: 20,
        costMultiplier: 1.15,
        production: 0.1,
        type: 'generator'
    },
    {
        id: 'validator2',
        name: 'Enhanced Validator',
        icon: '💻',
        description: 'Generates +0.5 stCSPR/sec',
        baseCost: 150,
        costMultiplier: 1.15,
        production: 0.5,
        type: 'generator'
    },
    {
        id: 'validator3',
        name: 'Super Validator',
        icon: '🖥️',
        description: 'Generates +2 stCSPR/sec',
        baseCost: 1500,
        costMultiplier: 1.15,
        production: 2,
        type: 'generator'
    },
    {
        id: 'validator4',
        name: 'Mega Validator',
        icon: '🚀',
        description: 'Generates +8 stCSPR/sec',
        baseCost: 15000,
        costMultiplier: 1.15,
        production: 8,
        type: 'generator'
    },
    {
        id: 'validator5',
        name: 'Ultra Validator',
        icon: '⚡',
        description: 'Generates +30 stCSPR/sec',
        baseCost: 150000,
        costMultiplier: 1.15,
        production: 30,
        type: 'generator'
    },
    {
        id: 'multiplier1',
        name: 'Click Booster',
        icon: '👆',
        description: '+50% click power',
        baseCost: 100,
        costMultiplier: 2,
        multiplier: 1.5,
        type: 'click'
    },
    {
        id: 'multiplier2',
        name: 'Super Clicker',
        icon: '💪',
        description: 'x2 click power',
        baseCost: 1000,
        costMultiplier: 3,
        multiplier: 2,
        type: 'click'
    },
    {
        id: 'multiplier3',
        name: 'Mega Clicker',
        icon: '💥',
        description: 'x3 click power',
        baseCost: 10000,
        costMultiplier: 4,
        multiplier: 3,
        type: 'click'
    },
    {
        id: 'autostaker',
        name: 'Auto-Staker',
        icon: '🤖',
        description: '+50% all production',
        baseCost: 20000,
        costMultiplier: 2.5,
        productionMultiplier: 1.5,
        type: 'production'
    },
    {
        id: 'turbomode',
        name: 'Turbo Mode',
        icon: '🔥',
        description: 'x2 all production',
        baseCost: 100000,
        costMultiplier: 3,
        productionMultiplier: 2,
        type: 'production'
    },
    {
        id: 'validator6',
        name: 'Quantum Validator',
        icon: '🌌',
        description: 'Generates +100 stCSPR/sec',
        baseCost: 750000,
        costMultiplier: 1.15,
        production: 100,
        type: 'generator'
    },
    {
        id: 'validator7',
        name: 'Infinity Engine',
        icon: '♾️',
        description: 'Generates +500 stCSPR/sec',
        baseCost: 5000000,
        costMultiplier: 1.15,
        production: 500,
        type: 'generator'
    },
    {
        id: 'multiplier4',
        name: 'Golden Touch',
        icon: '✨',
        description: 'x5 click power',
        baseCost: 50000,
        costMultiplier: 5,
        multiplier: 5,
        type: 'click'
    },
    {
        id: 'multiplier5',
        name: 'God Mode',
        icon: '👑',
        description: 'x10 click power',
        baseCost: 500000,
        costMultiplier: 6,
        multiplier: 10,
        type: 'click'
    },
    {
        id: 'hyperproduction',
        name: 'Hyper Production',
        icon: '⚛️',
        description: 'x2.5 all production',
        baseCost: 1000000,
        costMultiplier: 4,
        productionMultiplier: 2.5,
        type: 'production'
    }
];

// ============================================
// ACHIEVEMENTS CONFIGURATION
// ============================================

const ACHIEVEMENTS = [
    {
        id: 'first_click',
        name: 'First Stake',
        icon: '🎉',
        description: 'Make your first click',
        requirement: () => GameState.totalClicks >= 1
    },
    {
        id: 'clicker',
        name: 'Active Staker',
        icon: '👆',
        description: 'Click 100 times',
        requirement: () => GameState.totalClicks >= 100
    },
    {
        id: 'veteran_clicker',
        name: 'Veteran Staker',
        icon: '💪',
        description: 'Click 1,000 times',
        requirement: () => GameState.totalClicks >= 1000
    },
    {
        id: 'first_hundred',
        name: 'Hundred Club',
        icon: '💯',
        description: 'Earn 100 stCSPR',
        requirement: () => GameState.totalEarned >= 100
    },
    {
        id: 'first_thousand',
        name: 'Thousand Club',
        icon: '🎖️',
        description: 'Earn 1,000 stCSPR',
        requirement: () => GameState.totalEarned >= 1000
    },
    {
        id: 'millionaire',
        name: 'stCSPR Millionaire',
        icon: '💰',
        description: 'Earn 1,000,000 stCSPR',
        requirement: () => GameState.totalEarned >= 1000000
    },
    {
        id: 'first_validator',
        name: 'Validator Owner',
        icon: '🖥️',
        description: 'Buy your first validator',
        requirement: () => Object.values(GameState.upgrades).some(count => count > 0)
    },
    {
        id: 'validator_farm',
        name: 'Validator Farm',
        icon: '🏭',
        description: 'Own 10 validators',
        requirement: () => {
            const totalValidators = Object.entries(GameState.upgrades)
                .filter(([id]) => UPGRADES.find(u => u.id === id)?.type === 'generator')
                .reduce((sum, [, count]) => sum + count, 0);
            return totalValidators >= 10;
        }
    },
    {
        id: 'passive_income',
        name: 'Passive Income',
        icon: '💸',
        description: 'Earn 100 stCSPR/sec',
        requirement: () => GameState.perSecond >= 100
    },
    {
        id: 'automation_king',
        name: 'Automation King',
        icon: '👑',
        description: 'Earn 1,000 stCSPR/sec',
        requirement: () => GameState.perSecond >= 1000
    },
    {
        id: 'dedication',
        name: 'Dedicated Staker',
        icon: '⏰',
        description: 'Play for 10 minutes',
        requirement: () => GameState.playTime >= 600
    },
    {
        id: 'wallet_connect',
        name: 'Connected',
        icon: '🔗',
        description: 'Connect your Casper wallet',
        requirement: () => GameState.walletConnected
    },
    {
        id: 'ultimate_clicker',
        name: 'Ultimate Clicker',
        icon: '🔥',
        description: 'Click 10,000 times',
        requirement: () => GameState.totalClicks >= 10000
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        icon: '⚡',
        description: 'Click 10 times in 1 second',
        requirement: () => {
            const now = Date.now();
            const recentClicks = GameState.clickTimestamps.filter(t => now - t < 1000);
            return recentClicks.length >= 10;
        }
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        icon: '🦉',
        description: 'Play for 1 hour',
        requirement: () => GameState.playTime >= 3600
    },
    {
        id: 'mega_farm',
        name: 'Mega Farm',
        icon: '🌾',
        description: 'Own 100 validators total',
        requirement: () => {
            const totalValidators = Object.entries(GameState.upgrades)
                .filter(([id]) => UPGRADES.find(u => u.id === id)?.type === 'generator')
                .reduce((sum, [, count]) => sum + count, 0);
            return totalValidators >= 100;
        }
    },
    {
        id: 'production_beast',
        name: 'Production Beast',
        icon: '🏭',
        description: 'Reach 10,000 stCSPR/sec',
        requirement: () => GameState.perSecond >= 10000
    },
    {
        id: 'big_spender',
        name: 'Big Spender',
        icon: '💸',
        description: 'Spend 1,000,000 stCSPR total',
        requirement: () => GameState.totalSpent >= 1000000
    },
    {
        id: 'billionaire',
        name: 'Billionaire',
        icon: '💎',
        description: 'Earn 1,000,000,000 stCSPR',
        requirement: () => GameState.totalEarned >= 1000000000
    },
    {
        id: 'completionist',
        name: 'Completionist',
        icon: '🏆',
        description: 'Unlock all other achievements',
        requirement: () => {
            const totalAchievements = ACHIEVEMENTS.filter(a => a.id !== 'completionist').length;
            const unlockedCount = Object.keys(GameState.achievements).filter(id => id !== 'completionist').length;
            return unlockedCount >= totalAchievements;
        }
    }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format large numbers with abbreviations
 */
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B';
    return (num / 1000000000000).toFixed(2) + 'T';
}

/**
 * Format time in seconds to readable format
 */
function formatTime(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

/**
 * Calculate cost of an upgrade
 */
function getUpgradeCost(upgrade) {
    const count = GameState.upgrades[upgrade.id] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
}

/**
 * Calculate total click power
 */
function calculateClickPower() {
    let power = 1;

    UPGRADES.forEach(upgrade => {
        if (upgrade.type === 'click') {
            const count = GameState.upgrades[upgrade.id] || 0;
            power *= Math.pow(upgrade.multiplier, count);
        }
    });

    return power;
}

/**
 * Calculate total production per second
 */
function calculatePerSecond() {
    let total = 0;

    // Add all generators
    UPGRADES.forEach(upgrade => {
        if (upgrade.type === 'generator') {
            const count = GameState.upgrades[upgrade.id] || 0;
            total += upgrade.production * count;
        }
    });

    // Apply production multipliers
    let multiplier = 1;
    UPGRADES.forEach(upgrade => {
        if (upgrade.type === 'production') {
            const count = GameState.upgrades[upgrade.id] || 0;
            if (count > 0) {
                multiplier *= Math.pow(upgrade.productionMultiplier, count);
            }
        }
    });

    return total * multiplier;
}

// ============================================
// GAME LOGIC
// ============================================

/**
 * Handle main button click
 */
function handleClick(event) {
    const earnedAmount = GameState.clickPower;

    // Update state
    GameState.balance += earnedAmount;
    GameState.totalEarned += earnedAmount;
    GameState.totalClicks++;

    // Track click timestamp for "Speed Demon" achievement
    const now = Date.now();
    GameState.clickTimestamps.push(now);
    // Keep only last 15 timestamps (for 1 second window)
    if (GameState.clickTimestamps.length > 15) {
        GameState.clickTimestamps = GameState.clickTimestamps.slice(-15);
    }

    // Create click effect
    createClickEffect(event, earnedAmount);

    // Update UI
    updateUI();

    // Check achievements
    checkAchievements();

    // Save game
    saveGame();
}

/**
 * Create visual click effect
 */
function createClickEffect(event, amount) {
    const effectsContainer = document.getElementById('clickEffects');
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${formatNumber(amount)}`;

    // Position at click location
    const rect = event.target.closest('.click-container').getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    effectsContainer.appendChild(effect);

    // Remove after animation
    setTimeout(() => effect.remove(), 1000);
}

/**
 * Game loop - runs every 100ms
 */
function gameTick() {
    const now = Date.now();
    const deltaTime = (now - GameState.lastTick) / 1000; // seconds

    // Add passive income
    if (GameState.perSecond > 0) {
        const earned = GameState.perSecond * deltaTime;
        GameState.balance += earned;
        GameState.totalEarned += earned;
    }

    // Update play time
    GameState.playTime = (now - GameState.startTime) / 1000;

    GameState.lastTick = now;

    // Update UI
    updateUI();

    // Check achievements periodically
    if (Math.random() < 0.1) { // 10% chance each tick
        checkAchievements();
    }

    // Auto-save every 30 seconds
    if (Math.floor(GameState.playTime) % 30 === 0 && Math.floor(GameState.playTime) > 0) {
        saveGame();
    }
}

/**
 * Purchase an upgrade
 */
function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = getUpgradeCost(upgrade);

    if (GameState.balance >= cost) {
        GameState.balance -= cost;
        GameState.totalSpent += cost; // Track total spending for achievements
        GameState.upgrades[upgradeId] = (GameState.upgrades[upgradeId] || 0) + 1;

        // Recalculate stats
        GameState.clickPower = calculateClickPower();
        GameState.perSecond = calculatePerSecond();

        // Update UI
        updateUI();
        renderUpgrades();

        // Check achievements
        checkAchievements();

        // Save game
        saveGame();
    }
}

/**
 * Check and unlock achievements
 */
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        // Skip if already unlocked
        if (GameState.achievements[achievement.id]) return;

        // Check requirement
        if (achievement.requirement()) {
            unlockAchievement(achievement);
        }
    });
}

/**
 * Unlock an achievement
 */
function unlockAchievement(achievement) {
    GameState.achievements[achievement.id] = true;

    // Show achievement popup
    showAchievementPopup(achievement);

    // Update achievements UI
    renderAchievements();

    // Save game
    saveGame();
}

/**
 * Show achievement unlocked notification (non-blocking toast)
 */
function showAchievementPopup(achievement) {
    // Create notification toast element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-text">
                <div class="achievement-notification-title">🎉 Achievement Unlocked!</div>
                <div class="achievement-notification-name">${achievement.name}</div>
            </div>
        </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Wait for fade out animation
    }, 3000);
}

// ============================================
// UI UPDATES
// ============================================

/**
 * Update all UI elements
 */
function updateUI() {
    // Update balance display
    document.getElementById('balance').textContent = formatNumber(GameState.balance);
    document.getElementById('perSecond').textContent = formatNumber(GameState.perSecond);
    document.getElementById('perClick').textContent = formatNumber(GameState.clickPower);

    // Update stats
    document.getElementById('totalClicks').textContent = formatNumber(GameState.totalClicks);
    document.getElementById('totalEarned').textContent = formatNumber(GameState.totalEarned);
    document.getElementById('playTime').textContent = formatTime(GameState.playTime);

    // Update progress to next milestone
    updateProgress();

    // Update upgrade affordability in real-time
    updateUpgradeAffordability();
}

/**
 * Update upgrade affordability CSS classes in real-time
 */
function updateUpgradeAffordability() {
    UPGRADES.forEach(upgrade => {
        const element = document.querySelector(`.upgrade-item[data-upgrade-id="${upgrade.id}"]`);

        if (element) {
            const cost = getUpgradeCost(upgrade);
            const canAfford = GameState.balance >= cost;

            if (canAfford) {
                element.classList.remove('disabled');
            } else {
                element.classList.add('disabled');
            }
        }
    });
}

/**
 * Update progress bar
 */
function updateProgress() {
    const current = GameState.totalEarned;
    const next = GameState.nextMilestone;

    const progress = Math.min((current / next) * 100, 100);

    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${formatNumber(current)} / ${formatNumber(next)} stCSPR`;

    // Update milestone if reached
    if (current >= next) {
        const nextIndex = GameState.milestones.indexOf(next) + 1;
        if (nextIndex < GameState.milestones.length) {
            GameState.nextMilestone = GameState.milestones[nextIndex];
        } else {
            GameState.nextMilestone = next * 10; // Continue exponentially
            GameState.milestones.push(GameState.nextMilestone);
        }
    }
}

/**
 * Render upgrades list
 */
function renderUpgrades() {
    const container = document.getElementById('upgradesContainer');
    container.innerHTML = '';

    UPGRADES.forEach(upgrade => {
        const count = GameState.upgrades[upgrade.id] || 0;
        const cost = getUpgradeCost(upgrade);
        const canAfford = GameState.balance >= cost;

        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item ${canAfford ? '' : 'disabled'}`;
        upgradeElement.setAttribute('data-upgrade-id', upgrade.id);
        upgradeElement.onclick = () => buyUpgrade(upgrade.id);

        upgradeElement.innerHTML = `
            <div class="upgrade-header">
                <div>
                    <span class="upgrade-icon">${upgrade.icon}</span>
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-count">${count > 0 ? `x${count}` : ''}</span>
                </div>
            </div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-cost">Cost: ${formatNumber(cost)} stCSPR</div>
        `;

        container.appendChild(upgradeElement);
    });
}

/**
 * Render achievements list
 */
function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    container.innerHTML = '';

    ACHIEVEMENTS.forEach(achievement => {
        const unlocked = GameState.achievements[achievement.id] || false;

        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${unlocked ? 'unlocked' : 'achievement-locked'}`;

        achievementElement.innerHTML = `
            <div class="achievement-header">
                <span class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</span>
                <span class="achievement-name">${unlocked ? achievement.name : '???'}</span>
            </div>
            <div class="achievement-description">${unlocked ? achievement.description : 'Hidden achievement'}</div>
        `;

        container.appendChild(achievementElement);
    });
}

// ============================================
// WALLET INTEGRATION
// ============================================

/**
 * Connect to Casper wallet
 */
async function connectWallet() {
    try {
        // Use blockchain.js integration
        const result = await connectCasperWallet();

        if (result.success) {
            GameState.walletConnected = true;
            GameState.walletAddress = result.address;

            // Update UI
            document.getElementById('connectWallet').classList.add('hidden');
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('walletAddress').textContent =
                result.address.slice(0, 10) + '...' + result.address.slice(-8);

            // Show submit score button
            document.getElementById('submitScoreBtn').classList.remove('hidden');

            // Check achievement
            checkAchievements();

            // Load leaderboard from blockchain
            loadLeaderboard();

            // Save game
            saveGame();

            console.log('✅ Wallet connected successfully!');
        } else {
            // Fallback if wallet not available
            alert('CSPR.click wallet not detected.\n\nPlease install from https://cspr.click\n\nYou can still play locally, but scores won\'t be saved to blockchain.');
            GameState.walletConnected = false;
            GameState.walletAddress = null;

            // Keep connect wallet button visible
            loadLeaderboard();
            saveGame();
        }
    } catch (error) {
        console.error('❌ Wallet connection error:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
}

/**
 * Load leaderboard from blockchain
 */
async function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '<p class="loading">Loading leaderboard...</p>';

    try {
        // Fetch global leaderboard from blockchain
        const data = await fetchGlobalLeaderboard();

        if (data && data.length > 0) {
            leaderboard.innerHTML = data.map(entry => `
                <div class="leaderboard-entry">
                    <span class="leaderboard-rank">#${entry.rank}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-score">${formatNumber(entry.score)}</span>
                </div>
            `).join('');
        } else {
            leaderboard.innerHTML = '<p class="loading">No players yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('❌ Failed to load leaderboard:', error);
        leaderboard.innerHTML = '<p class="loading">Failed to load leaderboard</p>';
    }
}

/**
 * Submit current score to blockchain
 */
async function submitScoreManually() {
    const btn = document.getElementById('submitScoreBtn');

    // Prevent multiple clicks
    if (btn.classList.contains('syncing')) {
        return;
    }

    btn.classList.add('syncing');
    btn.textContent = '⏳ Submitting...';

    try {
        const playerData = {
            playerName: GameState.playerName || 'Anonymous',
            totalEarned: GameState.totalEarned,
            totalClicks: GameState.totalClicks,
            playTime: GameState.playTime
        };

        const result = await submitScoreToBlockchain(playerData);

        if (result.success) {
            alert('✅ Score submitted to blockchain!\n\nDeploy Hash: ' + result.deployHash);
            // Refresh leaderboard after successful submission
            setTimeout(() => loadLeaderboard(), 3000);
        } else {
            alert('❌ Failed to submit score:\n' + result.message);
        }
    } catch (error) {
        console.error('❌ Submit error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        btn.classList.remove('syncing');
        btn.textContent = '📤 Submit to Blockchain';
    }
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

/**
 * Save game to localStorage
 */
function saveGame() {
    const saveData = {
        playerName: GameState.playerName,
        balance: GameState.balance,
        totalEarned: GameState.totalEarned,
        totalClicks: GameState.totalClicks,
        totalSpent: GameState.totalSpent,
        clickPower: GameState.clickPower,
        perSecond: GameState.perSecond,
        clickTimestamps: GameState.clickTimestamps,
        startTime: GameState.startTime,
        playTime: GameState.playTime,
        walletConnected: GameState.walletConnected,
        walletAddress: GameState.walletAddress,
        upgrades: GameState.upgrades,
        achievements: GameState.achievements,
        nextMilestone: GameState.nextMilestone
    };

    localStorage.setItem('casperclicker_save', JSON.stringify(saveData));
}

/**
 * Load game from localStorage
 */
function loadGame() {
    const saveData = localStorage.getItem('casperclicker_save');

    if (saveData) {
        try {
            const data = JSON.parse(saveData);

            GameState.playerName = data.playerName || '';
            GameState.balance = data.balance || 0;
            GameState.totalEarned = data.totalEarned || 0;
            GameState.totalClicks = data.totalClicks || 0;
            GameState.totalSpent = data.totalSpent || 0;
            GameState.clickPower = data.clickPower || 1;
            GameState.perSecond = data.perSecond || 0;
            GameState.clickTimestamps = data.clickTimestamps || [];
            GameState.startTime = data.startTime || Date.now();
            GameState.playTime = data.playTime || 0;
            GameState.walletConnected = data.walletConnected || false;
            GameState.walletAddress = data.walletAddress || null;
            GameState.upgrades = data.upgrades || {};
            GameState.achievements = data.achievements || {};
            GameState.nextMilestone = data.nextMilestone || 100;

            // Recalculate derived stats
            GameState.clickPower = calculateClickPower();
            GameState.perSecond = calculatePerSecond();

            console.log('Game loaded successfully');
        } catch (error) {
            console.error('Failed to load game:', error);
        }
    }
}

/**
 * Reset game (for testing)
 */
function resetGame() {
    const confirmed = confirm('⚠️ WARNING ⚠️\n\nAre you sure you want to RESET your entire progress?\n\n❌ You will lose:\n- All your stCSPR balance\n- All upgrades purchased\n- All achievements unlocked\n- Your total stats\n\n⚠️ THIS CANNOT BE UNDONE!\n\nClick OK to reset, or Cancel to keep playing.');

    if (confirmed) {
        // Clear saved data
        localStorage.removeItem('casperclicker_save');

        // Show confirmation
        alert('✅ Game reset successfully!\n\nReloading...');

        // Reload page
        location.reload();
    }
}

// Make it globally accessible for console debugging
window.resetGame = resetGame;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the game
 */
function initGame() {
    console.log('🎮 CasperClicker - Initializing...');

    // Load saved game
    loadGame();

    // Ask for player name if not set
    if (!GameState.playerName || GameState.playerName === '') {
        askPlayerName();
    }

    // Setup event listeners
    document.getElementById('mainButton').addEventListener('click', handleClick);
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    const submitBtn = document.getElementById('submitScoreBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitScoreManually);
    }

    const refreshBtn = document.getElementById('refreshLeaderboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadLeaderboard);
    }

    const resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
        console.log('✅ Reset button event listener attached');
    } else {
        console.error('❌ Reset button not found in DOM!');
    }

    // Restore wallet UI if connected
    if (GameState.walletConnected && GameState.walletAddress) {
        document.getElementById('connectWallet').classList.add('hidden');
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('walletAddress').textContent =
            GameState.walletAddress.slice(0, 10) + '...' + GameState.walletAddress.slice(-8);
        document.getElementById('submitScoreBtn').classList.remove('hidden');
        loadLeaderboard();
    }

    // Display player name
    updatePlayerNameDisplay();

    // Initial UI render
    renderUpgrades();
    renderAchievements();
    updateUI();

    // Load leaderboard on startup
    loadLeaderboard();

    // Start game loop (tick every 100ms)
    setInterval(gameTick, 100);

    // Save game every 30 seconds
    setInterval(saveGame, 30000);

    // Auto-sync score to blockchain every 5 minutes (if connected)
    setInterval(() => {
        if (typeof autoSyncScore === 'function') {
            autoSyncScore(GameState);
        }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('🎮 CasperClicker - Ready!');
    console.log('💡 Tip: Type resetGame() in console to reset your progress');
    console.log('🔗 Tip: Connect your CSPR.click wallet to submit scores to blockchain!');
}

/**
 * Ask player for their name
 */
function askPlayerName() {
    let name = prompt('🎮 Welcome to CasperClicker!\n\nWhat\'s your player name?', '');

    if (!name || name.trim() === '') {
        name = 'Anonymous Staker';
    }

    GameState.playerName = name.trim().substring(0, 20); // Max 20 characters
    saveGame();
}

/**
 * Update player name display in UI
 */
function updatePlayerNameDisplay() {
    // Add player name to header if not exists
    const logo = document.querySelector('.logo');
    if (logo && !document.getElementById('playerName')) {
        const playerNameElement = document.createElement('p');
        playerNameElement.id = 'playerName';
        playerNameElement.className = 'player-name';
        playerNameElement.textContent = `Player: ${GameState.playerName}`;
        playerNameElement.style.color = '#00ff88';
        playerNameElement.style.fontSize = '0.9em';
        playerNameElement.style.marginTop = '5px';
        playerNameElement.style.cursor = 'pointer';
        playerNameElement.title = 'Click to change your name';
        playerNameElement.onclick = () => {
            askPlayerName();
            updatePlayerNameDisplay();
        };
        logo.appendChild(playerNameElement);
    } else if (document.getElementById('playerName')) {
        document.getElementById('playerName').textContent = `Player: ${GameState.playerName}`;
    }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Save game before page unload
window.addEventListener('beforeunload', saveGame);
