import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Upgrade, Achievement } from '../types/game'

// Upgrades configuration
export const UPGRADES: Upgrade[] = [
  { id: 'validator1', name: 'Basic Validator', icon: '🖥️', description: '+0.1 stCSPR/sec', baseCost: 20, costMultiplier: 1.15, production: 0.1, type: 'generator' },
  { id: 'validator2', name: 'Enhanced Validator', icon: '💻', description: '+0.5 stCSPR/sec', baseCost: 150, costMultiplier: 1.15, production: 0.5, type: 'generator' },
  { id: 'validator3', name: 'Super Validator', icon: '🖥️', description: '+2 stCSPR/sec', baseCost: 1500, costMultiplier: 1.15, production: 2, type: 'generator' },
  { id: 'validator4', name: 'Mega Validator', icon: '🚀', description: '+8 stCSPR/sec', baseCost: 15000, costMultiplier: 1.15, production: 8, type: 'generator' },
  { id: 'validator5', name: 'Ultra Validator', icon: '⚡', description: '+30 stCSPR/sec', baseCost: 150000, costMultiplier: 1.15, production: 30, type: 'generator' },
  { id: 'validator6', name: 'Quantum Validator', icon: '🌌', description: '+100 stCSPR/sec', baseCost: 750000, costMultiplier: 1.15, production: 100, type: 'generator' },
  { id: 'validator7', name: 'Infinity Engine', icon: '♾️', description: '+500 stCSPR/sec', baseCost: 5000000, costMultiplier: 1.15, production: 500, type: 'generator' },
  { id: 'multiplier1', name: 'Click Booster', icon: '👆', description: '+50% click power', baseCost: 100, costMultiplier: 2, multiplier: 1.5, type: 'click' },
  { id: 'multiplier2', name: 'Super Clicker', icon: '💪', description: 'x2 click power', baseCost: 1000, costMultiplier: 3, multiplier: 2, type: 'click' },
  { id: 'multiplier3', name: 'Mega Clicker', icon: '💥', description: 'x3 click power', baseCost: 10000, costMultiplier: 4, multiplier: 3, type: 'click' },
  { id: 'multiplier4', name: 'Golden Touch', icon: '✨', description: 'x5 click power', baseCost: 50000, costMultiplier: 5, multiplier: 5, type: 'click' },
  { id: 'multiplier5', name: 'God Mode', icon: '👑', description: 'x10 click power', baseCost: 500000, costMultiplier: 6, multiplier: 10, type: 'click' },
  { id: 'autostaker', name: 'Auto-Staker', icon: '🤖', description: '+50% all production', baseCost: 20000, costMultiplier: 2.5, productionMultiplier: 1.5, type: 'production' },
  { id: 'turbomode', name: 'Turbo Mode', icon: '🔥', description: 'x2 all production', baseCost: 100000, costMultiplier: 3, productionMultiplier: 2, type: 'production' },
  { id: 'hyperproduction', name: 'Hyper Production', icon: '⚛️', description: 'x2.5 all production', baseCost: 1000000, costMultiplier: 4, productionMultiplier: 2.5, type: 'production' },
]

// Achievements configuration
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_click', name: 'First Stake', icon: '🎉', description: 'Make your first click', check: (s) => s.totalClicks >= 1 },
  { id: 'clicker', name: 'Active Staker', icon: '👆', description: 'Click 100 times', check: (s) => s.totalClicks >= 100 },
  { id: 'veteran_clicker', name: 'Veteran Staker', icon: '💪', description: 'Click 1,000 times', check: (s) => s.totalClicks >= 1000 },
  { id: 'ultimate_clicker', name: 'Ultimate Clicker', icon: '🔥', description: 'Click 10,000 times', check: (s) => s.totalClicks >= 10000 },
  { id: 'first_hundred', name: 'Hundred Club', icon: '💯', description: 'Earn 100 stCSPR', check: (s) => s.totalEarned >= 100 },
  { id: 'first_thousand', name: 'Thousand Club', icon: '🎖️', description: 'Earn 1,000 stCSPR', check: (s) => s.totalEarned >= 1000 },
  { id: 'millionaire', name: 'stCSPR Millionaire', icon: '💰', description: 'Earn 1,000,000 stCSPR', check: (s) => s.totalEarned >= 1000000 },
  { id: 'billionaire', name: 'Billionaire', icon: '💎', description: 'Earn 1,000,000,000 stCSPR', check: (s) => s.totalEarned >= 1000000000 },
  { id: 'first_validator', name: 'Validator Owner', icon: '🖥️', description: 'Buy your first validator', check: (s) => Object.values(s.upgrades).some(c => c > 0) },
  { id: 'passive_income', name: 'Passive Income', icon: '💸', description: 'Earn 100 stCSPR/sec', check: (s) => s.perSecond >= 100 },
  { id: 'automation_king', name: 'Automation King', icon: '👑', description: 'Earn 1,000 stCSPR/sec', check: (s) => s.perSecond >= 1000 },
  { id: 'dedication', name: 'Dedicated Staker', icon: '⏰', description: 'Play for 10 minutes', check: (s) => s.playTime >= 600 },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Play for 1 hour', check: (s) => s.playTime >= 3600 },
  { id: 'wallet_connect', name: 'Connected', icon: '🔗', description: 'Connect your Casper wallet', check: (s) => s.walletConnected },
]

interface GameStore extends GameState {
  // Actions
  click: () => void
  addPassiveIncome: (deltaTime: number) => void
  buyUpgrade: (upgradeId: string) => void
  addBonus: (amount: number) => void
  setPlayerName: (name: string) => void
  setWallet: (connected: boolean, address: string | null) => void
  updatePlayTime: (time: number) => void
  checkAchievements: () => string[]
  reset: () => void
}

const initialState: GameState = {
  playerName: '',
  balance: 0,
  totalEarned: 0,
  totalClicks: 0,
  clickPower: 1,
  perSecond: 0,
  totalSpent: 0,
  startTime: Date.now(),
  playTime: 0,
  walletConnected: false,
  walletAddress: null,
  upgrades: {},
  achievements: {},
  nextMilestone: 100,
}

const calculateClickPower = (upgrades: Record<string, number>): number => {
  let power = 1
  UPGRADES.forEach(upgrade => {
    if (upgrade.type === 'click' && upgrade.multiplier) {
      const count = upgrades[upgrade.id] || 0
      power *= Math.pow(upgrade.multiplier, count)
    }
  })
  return power
}

const calculatePerSecond = (upgrades: Record<string, number>): number => {
  let total = 0
  let multiplier = 1

  UPGRADES.forEach(upgrade => {
    const count = upgrades[upgrade.id] || 0
    if (upgrade.type === 'generator' && upgrade.production) {
      total += upgrade.production * count
    }
    if (upgrade.type === 'production' && upgrade.productionMultiplier && count > 0) {
      multiplier *= Math.pow(upgrade.productionMultiplier, count)
    }
  })

  return total * multiplier
}

export const getUpgradeCost = (upgrade: Upgrade, count: number): number => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count))
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      click: () => set((state) => ({
        balance: state.balance + state.clickPower,
        totalEarned: state.totalEarned + state.clickPower,
        totalClicks: state.totalClicks + 1,
      })),

      addPassiveIncome: (deltaTime: number) => set((state) => {
        if (state.perSecond <= 0) return state
        const earned = state.perSecond * deltaTime
        return {
          balance: state.balance + earned,
          totalEarned: state.totalEarned + earned,
        }
      }),

      buyUpgrade: (upgradeId: string) => {
        const state = get()
        const upgrade = UPGRADES.find(u => u.id === upgradeId)
        if (!upgrade) return

        const count = state.upgrades[upgradeId] || 0
        const cost = getUpgradeCost(upgrade, count)

        if (state.balance >= cost) {
          const newUpgrades = { ...state.upgrades, [upgradeId]: count + 1 }
          set({
            balance: state.balance - cost,
            totalSpent: state.totalSpent + cost,
            upgrades: newUpgrades,
            clickPower: calculateClickPower(newUpgrades),
            perSecond: calculatePerSecond(newUpgrades),
          })
        }
      },

      addBonus: (amount: number) => set((state) => ({
        balance: state.balance + amount,
        totalEarned: state.totalEarned + amount,
      })),

      setPlayerName: (name: string) => set({ playerName: name }),

      setWallet: (connected: boolean, address: string | null) => set({
        walletConnected: connected,
        walletAddress: address,
      }),

      updatePlayTime: (time: number) => set({ playTime: time }),

      checkAchievements: () => {
        const state = get()
        const newlyUnlocked: string[] = []

        ACHIEVEMENTS.forEach(achievement => {
          if (!state.achievements[achievement.id] && achievement.check(state)) {
            newlyUnlocked.push(achievement.id)
          }
        })

        if (newlyUnlocked.length > 0) {
          set({
            achievements: {
              ...state.achievements,
              ...Object.fromEntries(newlyUnlocked.map(id => [id, true])),
            },
          })
        }

        return newlyUnlocked
      },

      reset: () => set({ ...initialState, startTime: Date.now() }),
    }),
    {
      name: 'casper-clicker-storage',
    }
  )
)

// Utility function to format numbers
export const formatNumber = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M'
  if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B'
  return (num / 1000000000000).toFixed(2) + 'T'
}

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}
