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
    nodeAddress: 'https://node.testnet.casper.network/rpc',
    chainName: 'casper-test',

    // Contract details (deployed on Nov 27, 2025)
    contractHash: 'hash-49d21d7f14b34c781d69e0bdb2713d1ded994e51a029f57ef1f593d65d374dcb',
    contractPackageHash: 'hash-49d21d7f14b34c781d69e0bdb2713d1ded994e51a029f57ef1f593d65d374dcb',

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
    provider: null, // Store wallet provider
    walletType: null, // 'casper-wallet' or 'casper-signer'
    lastSyncTime: 0
};

/**
 * Connect to Casper wallet (supports multiple wallet types)
 */
async function connectCasperWallet() {
    try {
        // Try Casper Wallet first (most popular)
        if (typeof window.CasperWalletProvider !== 'undefined') {
            const provider = window.CasperWalletProvider();
            const isConnected = await provider.requestConnection();

            if (isConnected) {
                const publicKey = await provider.getActivePublicKey();
                BlockchainState.connected = true;
                BlockchainState.walletAddress = publicKey;
                BlockchainState.publicKey = publicKey;
                BlockchainState.provider = provider;
                BlockchainState.walletType = 'casper-wallet';

                console.log('✅ Casper Wallet connected:', publicKey);
                return {
                    success: true,
                    address: publicKey
                };
            }
        }

        // Try Casper Signer as fallback
        if (typeof window.casperlabsHelper !== 'undefined') {
            const publicKey = await window.casperlabsHelper.requestConnection();

            if (publicKey) {
                BlockchainState.connected = true;
                BlockchainState.walletAddress = publicKey;
                BlockchainState.publicKey = publicKey;
                BlockchainState.provider = window.casperlabsHelper;
                BlockchainState.walletType = 'casper-signer';

                console.log('✅ Casper Signer connected:', publicKey);
                return {
                    success: true,
                    address: publicKey
                };
            }
        }

        // No wallet found
        throw new Error('No Casper wallet detected. Please install Casper Wallet or Casper Signer extension.');

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

        // Prepare transaction arguments
        const args = {
            player_name: playerData.playerName || 'Anonymous',
            total_earned: Math.floor(playerData.totalEarned),
            total_clicks: playerData.totalClicks || 0,
            play_time: Math.floor(playerData.playTime || 0),
            timestamp: Math.floor(Date.now() / 1000)
        };

        console.log('📊 Transaction args:', args);

        // Build deploy JSON directly (no SDK needed)
        const contractHash = CASPER_CONFIG.contractHash.replace('hash-', '');

        const deployJson = {
            deploy: {
                hash: '', // Will be filled by wallet
                header: {
                    account: BlockchainState.walletAddress,
                    timestamp: new Date().toISOString(),
                    ttl: '30m',
                    gas_price: 1,
                    body_hash: '',
                    dependencies: [],
                    chain_name: CASPER_CONFIG.chainName
                },
                payment: {
                    ModuleBytes: {
                        module_bytes: '',
                        args: [
                            ['amount', { cl_type: 'U512', bytes: '0400f90295', parsed: '5000000000' }]
                        ]
                    }
                },
                session: {
                    StoredContractByHash: {
                        hash: contractHash,
                        entry_point: CASPER_CONFIG.entryPoints.submitScore,
                        args: [
                            ['player_name', { cl_type: 'String', bytes: '', parsed: args.player_name }],
                            ['total_earned', { cl_type: 'U64', bytes: '', parsed: args.total_earned.toString() }],
                            ['total_clicks', { cl_type: 'U64', bytes: '', parsed: args.total_clicks.toString() }],
                            ['play_time', { cl_type: 'U64', bytes: '', parsed: args.play_time.toString() }],
                            ['timestamp', { cl_type: 'U64', bytes: '', parsed: args.timestamp.toString() }]
                        ]
                    }
                },
                approvals: []
            }
        };

        console.log('📦 Deploy JSON built:', deployJson);
        console.log('📝 Signing with wallet...');

        // Sign and send with wallet
        let deployHash;

        if (BlockchainState.walletType === 'casper-wallet') {
            // Casper Wallet - direct signDeploy
            const result = await BlockchainState.provider.signDeploy(
                deployJson,
                BlockchainState.walletAddress
            );

            deployHash = result.deploy?.hash || result.hash;
            console.log('✅ Transaction sent by Casper Wallet:', result);

        } else if (BlockchainState.walletType === 'casper-signer') {
            // Casper Signer
            const signedDeploy = await BlockchainState.provider.sign(
                JSON.stringify(deployJson),
                BlockchainState.walletAddress
            );

            const parsed = JSON.parse(signedDeploy);
            deployHash = parsed.deploy?.hash || parsed.hash;

            // Send to network manually
            const response = await fetch(CASPER_CONFIG.nodeAddress, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'account_put_deploy',
                    params: [parsed],
                    id: 1
                })
            });

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error.message || 'Deploy submission failed');
            }

            console.log('✅ Transaction sent by Casper Signer:', result);
        } else {
            throw new Error('Unknown wallet type');
        }

        if (!deployHash) {
            throw new Error('Could not extract deploy hash');
        }

        console.log('Deploy hash:', deployHash);
        console.log('🔗 View transaction: https://testnet.cspr.live/deploy/' + deployHash);

        return {
            success: true,
            deployHash: deployHash,
            message: 'Score submitted to blockchain!'
        };

    } catch (error) {
        console.error('❌ Failed to submit score:', error);
        console.error('Error details:', error);
        return {
            success: false,
            error: error.message || 'Unknown error'
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
