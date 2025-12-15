import { useState, useEffect, useCallback } from 'react'
import { useClickRef } from '@make-software/csprclick-ui'

interface ActiveAccount {
  public_key: string
  account_hash?: string
}

export function useCsprClick() {
  const clickRef = useClickRef()
  const [activeAccount, setActiveAccount] = useState<ActiveAccount | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!clickRef) return

    const handleSignedIn = (event: Event) => {
      const customEvent = event as CustomEvent
      const account = customEvent.detail?.activePublicKey
      if (account) {
        setActiveAccount({ public_key: account })
        setIsConnected(true)
      }
    }

    const handleSwitchedAccount = (event: Event) => {
      const customEvent = event as CustomEvent
      const account = customEvent.detail?.activePublicKey
      if (account) {
        setActiveAccount({ public_key: account })
      }
    }

    const handleSignedOut = () => {
      setActiveAccount(null)
      setIsConnected(false)
    }

    const handleDisconnected = () => {
      setActiveAccount(null)
      setIsConnected(false)
    }

    // Subscribe to CSPR.click events
    window.addEventListener('csprclick:signed_in', handleSignedIn)
    window.addEventListener('csprclick:switched_account', handleSwitchedAccount)
    window.addEventListener('csprclick:signed_out', handleSignedOut)
    window.addEventListener('csprclick:disconnected', handleDisconnected)

    // Check if already connected
    const checkConnection = async () => {
      try {
        const account = await clickRef.getActivePublicKey()
        if (account) {
          setActiveAccount({ public_key: account })
          setIsConnected(true)
        }
      } catch {
        // Not connected
      }
    }
    checkConnection()

    return () => {
      window.removeEventListener('csprclick:signed_in', handleSignedIn)
      window.removeEventListener('csprclick:switched_account', handleSwitchedAccount)
      window.removeEventListener('csprclick:signed_out', handleSignedOut)
      window.removeEventListener('csprclick:disconnected', handleDisconnected)
    }
  }, [clickRef])

  const connect = useCallback(async () => {
    if (clickRef) {
      try {
        await clickRef.signIn()
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    }
  }, [clickRef])

  const disconnect = useCallback(async () => {
    if (clickRef) {
      try {
        await clickRef.signOut()
        setActiveAccount(null)
        setIsConnected(false)
      } catch (error) {
        console.error('Failed to disconnect:', error)
      }
    }
  }, [clickRef])

  const truncateKey = (key: string) => {
    if (!key) return ''
    return `${key.slice(0, 8)}...${key.slice(-6)}`
  }

  return {
    activeAccount,
    isConnected,
    publicKey: activeAccount?.public_key || null,
    truncatedKey: activeAccount ? truncateKey(activeAccount.public_key) : null,
    connect,
    disconnect,
  }
}
