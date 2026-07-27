'use client'

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import { copy, type VoraLocale } from './locale'

type LocaleContextValue = {
  locale: VoraLocale
  setLocale: (next: VoraLocale) => void
  t: ReturnType<typeof copy>
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function VoraLocaleProvider({
  locale,
  setLocale,
  children,
}: {
  locale: VoraLocale
  setLocale: (next: VoraLocale) => void
  children: ReactNode
}) {
  const t = copy(locale)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.lang = locale === 'ko' ? 'ko' : 'en'
    root.classList.toggle('vora-lang-ko', locale === 'ko')
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useVoraLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    // Safe fallback for isolated previews — app always wraps a provider.
    return {
      locale: 'en' as VoraLocale,
      setLocale: () => {},
      t: copy('en'),
    }
  }
  return ctx
}
