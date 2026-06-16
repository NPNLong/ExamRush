import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from '../i18n/translations'

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('examrush-lang') as Lang) || 'vi'
  })

  useEffect(() => {
    localStorage.setItem('examrush-lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (key: TranslationKey, vars?: Record<string, string | number>) => {
    let str: string = translations[lang][key] || translations.vi[key] || key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return str
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang: () => setLang(lang === 'vi' ? 'en' : 'vi'), t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
