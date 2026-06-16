import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface EffectsCtx {
  effectsEnabled: boolean
  toggleEffects: () => void
}

const EffectsContext = createContext<EffectsCtx | null>(null)

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [effectsEnabled, setEffectsEnabled] = useState(() => {
    const saved = localStorage.getItem('examrush-effects') ?? localStorage.getItem('examrush_exam_effects')
    return saved !== 'off'
  })

  useEffect(() => {
    localStorage.setItem('examrush-effects', effectsEnabled ? 'on' : 'off')
  }, [effectsEnabled])

  return (
    <EffectsContext.Provider value={{ effectsEnabled, toggleEffects: () => setEffectsEnabled((v) => !v) }}>
      {children}
    </EffectsContext.Provider>
  )
}

export function useEffects() {
  const ctx = useContext(EffectsContext)
  if (!ctx) throw new Error('useEffects must be used within EffectsProvider')
  return ctx
}
