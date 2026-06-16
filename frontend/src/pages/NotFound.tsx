import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../context/I18nContext'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <div className="bg-aurora flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-brand-500 to-accent-500 bg-clip-text text-8xl font-black text-transparent"
      >
        404
      </motion.h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('common.notFound')}</p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
      >
        {t('common.goHome')}
      </Link>
    </div>
  )
}
