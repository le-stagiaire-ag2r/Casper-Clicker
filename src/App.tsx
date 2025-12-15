import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import GhostBackground from './components/GhostBackground'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import ClickButton from './components/ClickButton'
import UpgradesPanel from './components/UpgradesPanel'
import CustomCursor from './components/CustomCursor'
import { ToastProvider, useToast } from './components/Toast'
import { ConfettiProvider, useConfetti } from './components/Confetti'
import { useGameStore, ACHIEVEMENTS } from './stores/gameStore'

function GameContent() {
  const { addPassiveIncome, updatePlayTime, checkAchievements, startTime } = useGameStore()
  const lastTickRef = useRef(Date.now())
  const achievementQueueRef = useRef<string[]>([])
  const [currentAchievement, setCurrentAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null)

  const { achievement: showAchievementToast } = useToast()
  const { triggerConfetti } = useConfetti()

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now()
      const deltaTime = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      // Add passive income
      addPassiveIncome(deltaTime)

      // Update play time
      updatePlayTime((now - startTime) / 1000)

      // Check achievements
      const newAchievements = checkAchievements()
      if (newAchievements.length > 0) {
        achievementQueueRef.current.push(...newAchievements)
      }

      // Show achievement toast
      if (achievementQueueRef.current.length > 0 && !currentAchievement) {
        const id = achievementQueueRef.current.shift()
        const achievement = ACHIEVEMENTS.find(a => a.id === id)
        if (achievement) {
          setCurrentAchievement(achievement)
          showAchievementToast(achievement.name, achievement.description)

          // Trigger confetti for special achievements
          if (['millionaire', 'billionaire', 'master'].includes(achievement.id)) {
            triggerConfetti()
          }

          // Clear after delay
          setTimeout(() => setCurrentAchievement(null), 500)
        }
      }
    }, 100)

    return () => clearInterval(gameLoop)
  }, [addPassiveIncome, updatePlayTime, checkAchievements, startTime, currentAchievement, showAchievementToast, triggerConfetti])

  return (
    <>
      <GhostBackground />
      <CustomCursor />

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Header />

          <main className="grid grid-cols-1 lg:grid-cols-[320px_1fr_380px] gap-6">
            {/* Left Panel - Stats */}
            <aside className="order-2 lg:order-1">
              <StatsPanel />
            </aside>

            {/* Center - Click Area */}
            <section className="order-1 lg:order-2 glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px]">
              <ClickButton />
            </section>

            {/* Right Panel - Upgrades */}
            <aside className="order-3">
              <UpgradesPanel />
            </aside>
          </main>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 mt-6 text-center"
          >
            <p className="text-slate-400">
              Built for <span className="text-purple-400 font-semibold">Casper Hackathon 2026</span>
            </p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <a
                href="https://github.com/le-stagiaire-ag2r/Casper-Clicker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-cyan-400 transition-colors"
              >
                GitHub
              </a>
              <span className="text-slate-600">|</span>
              <a
                href="https://github.com/le-stagiaire-ag2r/Casper-projet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-cyan-400 transition-colors"
              >
                StakeVue
              </a>
            </div>
            <p className="text-slate-500 text-xs mt-2">v2.1.0 - Phantom Realm Edition</p>
          </motion.footer>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <ToastProvider>
      <ConfettiProvider>
        <GameContent />
      </ConfettiProvider>
    </ToastProvider>
  )
}

export default App
