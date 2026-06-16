import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LuCircleCheck, LuCircleX, LuInfo } from 'react-icons/lu'
import { useI18n } from '../context/I18nContext'
import Pagination from './Pagination'
import type { AttemptDetail } from '../lib/types'

const PER_PAGE = 10

export function fmtDuration(sec: number, t: (k: any) => string) {
  if (sec < 60) return `${sec} ${t('common.seconds')}`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m} ${t('common.minutes')} ${s} ${t('common.seconds')}` : `${m} ${t('common.minutes')}`
}

export default function AttemptReview({ detail }: { detail: AttemptDetail['detail'] }) {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const pageCount = Math.ceil(detail.length / PER_PAGE)
  const start = (page - 1) * PER_PAGE
  const paged = detail.slice(start, start + PER_PAGE)

  const changePage = (p: number) => {
    setPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-4">
      {paged.map((d, idx) => {
        const i = start + idx
        return (
        <motion.div
          key={d.question_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx * 0.025, 0.2), duration: 0.25 }}
          className={`rounded-2xl border-l-4 bg-white p-5 shadow-sm dark:bg-slate-900 ${
            d.is_correct ? 'border-emerald-500' : 'border-rose-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className={d.is_correct ? 'text-emerald-500' : 'text-rose-500'}>
              {d.is_correct ? <LuCircleCheck className="h-5 w-5" /> : <LuCircleX className="h-5 w-5" />}
            </span>
            <div className="flex-1">
              <p className="font-semibold">
                <span className="text-slate-400">{i + 1}.</span> {d.text}
              </p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('result.yourAnswer')}
                  </span>
                  <p className={`mt-0.5 font-semibold ${d.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {d.selected.length ? d.selected.join(', ') : t('result.noAnswer')}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('result.correctAnswer')}
                  </span>
                  <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    {d.correct.join(', ')}
                  </p>
                </div>
              </div>
              {d.explanation && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <LuInfo className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <span>
                    <strong>{t('result.explanation')}:</strong> {d.explanation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        )
      })}

      <Pagination page={page} pageCount={pageCount} onChange={changePage} className="pt-4" />
    </div>
  )
}
