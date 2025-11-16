/**
 * ============================================
 * CASPER BLOCKCHAIN INTEGRATION
 * ============================================
 *
 * This module handles all interactions with the Casper blockchain
 * including wallet connection, contract calls, and leaderboard sync.
 */

// Contract configuration
const CASPER_CONFIG = {
    // Testnet RPC endpoint
    nodeAddress: 'http://65.21.235.219:7777/rpc',
    chainName: 'casper-test',

    // Contract details (will be set after deployment)
    contractHash: '', // Set this after deploying the contract
    contractPackageHash: '', // Set this after deploying the contract

    // Entry points
    entryPoints: {
        submitScore: 'submit_score',
        getLeaderboard: 'get_leaderboard',
        getPlayerScore: 'get_player_score'
    }
};

// Blockchain state
const BlockchainState = {
    connected: false,
    walletAddress: null,
    publicKey: null,
    casperClient: null,
    lastSyncTime: 0
};

/**
 * Connect to Casper wallet using CSPR.click
 */
async function connectCasperWallet() {
    try {
        // Check if CSPR.click is available
        if (typeof window.csprclick === 'undefined') {
            throw new Error('CSPR.click wallet not found. Please install it from https://cspr.click');
        }

        // Request connection
        const response = await window.csprclick.requestConnection();

        if (response.success) {
            BlockchainState.connected = true;
            BlockchainState.walletAddress = response.activeKey;
            BlockchainState.publicKey = response.activeKey;

            console.log('✅ Wallet connected:', BlockchainState.walletAddress);
            return {
                success: true,
                address: BlockchainState.walletAddress
            };
        } else {
            throw new Error('Wallet connection rejected');
        }
    } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Submit player score to blockchain
 */
async function submitScoreToBlockchain(playerData) {
    if (!BlockchainState.connected) {
        throw new Error('Wallet not connected');
    }

    if (!CASPER_CONFIG.contractHash) {
        console.warn('⚠️ Contract not deployed yet. Score saved locally only.');
        return { success: false, message: 'Contract not deployed' };
    }

    try {
        console.log('📤 Submitting score to blockchain...', playerData);

        // Prepare deploy parameters
        const deployParams = {
            contractHash: CASPER_CONFIG.contractHash,
            entryPoint: CASPER_CONFIG.entryPoints.submitScore,
            runtimeArgs: {
                player_name: playerData.playerName,
                wallet_address: BlockchainState.walletAddress,
                total_earned: Math.floor(playerData.totalEarned),
                total_clicks: playerData.totalClicks,
                play_time: Math.floor(playerData.playTime),
                timestamp: Math.floor(Date.now() / 1000)
            },
            paymentAmount: '1000000000' // 1 CSPR
        };

        // Send via CSPR.click
        const result = await window.csprclick.send(JSON.stringify(deployParams));

        if (result.success) {
            console.log('✅ Score submitted successfully!');
            console.log('Deploy hash:', result.deployHash);

            return {
                success: true,
                deployHash: result.deployHash,
                message: 'Score submitted to blockchain!'
            };
        } else {
            throw new Error(result.error || 'Deploy failed');
        }
    } catch (error) {
        console.error('❌ Failed to submit score:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get player score from blockchain
 */
async function getPlayerScoreFromBlockchain(walletAddress) {
    if (!CASPER_CONFIG.contractHash) {
        return null;
    }

    try {
        // This would use casper-js-sdk to query the contract
        // For now, return null (implement with SDK later)
        console.log('📥 Fetching score for:', walletAddress);

        // TODO: Implement RPC call to query contract state
        // const result = await queryContract(walletAddress);

        return null;
    } catch (error) {
        console.error('❌ Failed to fetch score:', error);
        return null;
    }
}

/**
 * Fetch global leaderboard from blockchain
 */
async function fetchGlobalLeaderboard() {
    if (!CASPER_CONFIG.contractHash) {
        console.warn('⚠️ Contract not deployed. Using demo leaderboard.');
        return getDemoLeaderboard();
    }

    try {
        console.log('📊 Fetching global leaderboard from blockchain...');

        // TODO: Implement RPC call to fetch all scores
        // This requires iterating over dictionary keys or using an event listener

        // For now, return demo data
        return getDemoLeaderboard();
    } catch (error) {
        console.error('❌ Failed to fetch leaderboard:', error);
        return getDemoLeaderboard();
    }
}

/**
 * Demo leaderboard data (used when contract not deployed)
 */
function getDemoLeaderboard() {
    return [
        { rank: 1, name: 'CasperWhale', score: 15234567, address: '0x1234...5678' },
        { rank: 2, name: 'StakeMaster', score: 9876543, address: '0x9876...5432' },
        { rank: 3, name: 'ValidatorKing', score: 5432109, address: '0x5432...1098' },
        { rank: 4, name: 'ClickPro', score: 3210987, address: '0x3210...9876' },
        { rank: 5, name: 'CasperFan', score: 1098765, address: '0x1098...7654' }
    ];
}

/**
 * Auto-sync score to blockchain (called periodically)
 */
async function autoSyncScore(gameState) {
    // Only sync if connected and enough time has passed (5 minutes)
    const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    if (!BlockchainState.connected) {
        return;
    }

    if (now - BlockchainState.lastSyncTime < MIN_SYNC_INTERVAL) {
        return; // Too soon
    }

    const playerData = {
        playerName: gameState.playerName || 'Anonymous',
        totalEarned: gameState.totalEarned,
        totalClicks: gameState.totalClicks,
        playTime: gameState.playTime
    };

    const result = await submitScoreToBlockchain(playerData);

    if (result.success) {
        BlockchainState.lastSyncTime = now;
        console.log('🔄 Auto-sync completed');
    }
}

/**
 * Get blockchain connection status
 */
function isBlockchainConnected() {
    return BlockchainState.connected;
}

/**
 * Get wallet address
 */
function getWalletAddress() {
    return BlockchainState.walletAddress;
}

// Export functions for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        connectCasperWallet,
        submitScoreToBlockchain,
        getPlayerScoreFromBlockchain,
        fetchGlobalLeaderboard,
        autoSyncScore,
        isBlockchainConnected,
        getWalletAddress,
        CASPER_CONFIG
    };
}
