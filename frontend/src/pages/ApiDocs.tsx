import { motion } from 'framer-motion'
import { LuServer, LuLock, LuGlobe, LuExternalLink, LuKeyRound, LuFileText, LuListChecks } from 'react-icons/lu'
import { useI18n } from '../context/I18nContext'
import PageWrapper from '../components/PageWrapper'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = { method: Method; path: string; desc: string; auth: boolean }
type Group = { titleKey: 'apidoc.groupAuth' | 'apidoc.groupExams' | 'apidoc.groupAttempts'; icon: typeof LuKeyRound; endpoints: Endpoint[] }

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const SWAGGER_URL = API_BASE.replace(/\/api\/?$/, '') + '/docs'

const methodStyle: Record<Method, string> = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

const groups: Group[] = [
  {
    titleKey: 'apidoc.groupAuth',
    icon: LuKeyRound,
    endpoints: [
      { method: 'POST', path: '/api/auth/register', desc: 'Register a new account.', auth: false },
      { method: 'POST', path: '/api/auth/login', desc: 'Log in and receive a JWT access token.', auth: false },
      { method: 'GET', path: '/api/auth/me', desc: 'Get the currently authenticated user.', auth: true },
    ],
  },
  {
    titleKey: 'apidoc.groupExams',
    icon: LuFileText,
    endpoints: [
      { method: 'GET', path: '/api/exams', desc: 'List all exams (Redis-cached).', auth: false },
      { method: 'GET', path: '/api/exams/{id}', desc: 'Get an exam for taking (questions without answers).', auth: false },
      { method: 'GET', path: '/api/exams/{id}/full', desc: 'Get an exam with correct answers (owner only).', auth: true },
      { method: 'POST', path: '/api/exams', desc: 'Create a new exam.', auth: true },
      { method: 'PUT', path: '/api/exams/{id}', desc: 'Update an existing exam.', auth: true },
      { method: 'DELETE', path: '/api/exams/{id}', desc: 'Delete an exam.', auth: true },
      { method: 'POST', path: '/api/exams/{id}/submit', desc: 'Submit answers and score the attempt.', auth: true },
    ],
  },
  {
    titleKey: 'apidoc.groupAttempts',
    icon: LuListChecks,
    endpoints: [
      { method: 'GET', path: '/api/attempts', desc: 'List the current user\'s attempt history.', auth: true },
      { method: 'GET', path: '/api/attempts/{id}', desc: 'Get full detail of one attempt.', auth: true },
    ],
  },
]

export default function ApiDocs() {
  const { t } = useI18n()

  return (
    <PageWrapper className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          <LuServer className="h-4 w-4" /> REST API · v1.0.0
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('apidoc.title')}</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t('apidoc.subtitle')}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {API_BASE}
          </code>
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
          >
            <LuExternalLink className="h-4 w-4" /> {t('apidoc.swaggerBtn')}
          </a>
        </div>
      </motion.div>

      {/* Endpoint groups */}
      <div className="mt-10 space-y-8">
        {groups.map((g, gi) => (
          <motion.section
            key={g.titleKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05, duration: 0.3 }}
          >
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <g.icon className="h-5 w-5 text-brand-500" /> {t(g.titleKey)}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {g.endpoints.map((e, i) => (
                <div
                  key={e.method + e.path}
                  className={`flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${
                    i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                  }`}
                >
                  <span className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-1 text-xs font-bold ${methodStyle[e.method]}`}>
                    {e.method}
                  </span>
                  <code className="shrink-0 font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{e.path}</code>
                  <span className="flex-1 text-sm text-slate-500 dark:text-slate-400">{e.desc}</span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      e.auth
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {e.auth ? <LuLock className="h-3 w-3" /> : <LuGlobe className="h-3 w-3" />}
                    {e.auth ? t('apidoc.authRequired') : t('apidoc.public')}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </PageWrapper>
  )
}
