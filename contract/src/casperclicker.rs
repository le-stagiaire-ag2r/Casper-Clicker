use odra::prelude::*;

// Anti-cheat constants
const MAX_PER_CLICK: u64 = 10_000u64;
const MIN_PLAY_TIME_RATIO: u64 = 100; // 1 second per 100 earned minimum

/// Player score data structure
#[odra::odra_type]
pub struct PlayerScore {
    pub player_name: String,
    pub wallet_address: Address,
    pub total_earned: u64,
    pub total_clicks: u64,
    pub play_time: u64,
    pub timestamp: u64,
}

/// Event emitted when a score is submitted
#[odra::event]
pub struct ScoreSubmitted {
    pub player_name: String,
    pub wallet_address: Address,
    pub total_earned: u64,
    pub total_clicks: u64,
    pub play_time: u64,
    pub timestamp: u64,
}

/// Contract errors
#[odra::odra_error]
pub enum ContractErrors {
    CheatDetectedInvalidRatio = 1,
    CheatDetectedImpossiblePlayTime = 2,
    PlayerNotFound = 3,
}

/// CasperClicker Smart Contract
#[odra::module(errors = ContractErrors, events = [ScoreSubmitted])]
pub struct CasperClicker {
    /// Leaderboard mapping: wallet_address -> PlayerScore
    leaderboard: Mapping<Address, PlayerScore>,
}

#[odra::module]
impl CasperClicker {
    /// Initialize the contract
    pub fn init(&mut self) {
        // Contract is ready to receive scores
    }

    /// Submit a player's score to the leaderboard
    /// Includes anti-cheat validation
    pub fn submit_score(
        &mut self,
        player_name: String,
        total_earned: u64,
        total_clicks: u64,
        play_time: u64,
        timestamp: u64,
    ) {
        let caller = self.env().caller();

        // Anti-cheat validation: Check earned/clicks ratio
        if total_clicks > 0 && total_earned / total_clicks > MAX_PER_CLICK {
            self.env().revert(ContractErrors::CheatDetectedInvalidRatio);
        }

        // Anti-cheat validation: Check play time is reasonable
        if play_time > 0 && total_earned > 0 {
            let min_play_time = total_earned / MIN_PLAY_TIME_RATIO;
            if play_time < min_play_time {
                self.env().revert(ContractErrors::CheatDetectedImpossiblePlayTime);
            }
        }

        // Create player score
        let score = PlayerScore {
            player_name: player_name.clone(),
            wallet_address: caller,
            total_earned,
            total_clicks,
            play_time,
            timestamp,
        };

        // Store in leaderboard
        self.leaderboard.set(&caller, score);

        // Emit event
        self.env().emit_event(ScoreSubmitted {
            player_name,
            wallet_address: caller,
            total_earned,
            total_clicks,
            play_time,
            timestamp,
        });
    }

    /// Get a specific player's score by wallet address
    pub fn get_player_score(&self, wallet_address: Address) -> Option<PlayerScore> {
        self.leaderboard.get(&wallet_address)
    }

    /// Check if a player has a score recorded
    pub fn has_score(&self, wallet_address: Address) -> bool {
        self.leaderboard.get(&wallet_address).is_some()
    }

    /// Get the total number of players (for future pagination)
    /// Note: This is a simplified version. In production, you'd implement
    /// a more sophisticated leaderboard with sorting and pagination
    pub fn get_total_players(&self) -> u64 {
        // This would require additional storage tracking
        // For now, we return 0 as a placeholder
        0u64
    }
}

// Note: Odra tests require specific setup with test environment
// The WASM contract compiles successfully and can be tested via deployment
//
// To test the contract:
// 1. Deploy to testnet using: ./deploy.sh testnet /path/to/key.pem
// 2. Call functions via casper-client or frontend
// 3. Verify on block explorer: https://testnet.cspr.live
//
// Anti-cheat validation is enforced in the contract:
// - MAX_PER_CLICK: 10,000 stCSPR per click
// - MIN_PLAY_TIME_RATIO: 1 second per 100 stCSPR earned
