import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'

export default function Header() {
  const { playerName, setPlayerName, reset } = useGameStore()

  useEffect(() => {
    if (!playerName) {
      const name = prompt("Welcome to CasperClicker! What's your player name?")
      if (name && name.trim()) {
        setPlayerName(name.trim().substring(0, 20))
      } else {
        setPlayerName('Anonymous Staker')
      }
    }
  }, [playerName, setPlayerName])

  const handleReset = () => {
    if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
      reset()
      window.location.reload()
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 md:p-6 mb-6 relative overflow-hidden"
    >
      {/* Animated top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #8b5cf6)',
          backgroundSize: '200% 100%',
          animation: 'gradientFlow 3s ease infinite',
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text flex items-center gap-2">
            <span>👻</span>
            <span>CASPER CLICKER</span>
          </h1>
          <p className="text-cyan-400 text-sm font-medium">Phantom Realm - Idle Staking Game</p>
          {playerName && (
            <p
              className="text-emerald-400 text-sm mt-1 cursor-pointer hover:text-emerald-300 transition-colors"
              onClick={() => {
                const newName = prompt('Enter new name:', playerName)
                if (newName && newName.trim()) {
                  setPlayerName(newName.trim().substring(0, 20))
                }
              }}
            >
              Player: {playerName}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-slate-400 border border-slate-600 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            Reset
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
