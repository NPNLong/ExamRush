import { Link } from 'react-router-dom'
import { LuHeart } from 'react-icons/lu'
import Logo from './Logo'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'

const DEV = 'Nguyen Phuoc Nguong Long'

export default function Footer() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()

  const productLinks = isAuthenticated
    ? [
        { to: '/practice', label: t('nav.practice') },
        { to: '/create', label: t('nav.create') },
        { to: '/history', label: t('nav.history') },
      ]
    : [
        { to: '/register', label: t('nav.register') },
        { to: '/login', label: t('nav.login') },
      ]

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={34} className="rounded-[9px]" />
              <span className="text-lg font-extrabold tracking-tight">
                Exam<span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">Rush</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('footer.desc')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">{t('footer.product')}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">{t('footer.resources')}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/guide"
                  className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                >
                  {t('footer.guide')}
                </Link>
              </li>
              <li>
                <Link
                  to="/api-docs"
                  className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                >
                  {t('footer.apiDocs')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <p>
            © {year} ExamRush · {t('footer.license')} · {t('footer.rights')}
          </p>
          <p className="flex items-center gap-1.5">
            {t('footer.madeBy')}
            <LuHeart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{DEV}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
