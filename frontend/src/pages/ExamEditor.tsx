import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuPlus,
  LuTrash2,
  LuCloudUpload,
  LuDownload,
  LuSave,
  LuCheck,
  LuCircleAlert,
  LuImage,
  LuClock,
  LuX,
} from 'react-icons/lu'
import { examsApi } from '../lib/api'
import { useI18n } from '../context/I18nContext'
import PageWrapper, { Spinner } from '../components/PageWrapper'
import Pagination from '../components/Pagination'
import type { ExamPayload, Option, QuestionInput, QuestionType } from '../lib/types'

const QUESTIONS_PER_PAGE = 5

interface EditQuestion {
  type: QuestionType
  text: string
  options: Option[]
  correct: string[]
  explanation: string
}

const LETTERS = 'ABCDEFGHIJ'.split('')

function emptyQuestion(): EditQuestion {
  return {
    type: 'single',
    text: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
    ],
    correct: [],
    explanation: '',
  }
}

export default function ExamEditor() {
  const { id } = useParams()
  const examId = id ? Number(id) : null
  const isEdit = examId !== null
  const { t } = useI18n()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [timeLimitMin, setTimeLimitMin] = useState('')
  const [questions, setQuestions] = useState<EditQuestion[]>([emptyQuestion()])
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const pageCount = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE))
  const pageStart = (page - 1) * QUESTIONS_PER_PAGE

  // Giữ trang hợp lệ khi số câu thay đổi (vd: sau khi xóa câu cuối trang)
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  useEffect(() => {
    if (!isEdit) return
    examsApi
      .getFull(examId!)
      .then((exam) => {
        setTitle(exam.title)
        setDescription(exam.description || '')
        setImageUrl(exam.image_url || '')
        setTimeLimitMin(exam.time_limit_seconds ? String(Math.round(exam.time_limit_seconds / 60)) : '')
        setQuestions(
          exam.questions.map((q) => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation || '',
          })),
        )
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [examId, isEdit])

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ─── Question mutations ──────────────────────────────────────────────
  const updateQ = (i: number, patch: Partial<EditQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const setType = (i: number, type: QuestionType) =>
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== i) return q
        // Khi chuyển sang single, chỉ giữ 1 đáp án đúng
        const correct = type === 'single' ? q.correct.slice(0, 1) : q.correct
        return { ...q, type, correct }
      }),
    )

  const toggleCorrect = (i: number, key: string) =>
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== i) return q
        if (q.type === 'single') return { ...q, correct: [key] }
        const has = q.correct.includes(key)
        return { ...q, correct: has ? q.correct.filter((k) => k !== key) : [...q.correct, key] }
      }),
    )

  const updateOption = (qi: number, oi: number, text: string) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, text } : o)) }
          : q,
      ),
    )

  const addOption = (qi: number) =>
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q
        if (q.options.length >= LETTERS.length) return q
        return { ...q, options: [...q.options, { key: LETTERS[q.options.length], text: '' }] }
      }),
    )

  const removeOption = (qi: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q
        if (q.options.length <= 2) return q
        const removedKey = q.options[oi].key
        // re-key remaining options A,B,C...
        const options = q.options
          .filter((_, j) => j !== oi)
          .map((o, j) => ({ key: LETTERS[j], text: o.text }))
        const oldKeys = q.options.filter((_, j) => j !== oi).map((o) => o.key)
        const remap = new Map(oldKeys.map((k, j) => [k, LETTERS[j]]))
        const correct = q.correct
          .filter((k) => k !== removedKey)
          .map((k) => remap.get(k)!)
          .filter(Boolean)
        return { ...q, options, correct }
      }),
    )

  const addQuestion = () => {
    setQuestions((qs) => [...qs, emptyQuestion()])
    // nhảy tới trang chứa câu vừa thêm
    setPage(Math.ceil((questions.length + 1) / QUESTIONS_PER_PAGE))
  }
  const removeQuestion = (i: number) =>
    setQuestions((qs) => (qs.length <= 1 ? qs : qs.filter((_, idx) => idx !== i)))

  // ─── JSON import ─────────────────────────────────────────────────────
  const handleImport = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      if (data.title && !title) setTitle(data.title)
      if (data.description && !description) setDescription(data.description)
      if (data.image_url && !imageUrl) setImageUrl(data.image_url)
      if (data.time_limit_seconds && !timeLimitMin)
        setTimeLimitMin(String(Math.round(data.time_limit_seconds / 60)))

      const raw = Array.isArray(data) ? data : data.questions
      if (!Array.isArray(raw)) throw new Error('no questions')

      const imported: EditQuestion[] = raw.map((q: any) => {
        const type: QuestionType = q.type === 'multiple' ? 'multiple' : 'single'
        const options: Option[] = (q.options || []).map((o: any, j: number) =>
          typeof o === 'string'
            ? { key: LETTERS[j], text: o }
            : { key: o.key || LETTERS[j], text: o.text ?? '' },
        )
        return {
          type,
          text: q.text || '',
          options: options.length >= 2 ? options : [...options, { key: 'B', text: '' }],
          correct: Array.isArray(q.correct) ? q.correct : q.correct != null ? [String(q.correct)] : [],
          explanation: q.explanation || '',
        }
      })
      if (imported.length === 0) throw new Error('empty')
      setQuestions(imported)
      setPage(1)
      flash(t('create.importOk', { n: imported.length }))
      setError('')
    } catch {
      setError(t('create.importErr'))
    }
  }

  // ─── Save ────────────────────────────────────────────────────────────
  const validate = (): string => {
    if (!title.trim()) return t('create.needTitle')
    if (questions.length === 0) return t('create.needQuestion')
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) return `${t('create.questionN', { n: i + 1 })}: ${t('create.questionText')}`
      const filled = q.options.filter((o) => o.text.trim())
      if (filled.length < 2) return `${t('create.questionN', { n: i + 1 })}: ${t('create.addOption')}`
      if (q.correct.length === 0) return `${t('create.questionN', { n: i + 1 })}: ${t('create.markCorrect')}`
    }
    return ''
  }

  const save = async () => {
    const v = validate()
    if (v) {
      setError(v)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setSaving(true)

    const payloadQuestions: QuestionInput[] = questions.map((q, idx) => {
      // chỉ giữ option có nội dung, re-key
      const opts = q.options
        .filter((o) => o.text.trim())
        .map((o, j) => ({ key: LETTERS[j], text: o.text.trim() }))
      const keyMap = new Map(
        q.options.filter((o) => o.text.trim()).map((o, j) => [o.key, LETTERS[j]]),
      )
      const correct = q.correct.map((k) => keyMap.get(k)).filter(Boolean) as string[]
      return {
        type: q.type,
        text: q.text.trim(),
        options: opts,
        correct,
        explanation: q.explanation.trim() || null,
        order_index: idx,
      }
    })

    const payload: ExamPayload = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      time_limit_seconds: timeLimitMin ? Math.round(Number(timeLimitMin) * 60) : null,
      questions: payloadQuestions,
    }

    try {
      if (isEdit) await examsApi.update(examId!, payload)
      else await examsApi.create(payload)
      flash(t('create.saved'))
      setTimeout(() => navigate('/practice'), 700)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="py-32" />

  return (
    <PageWrapper className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{isEdit ? t('create.titleEdit') : t('create.titleNew')}</h1>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <LuCircleAlert className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Exam meta */}
      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t('create.examTitle')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('create.examTitlePh')}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t('create.desc')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('create.descPh')}
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <LuImage className="h-4 w-4" /> {t('create.image')}
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('create.imagePh')}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <LuClock className="h-4 w-4" /> {t('create.timeLimit')}
            </label>
            <input
              type="number"
              min={0}
              value={timeLimitMin}
              onChange={(e) => setTimeLimitMin(e.target.value)}
              placeholder={t('create.timeLimitPh')}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Import / sample */}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImport(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300"
          >
            <LuCloudUpload className="h-4 w-4" /> {t('create.importJson')}
          </button>
          <a
            href="/sample-questions.json"
            download="sample-questions.json"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LuDownload className="h-4 w-4" /> {t('create.downloadSample')}
          </a>
        </div>
      </div>

      {/* Questions */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {t('create.questions')} <span className="text-brand-500">({questions.length})</span>
        </h2>
      </div>

      <div className="mt-4 space-y-5">
        <AnimatePresence initial={false}>
          {questions.slice(pageStart, pageStart + QUESTIONS_PER_PAGE).map((q, li) => {
            const qi = pageStart + li
            return (
            <motion.div
              key={qi}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-7 items-center rounded-lg bg-brand-100 px-3 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {t('create.questionN', { n: qi + 1 })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
                    {(['single', 'multiple'] as QuestionType[]).map((tp) => (
                      <button
                        key={tp}
                        onClick={() => setType(qi, tp)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          q.type === tp
                            ? 'bg-brand-500 text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tp === 'single' ? t('create.typeSingle') : t('create.typeMultiple')}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => removeQuestion(qi)}
                    disabled={questions.length <= 1}
                    className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950"
                    title={t('create.removeQuestion')}
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={q.text}
                onChange={(e) => updateQ(qi, { text: e.target.value })}
                placeholder={t('create.questionTextPh')}
                rows={2}
                className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
              />

              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('create.markCorrect')} ·{' '}
                {q.type === 'single' ? t('take.singleHint') : t('take.multipleHint')}
              </p>

              <div className="mt-2 space-y-2">
                {q.options.map((o, oi) => {
                  const isCorrect = q.correct.includes(o.key)
                  return (
                    <div key={o.key} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCorrect(qi, o.key)}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 text-slate-500 hover:border-brand-400 dark:border-slate-600'
                        }`}
                        title={t('create.markCorrect')}
                      >
                        {isCorrect ? <LuCheck className="h-4 w-4" /> : o.key}
                      </button>
                      <input
                        value={o.text}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`${t('create.option')} ${o.key}`}
                        className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <button
                        onClick={() => removeOption(qi, oi)}
                        disabled={q.options.length <= 2}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500 disabled:opacity-30 dark:hover:bg-slate-800"
                      >
                        <LuX className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {q.options.length < LETTERS.length && (
                <button
                  onClick={() => addOption(qi)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  <LuPlus className="h-4 w-4" /> {t('create.addOption')}
                </button>
              )}

              <input
                value={q.explanation}
                onChange={(e) => updateQ(qi, { explanation: e.target.value })}
                placeholder={t('create.explanationPh')}
                className="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700"
              />
            </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Phân trang câu hỏi */}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-6" />

      <button
        onClick={addQuestion}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
      >
        <LuPlus className="h-5 w-5" /> {t('create.addQuestion')}
      </button>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          <LuSave className="h-4 w-4" /> {saving ? t('create.saving') : t('create.save')}
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
