import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, formatNumber } from '../stores/gameStore'

interface ClickEffect {
  id: number
  x: number
  y: number
  amount: number
}

export default function ClickButton() {
  const { click, clickPower } = useGameStore()
  const [effects, setEffects] = useState<ClickEffect[]>([])
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    click()

    // Create click effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newEffect: ClickEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      amount: clickPower,
    }

    setEffects(prev => [...prev, newEffect])

    // Remove effect after animation
    setTimeout(() => {
      setEffects(prev => prev.filter(ef => ef.id !== newEffect.id))
    }, 1000)
  }, [click, clickPower])

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        animate={{
          scale: isPressed ? 0.95 : 1,
        }}
        whileHover={{ scale: 1.05 }}
        className="relative w-64 h-64 md:w-72 md:h-72 rounded-full cursor-pointer overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #a78bfa 0%, #8b5cf6 40%, #7c3aed 100%)',
          border: '4px solid #06b6d4',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.5), inset 0 0 60px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Rotating gradient overlay */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(transparent, rgba(255, 255, 255, 0.1), transparent 30%)',
          }}
        />

        {/* Button content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <motion.span
            animate={{
              y: [0, -8, -15, -8, 0],
              rotate: [-5, 0, 5, 0, -5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl md:text-8xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' }}
          >
            👻
          </motion.span>
          <span className="mt-4 text-white font-bold text-lg tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            CLICK TO STAKE!
          </span>
        </div>

        {/* Click effects */}
        <AnimatePresence>
          {effects.map(effect => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 0.5, y: -120 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute pointer-events-none text-2xl font-bold"
              style={{
                left: effect.x,
                top: effect.y,
                color: '#22c55e',
                textShadow: '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)',
              }}
            >
              +{formatNumber(effect.amount)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Click power indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <span className="text-slate-400 text-sm">Click Power</span>
        <div className="gradient-text-green text-2xl font-bold">
          {formatNumber(clickPower)} stCSPR
        </div>
      </motion.div>
    </div>
  )
}
