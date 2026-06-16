import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuUser, LuLock, LuSmile, LuCircleAlert } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import PageWrapper from '../components/PageWrapper'
import { Field } from './Login'

export default function Register() {
  const { register } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username: username.trim(),
        password,
        display_name: displayName.trim() || undefined,
      })
      navigate('/practice', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="bg-aurora min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-brand-500/10 dark:border-slate-800 dark:bg-slate-900"
        >
          <h1 className="text-center text-2xl font-bold">{t('auth.registerTitle')}</h1>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <LuCircleAlert className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field icon={<LuUser />} placeholder={t('auth.username')} value={username} onChange={setUsername} autoFocus />
            <Field icon={<LuSmile />} placeholder={t('auth.displayName')} value={displayName} onChange={setDisplayName} />
            <Field icon={<LuLock />} placeholder={t('auth.password')} value={password} onChange={setPassword} type="password" />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? '…' : t('auth.registerBtn')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {t('auth.loginBtn')}
            </Link>
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
