import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LuArrowLeft, LuRefreshCw } from 'react-icons/lu'
import { attemptsApi } from '../lib/api'
import { useI18n } from '../context/I18nContext'
import PageWrapper, { Spinner } from '../components/PageWrapper'
import AttemptReview, { fmtDuration } from '../components/AttemptReview'
import type { AttemptDetail } from '../lib/types'

export default function AttemptDetailPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    attemptsApi
      .get(Number(id))
      .then(setAttempt)
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <Spinner className="py-32" />
  if (!attempt) return null

  const color =
    attempt.percentage >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : attempt.percentage >= 50
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-rose-600 dark:text-rose-400'

  return (
    <PageWrapper className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <LuArrowLeft className="h-4 w-4" /> {t('common.back')}
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">{attempt.exam_title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-slate-400">{t('result.score')}</p>
            <p className={`text-3xl font-black ${color}`}>{attempt.percentage}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('result.correct')}</p>
            <p className="text-xl font-bold">
              {attempt.score}/{attempt.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('result.time')}</p>
            <p className="text-xl font-bold">{fmtDuration(attempt.duration_seconds, t)}</p>
          </div>
          <Link
            to={`/exam/${attempt.exam_id}/take`}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
          >
            <LuRefreshCw className="h-4 w-4" /> {t('result.retry')}
          </Link>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">{t('result.review')}</h2>
      <AttemptReview detail={attempt.detail} />
    </PageWrapper>
  )
}
