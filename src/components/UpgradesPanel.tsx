import { motion } from 'framer-motion'
import { useGameStore, UPGRADES, ACHIEVEMENTS, getUpgradeCost, formatNumber } from '../stores/gameStore'

function UpgradeItem({ upgrade }: { upgrade: typeof UPGRADES[0] }) {
  const { balance, upgrades, buyUpgrade } = useGameStore()
  const count = upgrades[upgrade.id] || 0
  const cost = getUpgradeCost(upgrade, count)
  const canAfford = balance >= cost

  return (
    <motion.button
      whileHover={canAfford ? { x: 4 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      onClick={() => buyUpgrade(upgrade.id)}
      disabled={!canAfford}
      className={`w-full text-left glass rounded-xl p-4 transition-all duration-200 relative overflow-hidden ${
        canAfford
          ? 'hover:border-purple-500/40 cursor-pointer'
          : 'opacity-40 cursor-not-allowed grayscale-[0.5]'
      }`}
    >
      {/* Left accent bar */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: canAfford ? 1 : 0 }}
        className="absolute left-0 top-0 w-1 h-full bg-purple-500 origin-center"
      />

      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{upgrade.icon}</span>
          <span className="text-emerald-400 font-semibold">{upgrade.name}</span>
          {count > 0 && (
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
              x{count}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-2">{upgrade.description}</p>
      <p className="text-purple-300 font-mono font-semibold">
        Cost: {formatNumber(cost)} stCSPR
      </p>
    </motion.button>
  )
}

function AchievementItem({ achievement }: { achievement: typeof ACHIEVEMENTS[0] }) {
  const { achievements } = useGameStore()
  const unlocked = achievements[achievement.id] || false

  return (
    <div
      className={`glass rounded-xl p-4 transition-all duration-200 ${
        unlocked
          ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
          : 'opacity-40'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{unlocked ? achievement.icon : '🔒'}</span>
        <span className={`font-semibold ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
          {unlocked ? achievement.name : '???'}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        {unlocked ? achievement.description : 'Hidden achievement'}
      </p>
    </div>
  )
}

export default function UpgradesPanel() {
  return (
    <div className="space-y-6">
      {/* Upgrades Section */}
      <div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-3 mb-4 text-center shadow-lg shadow-purple-500/20">
          <h3 className="text-white font-bold tracking-wider">UPGRADES</h3>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {UPGRADES.map((upgrade, i) => (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <UpgradeItem upgrade={upgrade} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-3 mb-4 text-center shadow-lg shadow-purple-500/20">
          <h3 className="text-white font-bold tracking-wider">ACHIEVEMENTS</h3>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {ACHIEVEMENTS.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.03 }}
            >
              <AchievementItem achievement={achievement} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
