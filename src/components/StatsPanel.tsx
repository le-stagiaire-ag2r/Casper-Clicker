import { motion } from 'framer-motion'
import { useGameStore, formatNumber, formatTime } from '../stores/gameStore'

interface StatCardProps {
  title: string
  value: string
  unit?: string
  delay?: number
}

function StatCard({ title, value, unit, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-5 hover:border-purple-500/40 transition-all duration-300"
    >
      <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="gradient-text-green text-3xl font-bold">{value}</span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>
    </motion.div>
  )
}

export default function StatsPanel() {
  const { balance, perSecond, totalClicks, totalEarned, playTime } = useGameStore()

  return (
    <div className="space-y-4">
      <StatCard title="Your Balance" value={formatNumber(balance)} unit="stCSPR" delay={0} />
      <StatCard title="Per Second" value={formatNumber(perSecond)} unit="stCSPR/s" delay={0.1} />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-5"
      >
        <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
          Total Stats
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Clicks</span>
            <span className="text-amber-400 font-mono font-semibold">{formatNumber(totalClicks)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Earned</span>
            <span className="text-amber-400 font-mono font-semibold">{formatNumber(totalEarned)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Play Time</span>
            <span className="text-amber-400 font-mono font-semibold">{formatTime(playTime)}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-5"
      >
        <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
          Next Milestone
        </h3>
        <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 50%, #22c55e 100%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min((totalEarned / 1000) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </motion.div>
        </div>
        <p className="text-center mt-2 text-sm text-slate-400 font-mono">
          {formatNumber(totalEarned)} / 1K stCSPR
        </p>
      </motion.div>
    </div>
  )
}
