export interface Upgrade {
  id: string
  name: string
  icon: string
  description: string
  baseCost: number
  costMultiplier: number
  type: 'generator' | 'click' | 'production'
  production?: number
  multiplier?: number
  productionMultiplier?: number
}

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  check: (state: GameState) => boolean
}

export interface GameState {
  // Player info
  playerName: string

  // Core stats
  balance: number
  totalEarned: number
  totalClicks: number
  clickPower: number
  perSecond: number
  totalSpent: number

  // Time tracking
  startTime: number
  playTime: number

  // Wallet
  walletConnected: boolean
  walletAddress: string | null

  // Upgrades & Achievements
  upgrades: Record<string, number>
  achievements: Record<string, boolean>

  // Progress
  nextMilestone: number
}

export interface GoldenGhost {
  id: string
  x: number
  y: number
  spawnTime: number
}
