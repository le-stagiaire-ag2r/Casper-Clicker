import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GhostBackground from './components/GhostBackground'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import ClickButton from './components/ClickButton'
import UpgradesPanel from './components/UpgradesPanel'
import { useGameStore, ACHIEVEMENTS } from './stores/gameStore'

function AchievementToast({ achievement, onClose }: { achievement: typeof ACHIEVEMENTS[0], onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="glass rounded-xl p-4 border-2 border-emerald-500 shadow-[0_0_40px_rgba(34,197,94,0.4)] min-w-[320px]"
    >
      <div className="flex items-center gap-4">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.5 }}
          className="text-4xl"
        >
          {achievement.icon}
        </motion.span>
        <div>
          <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
            Achievement Unlocked!
          </p>
          <p className="text-white font-semibold">{achievement.name}</p>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const { addPassiveIncome, updatePlayTime, checkAchievements, startTime } = useGameStore()
  const lastTickRef = useRef(Date.now())
  const achievementQueueRef = useRef<string[]>([])
  const [showAchievement, setShowAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null)

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
      if (achievementQueueRef.current.length > 0 && !showAchievement) {
        const id = achievementQueueRef.current.shift()
        const achievement = ACHIEVEMENTS.find(a => a.id === id)
        if (achievement) {
          setShowAchievement(achievement)
        }
      }
    }, 100)

    return () => clearInterval(gameLoop)
  }, [addPassiveIncome, updatePlayTime, checkAchievements, startTime, showAchievement])

  return (
    <>
      <GhostBackground />

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
            <p className="text-slate-500 text-xs mt-2">v2.0.0 - Phantom Realm Edition (React)</p>
          </motion.footer>
        </div>
      </div>

      {/* Achievement Toast */}
      <div className="fixed top-6 right-6 z-50">
        <AnimatePresence>
          {showAchievement && (
            <AchievementToast
              achievement={showAchievement}
              onClose={() => setShowAchievement(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
