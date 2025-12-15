import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'

export default function Header() {
  const { playerName, setPlayerName, walletConnected, walletAddress, setWallet, reset } = useGameStore()

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

  const connectWallet = async () => {
    const win = window as Window & { CasperWalletProvider?: () => { requestConnection: () => Promise<boolean>; getActivePublicKey: () => Promise<string> } }
    if (win.CasperWalletProvider) {
      try {
        const provider = win.CasperWalletProvider()
        const connected = await provider.requestConnection()
        if (connected) {
          const publicKey = await provider.getActivePublicKey()
          setWallet(true, publicKey)
        }
      } catch (error) {
        console.error('Wallet connection error:', error)
        alert('Failed to connect wallet. Make sure Casper Wallet is installed.')
      }
    } else {
      window.open('https://www.casperwallet.io/', '_blank')
    }
  }

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

        {/* Wallet & Actions */}
        <div className="flex items-center gap-3">
          {walletConnected ? (
            <div className="px-4 py-2 rounded-lg border border-emerald-500 bg-emerald-500/10 text-emerald-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectWallet}
              className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
              }}
            >
              Connect Wallet
            </motion.button>
          )}

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
