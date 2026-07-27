'use client'

import { useEffect, useState } from 'react'
import { LegalDoc } from './legal-doc'
import { normalizeLocale, type VoraLocale } from './locale'
import { privacyLede, privacyUpdated, PrivacyChapters } from './privacy-content'
import { termsLede, termsUpdated, TermsChapters } from './terms-content'

const STORAGE_KEY = 'vora-app-v2'

function preferredLocale(): VoraLocale {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { locale?: unknown }
    if (saved.locale === 'ko' || saved.locale === 'en') return normalizeLocale(saved.locale)
  } catch {
    // Fall through to the browser language when saved state is unavailable.
  }
  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function LegalPublicPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const [locale, setLocale] = useState<VoraLocale>('en')

  useEffect(() => {
    setLocale(preferredLocale())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [locale])

  const privacy = kind === 'privacy'

  return (
    <LegalDoc
      locale={locale}
      kicker={
        privacy ? (locale === 'ko' ? '개인정보' : 'Privacy') : locale === 'ko' ? '약관' : 'Terms'
      }
      title={
        privacy
          ? locale === 'ko'
            ? '개인정보 처리방침'
            : 'Privacy Policy'
          : locale === 'ko'
            ? '이용약관'
            : 'Terms of Use'
      }
      lede={privacy ? privacyLede(locale) : termsLede(locale)}
      updated={privacy ? privacyUpdated(locale) : termsUpdated(locale)}
    >
      {privacy ? <PrivacyChapters locale={locale} /> : <TermsChapters locale={locale} />}
    </LegalDoc>
  )
}
