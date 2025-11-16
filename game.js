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
    // Core stats
    balance: 0,
    totalEarned: 0,
    totalClicks: 0,
    clickPower: 1,
    perSecond: 0,

    // Time tracking
    startTime: Date.now(),
    lastTick: Date.now(),
    playTime: 0,

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
        description: 'Generates +1 stCSPR/sec',
        baseCost: 15,
        costMultiplier: 1.15,
        production: 1,
        type: 'generator'
    },
    {
        id: 'validator2',
        name: 'Enhanced Validator',
        icon: '💻',
        description: 'Generates +5 stCSPR/sec',
        baseCost: 100,
        costMultiplier: 1.15,
        production: 5,
        type: 'generator'
    },
    {
        id: 'validator3',
        name: 'Super Validator',
        icon: '🖥️',
        description: 'Generates +25 stCSPR/sec',
        baseCost: 1000,
        costMultiplier: 1.15,
        production: 25,
        type: 'generator'
    },
    {
        id: 'validator4',
        name: 'Mega Validator',
        icon: '🚀',
        description: 'Generates +100 stCSPR/sec',
        baseCost: 10000,
        costMultiplier: 1.15,
        production: 100,
        type: 'generator'
    },
    {
        id: 'validator5',
        name: 'Ultra Validator',
        icon: '⚡',
        description: 'Generates +500 stCSPR/sec',
        baseCost: 100000,
        costMultiplier: 1.15,
        production: 500,
        type: 'generator'
    },
    {
        id: 'multiplier1',
        name: 'Click Booster',
        icon: '👆',
        description: 'Doubles click power',
        baseCost: 50,
        costMultiplier: 2,
        multiplier: 2,
        type: 'click'
    },
    {
        id: 'multiplier2',
        name: 'Super Clicker',
        icon: '💪',
        description: 'x5 click power',
        baseCost: 500,
        costMultiplier: 3,
        multiplier: 5,
        type: 'click'
    },
    {
        id: 'multiplier3',
        name: 'Mega Clicker',
        icon: '💥',
        description: 'x10 click power',
        baseCost: 5000,
        costMultiplier: 4,
        multiplier: 10,
        type: 'click'
    },
    {
        id: 'autostaker',
        name: 'Auto-Staker',
        icon: '🤖',
        description: 'Doubles all production',
        baseCost: 10000,
        costMultiplier: 2.5,
        productionMultiplier: 2,
        type: 'production'
    },
    {
        id: 'turbomode',
        name: 'Turbo Mode',
        icon: '🔥',
        description: 'x3 all production',
        baseCost: 50000,
        costMultiplier: 3,
        productionMultiplier: 3,
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
        // Check if CSPR.click is available
        if (typeof window.csprclick !== 'undefined') {
            // Request account access
            const accounts = await window.csprclick.requestConnection();

            if (accounts && accounts.length > 0) {
                GameState.walletConnected = true;
                GameState.walletAddress = accounts[0];

                // Update UI
                document.getElementById('connectWallet').classList.add('hidden');
                document.getElementById('walletInfo').classList.remove('hidden');
                document.getElementById('walletAddress').textContent =
                    GameState.walletAddress.slice(0, 10) + '...' + GameState.walletAddress.slice(-8);

                // Check achievement
                checkAchievements();

                // Load leaderboard
                loadLeaderboard();

                // Save game
                saveGame();
            }
        } else {
            // Simulate connection for demo purposes
            alert('CSPR.click wallet not detected. This is a demo - wallet features are simulated.');
            GameState.walletConnected = true;
            GameState.walletAddress = 'demo_' + Math.random().toString(36).substring(7);

            document.getElementById('connectWallet').classList.add('hidden');
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('walletAddress').textContent = 'Demo Wallet';

            checkAchievements();
            loadLeaderboard();
            saveGame();
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

/**
 * Load leaderboard from blockchain (simulated for now)
 */
function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');

    // Simulated leaderboard data
    const demoData = [
        { rank: 1, address: '01abc...def1', score: 10000000 },
        { rank: 2, address: '02bcd...ef12', score: 5000000 },
        { rank: 3, address: '03cde...f123', score: 2500000 },
        { rank: 4, address: '04def...1234', score: 1000000 },
        { rank: 5, address: '05ef1...2345', score: 500000 }
    ];

    leaderboard.innerHTML = demoData.map(entry => `
        <div class="leaderboard-entry">
            <span class="leaderboard-rank">#${entry.rank}</span>
            <span>${entry.address}</span>
            <span>${formatNumber(entry.score)}</span>
        </div>
    `).join('');
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

/**
 * Save game to localStorage
 */
function saveGame() {
    const saveData = {
        balance: GameState.balance,
        totalEarned: GameState.totalEarned,
        totalClicks: GameState.totalClicks,
        clickPower: GameState.clickPower,
        perSecond: GameState.perSecond,
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

            GameState.balance = data.balance || 0;
            GameState.totalEarned = data.totalEarned || 0;
            GameState.totalClicks = data.totalClicks || 0;
            GameState.clickPower = data.clickPower || 1;
            GameState.perSecond = data.perSecond || 0;
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
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
        localStorage.removeItem('casperclicker_save');
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

    // Setup event listeners
    document.getElementById('mainButton').addEventListener('click', handleClick);
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Restore wallet UI if connected
    if (GameState.walletConnected && GameState.walletAddress) {
        document.getElementById('connectWallet').classList.add('hidden');
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('walletAddress').textContent =
            GameState.walletAddress.slice(0, 10) + '...' + GameState.walletAddress.slice(-8);
        loadLeaderboard();
    }

    // Initial UI render
    renderUpgrades();
    renderAchievements();
    updateUI();

    // Start game loop (tick every 100ms)
    setInterval(gameTick, 100);

    // Save game every 30 seconds
    setInterval(saveGame, 30000);

    console.log('🎮 CasperClicker - Ready!');
    console.log('💡 Tip: Type resetGame() in console to reset your progress');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Save game before page unload
window.addEventListener('beforeunload', saveGame);
