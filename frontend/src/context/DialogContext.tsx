import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuTriangleAlert, LuInfo, LuTrash2, LuCircleHelp, LuX } from 'react-icons/lu'
import { useI18n } from './I18nContext'

type Tone = 'default' | 'danger' | 'info'

export interface DialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  tone?: Tone
}

interface DialogState extends DialogOptions {
  mode: 'confirm' | 'alert'
  resolve: (value: boolean) => void
}

interface DialogApi {
  confirm: (opts: DialogOptions) => Promise<boolean>
  alert: (opts: DialogOptions | string) => Promise<void>
}

const DialogContext = createContext<DialogApi | null>(null)

const toneIcon: Record<Tone, ReactNode> = {
  default: <LuCircleHelp className="h-6 w-6" />,
  danger: <LuTriangleAlert className="h-6 w-6" />,
  info: <LuInfo className="h-6 w-6" />,
}

const toneRing: Record<Tone, string> = {
  default: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  danger: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
}

const toneBtn: Record<Tone, string> = {
  default: 'bg-gradient-to-r from-brand-500 to-accent-500 shadow-brand-500/30',
  danger: 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/30',
  info: 'bg-gradient-to-r from-sky-500 to-sky-600 shadow-sky-500/30',
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [state, setState] = useState<DialogState | null>(null)
  const resolveRef = useRef<((v: boolean) => void) | null>(null)

  const close = useCallback((value: boolean) => {
    resolveRef.current?.(value)
    resolveRef.current = null
    setState(null)
  }, [])

  const confirm = useCallback(
    (opts: DialogOptions) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        setState({ ...opts, mode: 'confirm', resolve })
      }),
    [],
  )

  const alert = useCallback(
    (opts: DialogOptions | string) =>
      new Promise<void>((resolve) => {
        const o = typeof opts === 'string' ? { message: opts } : opts
        resolveRef.current = () => resolve()
        setState({ ...o, mode: 'alert', resolve: () => resolve() })
      }),
    [],
  )

  const tone: Tone = state?.tone || (state?.mode === 'alert' ? 'info' : 'default')

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => close(false)}
            />

            {/* Card */}
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${toneRing[tone]}`}>
                {state.tone === 'danger' ? <LuTrash2 className="h-6 w-6" /> : toneIcon[tone]}
              </div>

              {state.title && <h3 className="text-lg font-bold">{state.title}</h3>}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{state.message}</p>

              <div className="mt-6 flex justify-end gap-2.5">
                {state.mode === 'confirm' && (
                  <button
                    onClick={() => close(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {state.cancelText || t('common.cancel')}
                  </button>
                )}
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 ${toneBtn[tone]}`}
                >
                  {state.confirmText || (state.mode === 'alert' ? t('common.ok') : t('common.confirm'))}
                </button>
              </div>

              {/* Close (X) for alert */}
              {state.mode === 'alert' && (
                <button
                  onClick={() => close(false)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <LuX className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within DialogProvider')
  return ctx
}
