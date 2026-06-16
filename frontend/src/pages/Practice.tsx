import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LuClock,
  LuCircleHelp,
  LuPlay,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuPlus,
  LuUser,
  LuShuffle,
} from 'react-icons/lu'
import { examsApi } from '../lib/api'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import { useDialog } from '../context/DialogContext'
import type { ExamListItem } from '../lib/types'
import PageWrapper, { Spinner } from '../components/PageWrapper'
import Pagination from '../components/Pagination'

const PER_PAGE = 9
export const SHUFFLE_KEY = 'examrush_shuffle'

export default function Practice() {
  const { t } = useI18n()
  const { user } = useAuth()
  const dialog = useDialog()
  const navigate = useNavigate()
  const [exams, setExams] = useState<ExamListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [shuffle, setShuffle] = useState(() => localStorage.getItem(SHUFFLE_KEY) === '1')

  useEffect(() => {
    localStorage.setItem(SHUFFLE_KEY, shuffle ? '1' : '0')
  }, [shuffle])

  const load = () => {
    setLoading(true)
    examsApi
      .list()
      .then(setExams)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(
    () =>
      exams.filter((e) =>
        e.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [exams, query],
  )

  const pageCount = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Quay về trang 1 khi tìm kiếm hoặc khi trang vượt quá phạm vi
  useEffect(() => setPage(1), [query])
  useEffect(() => {
    if (page > pageCount && pageCount > 0) setPage(pageCount)
  }, [page, pageCount])

  const handleDelete = async (id: number) => {
    const ok = await dialog.confirm({
      title: t('practice.confirmDeleteTitle'),
      message: t('practice.confirmDelete'),
      confirmText: t('practice.delete'),
      tone: 'danger',
    })
    if (!ok) return
    setDeleting(id)
    try {
      await examsApi.remove(id)
      setExams((prev) => prev.filter((e) => e.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const fmtTime = (s?: number | null) =>
    s ? `${Math.round(s / 60)} ${t('common.minutes')}` : t('practice.noLimit')

  return (
    <PageWrapper className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('practice.title')}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{t('practice.subtitle')}</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
        >
          <LuPlus className="h-4 w-4" /> {t('nav.create')}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('practice.search')}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={shuffle}
          onClick={() => setShuffle((s) => !s)}
          title={t('practice.shuffleHint')}
          className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            shuffle
              ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
              : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <LuShuffle className="h-4 w-4" />
          {t('practice.shuffle')}
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              shuffle ? 'bg-gradient-to-r from-brand-500 to-accent-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                shuffle ? 'left-[1.125rem]' : 'left-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {loading ? (
        <Spinner className="py-24" />
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t('practice.empty')}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((exam, i) => {
            const isOwner = exam.owner_username === user?.username
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.25 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-500/20 to-accent-500/20">
                  {exam.image_url ? (
                    <img
                      src={exam.image_url}
                      alt={exam.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-black text-brand-500/30">
                      {exam.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOwner && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      {t('practice.mine')}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold">{exam.title}</h3>
                  <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">
                    {exam.description || '—'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <LuCircleHelp className="h-3.5 w-3.5" /> {exam.question_count} {t('practice.questions')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <LuClock className="h-3.5 w-3.5" /> {fmtTime(exam.time_limit_seconds)}
                    </span>
                  </div>
                  {exam.owner_username && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                      <LuUser className="h-3 w-3" /> {t('practice.by')} {exam.owner_username}
                    </span>
                  )}

                  <div className="mt-4 flex items-center gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/exam/${exam.id}/take`)}
                      disabled={exam.question_count === 0}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LuPlay className="h-4 w-4" /> {t('practice.start')}
                    </button>
                    {isOwner && (
                      <>
                        <button
                          onClick={() => navigate(`/exam/${exam.id}/edit`)}
                          className="rounded-xl border border-slate-300 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          title={t('practice.edit')}
                        >
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          disabled={deleting === exam.id}
                          className="rounded-xl border border-rose-200 p-2.5 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950"
                          title={t('practice.delete')}
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-10" />
    </PageWrapper>
  )
}
