import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LuClock, LuChevronLeft, LuChevronRight, LuCheck, LuX, LuSend, LuFlag, LuSparkles } from 'react-icons/lu'
import { examsApi } from '../lib/api'
import { useI18n } from '../context/I18nContext'
import { useDialog } from '../context/DialogContext'
import { useEffects } from '../context/EffectsContext'
import { Spinner } from '../components/PageWrapper'
import TechBackground from '../components/TechBackground'
import { SHUFFLE_KEY } from './Practice'
import type { ExamDetailPublic } from '../lib/types'

function fmtClock(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Xáo trộn mảng (Fisher-Yates) — dùng khi bật tùy chọn "Trộn thứ tự câu hỏi"
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ExamTake() {
  const { id } = useParams()
  const examId = Number(id)
  const { t } = useI18n()
  const { effectsEnabled, toggleEffects } = useEffects()
  const dialog = useDialog()
  const navigate = useNavigate()

  const [exam, setExam] = useState<ExamDetailPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const startRef = useRef<number>(Date.now())
  const submittedRef = useRef(false)

  useEffect(() => {
    examsApi
      .get(examId)
      .then((e) => {
        const shouldShuffle = localStorage.getItem(SHUFFLE_KEY) === '1'
        const data = shouldShuffle ? { ...e, questions: shuffleArray(e.questions) } : e
        setExam(data)
        if (data.time_limit_seconds && data.time_limit_seconds > 0) setTimeLeft(data.time_limit_seconds)
        startRef.current = Date.now()
      })
      .catch(() => navigate('/practice'))
      .finally(() => setLoading(false))
  }, [examId, navigate])

  const doSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !exam) return
      if (!auto) {
        const answered = Object.values(answers).filter((a) => a.length > 0).length
        const ok = await dialog.confirm({
          title: t('take.confirmSubmitTitle'),
          message: t('take.confirmSubmit', { answered, total: exam.questions.length }),
          confirmText: t('take.submit'),
        })
        if (!ok) return
      }
      submittedRef.current = true
      setSubmitting(true)
      const duration = Math.round((Date.now() - startRef.current) / 1000)
      try {
        const result = await examsApi.submit(examId, {
          answers: exam.questions.map((q) => ({
            question_id: q.id,
            selected: answers[q.id] || [],
          })),
          duration_seconds: duration,
        })
        sessionStorage.setItem('examrush_last_result', JSON.stringify(result))
        navigate(`/exam/${examId}/result`, { state: { result } })
      } catch {
        submittedRef.current = false
        setSubmitting(false)
      }
    },
    [exam, answers, examId, navigate, t, dialog],
  )

  // Timer
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      doSubmit(true)
      dialog.alert({ title: t('take.timeUpTitle'), message: t('take.timeUp'), tone: 'info' })
      return
    }
    const id = setTimeout(() => setTimeLeft((v) => (v === null ? null : v - 1)), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, doSubmit, t, dialog])

  const toggle = (q: ExamDetailPublic['questions'][number], key: string) => {
    setAnswers((prev) => {
      const cur = prev[q.id] || []
      if (q.type === 'single') return { ...prev, [q.id]: [key] }
      return {
        ...prev,
        [q.id]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
      }
    })
  }

  const toggleFlag = (qid: number) => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) next.delete(qid)
      else next.add(qid)
      return next
    })
  }

  const exit = async () => {
    const ok = await dialog.confirm({
      title: t('take.confirmExitTitle'),
      message: t('take.confirmExit'),
      confirmText: t('take.exit'),
      tone: 'danger',
    })
    if (ok) navigate('/practice')
  }

  if (loading) return <Spinner className="min-h-screen" />
  if (!exam) return null

  const q = exam.questions[current]
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length
  const lowTime = timeLeft !== null && timeLeft <= 30

  return (
    <div className={`relative isolate flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${effectsEnabled ? '' : 'exam-effects-off'}`}>
      {effectsEnabled && <TechBackground className="absolute inset-0 z-0" variant="exam" />}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.10),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.68),rgba(241,245,249,0.9))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.86))]" />
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/78 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-cyan-300/20 dark:bg-slate-950/[0.72] dark:shadow-[0_12px_40px_rgba(8,47,73,0.28)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <button
            onClick={exit}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-cyan-100/75 dark:hover:bg-white/5 dark:hover:text-rose-300"
          >
            <LuX className="h-5 w-5" /> {t('take.exit')}
          </button>
          <h1 className="line-clamp-1 flex-1 text-center text-sm font-bold text-slate-900 dark:text-white sm:text-base">{exam.title}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleEffects}
              aria-pressed={effectsEnabled}
              title={effectsEnabled ? t('take.effectsOff') : t('take.effectsOn')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                effectsEnabled
                  ? 'border-amber-300/50 bg-amber-100 text-amber-700 shadow-lg shadow-amber-500/10 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-100'
                  : 'border-slate-300 bg-white/65 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-100/[0.65] dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100'
              }`}
            >
              <LuSparkles className="h-4 w-4" />
              FX
            </button>
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-bold tabular-nums shadow-lg ${
                timeLeft === null
                  ? 'border-slate-300 bg-white/65 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-cyan-100/70'
                  : lowTime
                    ? `${effectsEnabled ? 'animate-pulse' : ''} border-rose-300/60 bg-rose-50 text-rose-600 shadow-rose-500/10 dark:border-rose-300/40 dark:bg-rose-500/15 dark:text-rose-200 dark:shadow-rose-500/20`
                    : 'border-brand-200 bg-brand-50 text-brand-700 shadow-brand-500/10 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-100 dark:shadow-cyan-500/20'
              }`}
            >
              <LuClock className="h-4 w-4" />
              {timeLeft === null ? '∞' : fmtClock(timeLeft)}
            </div>
          </div>
        </div>
        {/* progress */}
        <div className="h-1 w-full bg-slate-900">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-300 via-brand-500 to-amber-300 shadow-[0_0_18px_rgba(34,211,238,0.75)]"
            animate={{ width: `${((current + 1) / exam.questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_310px]">
        {/* Cột trái: câu hỏi */}
        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-cyan-100/70">
            <span>
              {t('take.question')} {current + 1} {t('take.of')} {exam.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
                {q.type === 'single' ? t('take.singleHint') : t('take.multipleHint')}
              </span>
              <button
                onClick={() => toggleFlag(q.id)}
                title={flagged.has(q.id) ? t('take.unflag') : t('take.flag')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  flagged.has(q.id)
                    ? 'border border-amber-300/60 bg-amber-50 text-amber-700 shadow-[0_0_18px_rgba(251,191,36,0.12)] dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:shadow-[0_0_18px_rgba(251,191,36,0.18)]'
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-cyan-300/20 dark:text-cyan-100/70 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100'
                }`}
              >
                <LuFlag className={`h-3.5 w-3.5 ${flagged.has(q.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                {flagged.has(q.id) ? t('take.flagged') : t('take.flag')}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={effectsEnabled ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={effectsEnabled ? { opacity: 0, x: -20 } : undefined}
              transition={{ duration: effectsEnabled ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
              className="exam-hud-panel rounded-3xl p-5 sm:p-7"
            >
              <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600/70 dark:text-cyan-200/70">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                ExamRush Live Console
              </div>

              <h2 className="text-xl font-semibold leading-relaxed text-slate-950 dark:text-white sm:text-2xl">{q.text}</h2>

              <div className="mt-6 space-y-3">
                {q.options.map((o) => {
                  const selected = (answers[q.id] || []).includes(o.key)
                  return (
                    <button
                      key={o.key}
                      onClick={() => toggle(q, o.key)}
                      className={`exam-choice flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-cyan-300/70 bg-cyan-300/[0.14] shadow-[0_0_28px_rgba(34,211,238,0.2)]'
                          : 'border-slate-200 bg-white/75 hover:border-brand-300 hover:bg-brand-50/60 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-cyan-300/40 dark:hover:bg-cyan-300/10'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 text-sm font-bold transition-colors ${
                          q.type === 'single' ? 'rounded-full' : 'rounded-lg'
                        } ${
                          selected
                            ? 'border-cyan-200 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.5)]'
                            : 'border-slate-300 text-slate-600 dark:border-cyan-200/25 dark:text-cyan-100/75'
                        }`}
                      >
                        {selected ? <LuCheck className="h-5 w-5" /> : o.key}
                      </span>
                      <span className="flex-1 text-[15px] text-slate-800 dark:text-slate-100">{o.text}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-cyan-300/25 dark:bg-white/[0.04] dark:text-cyan-100 dark:hover:bg-cyan-300/10"
            >
              <LuChevronLeft className="h-4 w-4" /> {t('take.prev')}
            </button>

            {current < exam.questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => Math.min(exam.questions.length - 1, c + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-brand-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
              >
                {t('take.next')} <LuChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => doSubmit(false)}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 disabled:opacity-60"
              >
                <LuSend className="h-4 w-4" /> {submitting ? t('take.submitting') : t('take.submit')}
              </button>
            )}
          </div>
        </main>

        {/* Cột phải: danh sách câu hỏi */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="exam-hud-panel rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900 dark:text-white">{t('take.palette')}</span>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-100">
                {answeredCount}/{exam.questions.length}
              </span>
            </div>

            <div className="grid max-h-[50vh] grid-cols-5 gap-2 overflow-y-auto p-1 sm:grid-cols-6 lg:grid-cols-5">
              {exam.questions.map((qq, i) => {
                const done = (answers[qq.id] || []).length > 0
                const isCurrent = i === current
                const isFlagged = flagged.has(qq.id)
                return (
                  <button
                    key={qq.id}
                    onClick={() => setCurrent(i)}
                    className={`relative aspect-square rounded-lg text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-gradient-to-br from-cyan-300 to-brand-500 text-slate-950 ring-2 ring-inset ring-white/70 shadow-[0_0_18px_rgba(34,211,238,0.35)]'
                        : done
                          ? 'border border-emerald-300/30 bg-emerald-400/[0.18] text-emerald-100'
                          : 'border border-slate-200 bg-white/70 text-slate-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-100/[0.65] dark:hover:bg-cyan-300/10'
                    }`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <LuFlag className="absolute right-0.5 top-0.5 h-3 w-3 fill-amber-500 text-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Chú thích + nộp bài nhanh */}
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600 dark:border-cyan-300/15 dark:text-cyan-100/70">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-300/60 shadow-[0_0_10px_rgba(52,211,153,0.45)]" /> {t('take.answered')}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-white/15 bg-white/10" /> {t('take.palette')}
              </div>
              <div className="flex items-center gap-2">
                <LuFlag className="h-3 w-3 fill-amber-500 text-amber-500" /> {t('take.flagged')}
              </div>
            </div>

            <button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              <LuSend className="h-4 w-4" /> {submitting ? t('take.submitting') : t('take.submit')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
