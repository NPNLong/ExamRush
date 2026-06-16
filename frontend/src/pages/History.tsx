import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuClock, LuCalendar, LuChevronRight, LuBookOpen } from 'react-icons/lu'
import { attemptsApi } from '../lib/api'
import { useI18n } from '../context/I18nContext'
import PageWrapper, { Spinner } from '../components/PageWrapper'
import Pagination from '../components/Pagination'
import { fmtDuration } from '../components/AttemptReview'
import type { AttemptListItem } from '../lib/types'

const PER_PAGE = 8

export default function History() {
  const { t, lang } = useI18n()
  const [items, setItems] = useState<AttemptListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    attemptsApi
      .list()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const pageCount = Math.ceil(items.length / PER_PAGE)
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const fmtDate = (iso: string) =>
    new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const color = (p: number) =>
    p >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : p >= 50
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-rose-600 dark:text-rose-400'

  return (
    <PageWrapper className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{t('history.title')}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{t('history.subtitle')}</p>

      {loading ? (
        <Spinner className="py-24" />
      ) : items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <LuBookOpen className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">{t('history.empty')}</p>
          <Link
            to="/practice"
            className="mt-5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30"
          >
            {t('history.startNow')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {paged.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.2), duration: 0.25 }}
            >
              <Link
                to={`/history/${a.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${color(a.percentage)}`}>
                  <span className="text-lg font-black leading-none">{Math.round(a.percentage)}</span>
                  <span className="text-[10px] font-medium opacity-70">%</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-semibold">{a.exam_title}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`font-semibold ${color(a.percentage)}`}>
                      {a.score}/{a.total} {t('practice.questions')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <LuClock className="h-3.5 w-3.5" /> {fmtDuration(a.duration_seconds, t)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <LuCalendar className="h-3.5 w-3.5" /> {fmtDate(a.created_at)}
                    </span>
                  </div>
                </div>
                <LuChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}

          <Pagination page={page} pageCount={pageCount} onChange={setPage} className="pt-6" />
        </div>
      )}
    </PageWrapper>
  )
}
