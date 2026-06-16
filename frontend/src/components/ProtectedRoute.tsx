import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
