import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info' | 'achievement'

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  achievement: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    icon: '✅'
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: '❌'
  },
  info: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    icon: '💡'
  },
  achievement: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    icon: '🏆'
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((title: string, message?: string) => addToast('success', title, message), [addToast])
  const error = useCallback((title: string, message?: string) => addToast('error', title, message), [addToast])
  const info = useCallback((title: string, message?: string) => addToast('info', title, message), [addToast])
  const achievement = useCallback((title: string, message?: string) => addToast('achievement', title, message), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info, achievement }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const style = toastStyles[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                className={`
                  ${style.bg} ${style.border}
                  backdrop-blur-xl border rounded-xl p-4 min-w-[280px] max-w-[350px]
                  shadow-lg shadow-black/20 pointer-events-auto
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{toast.title}</h4>
                    {toast.message && (
                      <p className="text-white/70 text-xs mt-1">{toast.message}</p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left rounded-b-xl"
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
