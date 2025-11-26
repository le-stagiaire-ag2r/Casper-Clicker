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

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef};

    #[test]
    fn test_submit_and_get_score() {
        let test_env = odra_test::env();
        let mut contract = CasperClickerHostRef::deploy(&test_env, NoArgs);

        // Submit a score
        contract.submit_score(
            "Alice".to_string(),
            1000,  // total_earned
            100,   // total_clicks (10 per click - valid)
            50,    // play_time (50 seconds)
            1234567890,  // timestamp
        );

        // Retrieve the score
        let caller = test_env.get_account(0);
        let score = contract.get_player_score(caller);

        assert!(score.is_some());
        let score = score.unwrap();
        assert_eq!(score.player_name, "Alice");
        assert_eq!(score.total_earned, 1000);
        assert_eq!(score.total_clicks, 100);
        assert_eq!(score.play_time, 50);
    }

    #[test]
    fn test_anti_cheat_invalid_ratio() {
        let test_env = odra_test::env();
        let mut contract = CasperClickerHostRef::deploy(&test_env, NoArgs);

        // Try to submit a cheated score (100,000 per click > 10,000 max)
        test_env.set_caller(test_env.get_account(0));

        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.submit_score(
                "Cheater".to_string(),
                1_000_000,  // total_earned
                10,         // total_clicks (100,000 per click - invalid!)
                500,        // play_time
                1234567890, // timestamp
            );
        }));

        // Should panic due to cheat detection
        assert!(result.is_err());
    }

    #[test]
    fn test_anti_cheat_impossible_play_time() {
        let test_env = odra_test::env();
        let mut contract = CasperClickerHostRef::deploy(&test_env, NoArgs);

        // Try to submit a score with impossible play time
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.submit_score(
                "Speedhacker".to_string(),
                10_000,     // total_earned
                1000,       // total_clicks
                1,          // play_time (only 1 second for 10,000 earned - impossible!)
                1234567890, // timestamp
            );
        }));

        // Should panic due to impossible play time
        assert!(result.is_err());
    }

    #[test]
    fn test_update_score() {
        let test_env = odra_test::env();
        let mut contract = CasperClickerHostRef::deploy(&test_env, NoArgs);

        // Submit initial score
        contract.submit_score(
            "Bob".to_string(),
            500,
            50,
            25,
            1234567890,
        );

        // Update with better score
        contract.submit_score(
            "Bob".to_string(),
            2000,  // improved score
            200,
            100,
            1234567900,
        );

        // Check that score was updated
        let caller = test_env.get_account(0);
        let score = contract.get_player_score(caller);

        assert!(score.is_some());
        let score = score.unwrap();
        assert_eq!(score.total_earned, 2000);
        assert_eq!(score.total_clicks, 200);
    }

    #[test]
    fn test_has_score() {
        let test_env = odra_test::env();
        let mut contract = CasperClickerHostRef::deploy(&test_env, NoArgs);

        let caller = test_env.get_account(0);

        // Initially no score
        assert!(!contract.has_score(caller));

        // Submit score
        contract.submit_score(
            "Charlie".to_string(),
            750,
            75,
            38,
            1234567890,
        );

        // Now has score
        assert!(contract.has_score(caller));
    }
}
