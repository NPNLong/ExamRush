import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuRefreshCw, LuArrowLeft, LuAward } from 'react-icons/lu'
import { useI18n } from '../context/I18nContext'
import PageWrapper from '../components/PageWrapper'
import AttemptReview, { fmtDuration } from '../components/AttemptReview'
import type { AttemptDetail } from '../lib/types'

export default function ExamResult() {
  const { id } = useParams()
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState<AttemptDetail | null>(
    (location.state as { result?: AttemptDetail })?.result || null,
  )

  useEffect(() => {
    if (result) return
    const cached = sessionStorage.getItem('examrush_last_result')
    if (cached) setResult(JSON.parse(cached))
    else navigate('/practice', { replace: true })
  }, [result, navigate])

  if (!result) return null

  const pct = result.percentage
  const tier = pct >= 80 ? 'great' : pct >= 50 ? 'good' : 'keep'
  const ring = pct >= 80 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f43f5e'
  const msg = tier === 'great' ? t('result.great') : tier === 'good' ? t('result.good') : t('result.keep')

  return (
    <PageWrapper className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-aurora overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg">
          <LuAward className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{result.exam_title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{msg}</p>

        {/* circular progress */}
        <div className="relative mx-auto mt-6 h-40 w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-slate-800" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={ring}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black">{pct}%</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {result.score}/{result.total}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-400">{t('result.correct')}</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {result.score}/{result.total}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-400">{t('result.time')}</p>
            <p className="text-lg font-bold">{fmtDuration(result.duration_seconds, t)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/exam/${id}/take`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
          >
            <LuRefreshCw className="h-4 w-4" /> {t('result.retry')}
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LuArrowLeft className="h-4 w-4" /> {t('result.backPractice')}
          </Link>
        </div>
      </motion.div>

      <h2 className="mb-4 mt-10 text-xl font-bold">{t('result.review')}</h2>
      <AttemptReview detail={result.detail} />
    </PageWrapper>
  )
}
