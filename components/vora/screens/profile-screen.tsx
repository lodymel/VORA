'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { MirrorAtmosphere } from '../mirror-atmosphere'
import type { Light } from '../constants'
import type { SkyThemeId } from '../light-card-theme'
import { SkyThemePicker } from '../sky-theme-picker'
import { OpeningAgain } from '../opening-again'
import { useVoraLocale } from '../vora-locale'
import type { VoraLocale } from '../locale'

const soft = [0.25, 0.1, 0.25, 1] as const

/** Me — poem, language, sky themes, VORA+. */
export function ProfileScreen({
  days,
  isSubscribed,
  skyTheme,
  onSkyThemeChange,
  onReturnToGate,
}: {
  days: number
  lights: Light[]
  todaysLight: string
  isSubscribed: boolean
  skyTheme: SkyThemeId
  onSkyThemeChange: (value: SkyThemeId) => void
  onReturnToGate?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const { locale, setLocale, t } = useVoraLocale()

  function fade(delay: number) {
    return {
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: reduceMotion ? 0.15 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: soft,
      },
    }
  }

  function pickLocale(next: VoraLocale) {
    if (next === locale) return
    setLocale(next)
  }

  function LangCheck({ on }: { on: boolean }) {
    return (
      <span className="vora-me-check-slot" aria-hidden="true">
        {on ? <Check className="vora-me-check" size={16} strokeWidth={1.75} /> : null}
      </span>
    )
  }

  return (
    <div
      className={`vora-me-page relative z-0 h-full w-full overflow-y-auto overflow-x-hidden${
        locale === 'ko' ? ' vora-lang-ko' : ''
      }`}
    >
      <div className="vora-me-scroll relative min-h-full">
        <MirrorAtmosphere className="absolute inset-0" variant="morning" />

        <div className="vora-me-inner relative z-10">
          <motion.header className="vora-me-header" {...fade(0)}>
            <h1 className="vora-me-identity">{t.slogan}</h1>
            <p className="vora-me-identity-sub">{t.tagline}</p>
            <p className="vora-me-presence">{t.dayWithYou(days)}</p>
          </motion.header>

          {/* Reminders: hidden until Capacitor Local Notifications. */}

          <motion.section className="vora-me-group" aria-labelledby="vora-me-lang-h" {...fade(0.02)}>
            <h2 id="vora-me-lang-h" className="vora-me-group-label">
              {t.language}
            </h2>
            <div className="vora-me-inset">
              <button
                type="button"
                className="vora-me-row vora-me-row--button"
                aria-pressed={locale === 'en'}
                onClick={() => pickLocale('en')}
              >
                <span className="vora-me-row-label">{t.languageEn}</span>
                <LangCheck on={locale === 'en'} />
              </button>
              <button
                type="button"
                className="vora-me-row vora-me-row--button"
                aria-pressed={locale === 'ko'}
                onClick={() => pickLocale('ko')}
              >
                <span className="vora-me-row-label">{t.languageKo}</span>
                <LangCheck on={locale === 'ko'} />
              </button>
            </div>
          </motion.section>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-sky-h" {...fade(0.04)}>
            <h2 id="vora-me-sky-h" className="vora-me-group-label">
              {t.yourSky}
            </h2>
            <div className="vora-me-inset">
              <SkyThemePicker value={skyTheme} onChange={onSkyThemeChange} />
            </div>
          </motion.section>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-plus-h" {...fade(0.08)}>
            <h2 id="vora-me-plus-h" className="vora-me-group-label">
              {t.voraPlus}
            </h2>
            <div className="vora-me-inset">
              {isSubscribed ? (
                <div className="vora-me-row">
                  <span className="vora-me-row-label">{t.subscription}</span>
                  <span className="vora-me-row-value vora-me-row-value--active">{t.active}</span>
                </div>
              ) : (
                <div className="vora-me-row">
                  <span className="vora-me-row-label">{t.subscribe}</span>
                  <span className="vora-me-row-value vora-me-row-value--locked">{t.comingSoon}</span>
                </div>
              )}
            </div>
          </motion.section>

          {onReturnToGate ? (
            <motion.footer className="vora-me-opening" {...fade(0.14)}>
              <OpeningAgain onBeginAgain={onReturnToGate} />
            </motion.footer>
          ) : null}
        </div>
      </div>
    </div>
  )
}
