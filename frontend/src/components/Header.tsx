import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuMoon,
  LuSun,
  LuGlobe,
  LuMenu,
  LuX,
  LuLogOut,
  LuUser,
  LuSparkles,
} from 'react-icons/lu'
import Logo from './Logo'
import { useTheme } from '../context/ThemeContext'
import { useEffects } from '../context/EffectsContext'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import type { TranslationKey } from '../i18n/translations'

// Tất cả mục đều yêu cầu đăng nhập — khi chưa đăng nhập, header không hiện mục nào
// (logo luôn dẫn về trang chủ)
const navItems: { to: string; key: TranslationKey; auth: boolean }[] = [
  { to: '/', key: 'nav.home', auth: true },
  { to: '/practice', key: 'nav.practice', auth: true },
  { to: '/create', key: 'nav.create', auth: true },
  { to: '/history', key: 'nav.history', auth: true },
  { to: '/guide', key: 'nav.guide', auth: true },
]

export default function Header() {
  const { isDark, toggleTheme } = useTheme()
  const { effectsEnabled, toggleEffects } = useEffects()
  const { lang, toggleLang, t } = useI18n()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-brand-600 dark:text-brand-300'
        : 'text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300'
    }`

  const visibleItems = navItems.filter((i) => !i.auth || isAuthenticated)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <Logo size={36} className="rounded-[9px] shadow-lg shadow-brand-500/25" />
          <span className="text-lg font-extrabold tracking-tight">
            Exam<span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">Rush</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
              {({ isActive }) => (
                <>
                  {t(item.key)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Language / Ngôn ngữ"
          >
            <LuGlobe className="h-4 w-4" />
            <span className="uppercase">{lang}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {isDark ? <LuSun className="h-5 w-5" /> : <LuMoon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            onClick={toggleEffects}
            aria-pressed={effectsEnabled}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors ${
              effectsEnabled
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title={effectsEnabled ? t('take.effectsOff') : t('take.effectsOn')}
          >
            <LuSparkles className="h-4 w-4" />
            <span className="hidden sm:inline">FX</span>
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium dark:bg-slate-800">
                <LuUser className="h-4 w-4 text-brand-500" />
                {user?.display_name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                title={t('nav.logout')}
              >
                <LuLogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          >
            {open ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {t(item.key)}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600"
                  >
                    <LuLogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 px-3 py-2 text-center text-sm font-semibold text-white"
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
