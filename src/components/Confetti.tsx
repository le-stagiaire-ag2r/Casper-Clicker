import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiContextType {
  triggerConfetti: () => void
}

const ConfettiContext = createContext<ConfettiContextType | null>(null)

export function useConfetti() {
  const context = useContext(ConfettiContext)
  if (!context) throw new Error('useConfetti must be used within ConfettiProvider')
  return context
}

const colors = [
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#22c55e', // Green
  '#fbbf24', // Gold
  '#f472b6', // Pink
  '#ef4444', // Red
  '#3b82f6', // Blue
]

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([])

  const triggerConfetti = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 100 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8,
    }))

    setParticles(newParticles)

    setTimeout(() => {
      setParticles([])
    }, 4000)
  }, [])

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {children}

      {/* Confetti Container */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 1,
                y: -20,
                x: `${particle.x}vw`,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '110vh',
                rotate: particle.rotation + 720,
                scale: [1, 1.2, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: particle.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: `0 0 ${particle.size}px ${particle.color}50`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ConfettiContext.Provider>
  )
}
