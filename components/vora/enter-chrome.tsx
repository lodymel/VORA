'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  DEFAULT_SKY_THEME,
  type SkyThemeId,
} from './light-card-theme'
import { useCoarsePointer } from './pointer-env'
import { privacyLede, privacyUpdated, PrivacyChapters } from './privacy-content'
import { termsLede, termsUpdated, TermsChapters } from './terms-content'
import { voraAudio } from './vora-audio'
import { useVoraLocale } from './vora-locale'

const ease = [0.22, 1, 0.36, 1] as const
/** iOS-sheet dismiss — decisive, no bounce */
const sheetEase = [0.32, 0.72, 0, 1] as const

export type EnterSheetId = 'made' | 'privacy' | 'terms' | 'status'

const STATUS_LINES = {
  en: [
    { label: 'Sky', value: 'Clear' },
    { label: 'Constellation', value: 'Quiet' },
    { label: 'Lights', value: 'Ready' },
  ],
  ko: [
    { label: '하늘', value: '맑음' },
    { label: '별자리', value: '고요함' },
    { label: '빛', value: '준비됨' },
  ],
} as const

function statusLines(locale: 'en' | 'ko') {
  const soundPlaying = voraAudio.isPlaying()
  return [
    ...STATUS_LINES[locale],
    locale === 'ko'
      ? { label: '소리', value: soundPlaying ? '재생 중' : '기다리는 중' }
      : { label: 'Sound', value: soundPlaying ? 'Playing' : 'Waiting' },
  ]
}

function MetaLink({
  label,
  active,
  tone = 'night',
  onClick,
}: {
  label: string
  active?: boolean
  tone?: 'night' | 'day'
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      className={`vora-enter-meta-link vora-enter-meta-link--${tone}${
        active ? ' vora-enter-meta-link--active' : ''
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.18 }}
    >
      {label}
    </motion.button>
  )
}

function EnterSheetPanel({
  sheet,
  skyTheme,
  onClose,
  onBeginAgain,
}: {
  sheet: EnterSheetId
  skyTheme: SkyThemeId
  onClose: () => void
  onBeginAgain?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const coarse = useCoarsePointer()
  const { locale, t } = useVoraLocale()
  // Freeze content for this mount — never swap copy mid-dismiss.
  const lockedSheet = useRef(sheet).current
  const lift = useMemo(() => {
    if (typeof window === 'undefined') return 900
    return Math.max(720, Math.round(window.innerHeight + 48))
  }, [])
  const slide = reduceMotion
    ? { type: 'tween' as const, duration: 0.18, ease }
    : {
        type: 'tween' as const,
        duration: coarse ? 0.34 : 0.4,
        ease: sheetEase,
      }
  const scrimFade = reduceMotion
    ? { type: 'tween' as const, duration: 0.14, ease }
    : { type: 'tween' as const, duration: coarse ? 0.26 : 0.32, ease }

  return (
    <motion.div
      className={`vora-enter-panel${coarse ? ' vora-enter-panel--lite' : ''}`}
      data-sky-theme={skyTheme}
      data-vora-sheet="opaque-slide-v2"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vora-enter-panel-title"
      // Presence host only — stay fully opaque so ink never ghosts through.
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={slide}
    >
      {/* Scrim fades alone — never the sheet ink */}
      <motion.button
        type="button"
        className="vora-enter-panel-scrim"
        aria-label={t.close}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={scrimFade}
      />

      {/* Sheet: transform only. Opacity on dismiss = text ghosting. */}
      <motion.div
        className="vora-enter-panel-dock"
        initial={reduceMotion ? false : { y: lift }}
        animate={{ y: 0 }}
        exit={reduceMotion ? undefined : { y: lift }}
        transition={slide}
        style={{ willChange: 'transform' }}
      >
        <aside className="vora-enter-panel-sheet">
          <div className="vora-enter-panel-wash" aria-hidden="true" />
          <div className="vora-enter-panel-glow" aria-hidden="true" />
          <div className="vora-enter-panel-dust" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="vora-enter-panel-grain" aria-hidden="true" />
          <div className="vora-enter-panel-edge" aria-hidden="true" />

          <div className="vora-enter-panel-top">
            <button
              type="button"
              className="vora-enter-panel-close"
              onClick={onClose}
              aria-label={t.close}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="vora-enter-panel-content">
            {lockedSheet === 'privacy' ? (
              <div className="vora-enter-panel-policy">
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  {t.privacy}
                </p>
                <h2 className="vora-enter-panel-headline">{t.privacyPolicy}</h2>
                <p className="vora-enter-panel-copy">{privacyLede(locale)}</p>
                <p className="vora-enter-panel-updated">{privacyUpdated(locale)}</p>
                <div className="vora-enter-panel-chapters">
                  <PrivacyChapters locale={locale} whisperClassName="vora-enter-panel-whisper" />
                </div>
              </div>
            ) : null}

            {lockedSheet === 'terms' ? (
              <div className="vora-enter-panel-policy">
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  {t.terms}
                </p>
                <h2 className="vora-enter-panel-headline">{t.termsOfUse}</h2>
                <p className="vora-enter-panel-copy">{termsLede(locale)}</p>
                <p className="vora-enter-panel-updated">{termsUpdated(locale)}</p>
                <div className="vora-enter-panel-chapters">
                  <TermsChapters locale={locale} whisperClassName="vora-enter-panel-whisper" />
                </div>
              </div>
            ) : null}

            {lockedSheet === 'status' ? (
              <>
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  {t.status}
                </p>
                <h2 className="vora-enter-panel-headline">{t.skyClear}</h2>
                <ul className="vora-enter-status-list">
                  {statusLines(locale).map((line) => (
                    <li key={line.label} className="vora-enter-status-row">
                      <span className="vora-enter-status-dot" aria-hidden="true" />
                      <span className="vora-enter-status-label">{line.label}</span>
                      <span className="vora-enter-status-value">{line.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {lockedSheet === 'made' ? (
              <>
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  {t.whoMade}
                </p>
                <h2 className="vora-enter-panel-headline vora-enter-panel-headline--brand" lang="en">
                  <span className="vora-enter-panel-brand">VORA</span>
                  <span className="vora-enter-panel-by"> by LODY STUDIO.</span>
                </h2>
                <p className="vora-enter-panel-copy vora-enter-panel-copy--verse">
                  {t.slogan}
                  {'\n'}
                  {t.tagline}
                </p>
                {onBeginAgain ? (
                  <button
                    type="button"
                    className="vora-enter-panel-begin"
                    onClick={() => {
                      onClose()
                      onBeginAgain()
                    }}
                  >
                    <span className="vora-enter-panel-begin-star" aria-hidden="true" />
                    {t.onceMore}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </aside>
      </motion.div>
    </motion.div>
  )
}

function SheetPortal({
  open,
  sheet,
  skyTheme,
  onClose,
  onExitComplete,
  onBeginAgain,
}: {
  open: boolean
  sheet: EnterSheetId | null
  skyTheme: SkyThemeId
  onClose: () => void
  onExitComplete: () => void
  onBeginAgain?: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const frozen = useRef<EnterSheetId | null>(sheet)
  if (sheet) frozen.current = sheet

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    const appRoot = document.querySelector<HTMLElement>('.vora-app-root')
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true

    const focusFrame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.vora-enter-panel-close')?.focus()
    })

    function keepFocusInside(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const panel = document.querySelector<HTMLElement>('.vora-enter-panel')
      if (!panel) return
      const focusable = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')].filter(
        (node) => {
          const rect = node.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0
        },
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', keepFocusInside)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', keepFocusInside)
      document.body.style.overflow = prev
      if (appRoot) appRoot.inert = false
      previouslyFocused?.focus()
    }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      {open && frozen.current ? (
        <EnterSheetPanel
          key={frozen.current}
          sheet={frozen.current}
          skyTheme={skyTheme}
          onClose={onClose}
          onBeginAgain={onBeginAgain}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function useEnterSheet() {
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState<EnterSheetId | null>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    function onCloseSheets() {
      setOpen(false)
    }
    window.addEventListener('vora:close-sheets', onCloseSheets)
    return () => window.removeEventListener('vora:close-sheets', onCloseSheets)
  }, [])

  function openSheet(id: EnterSheetId) {
    if (open && sheet === id) {
      setOpen(false)
      return
    }
    setSheet(id)
    setOpen(true)
  }

  function closeSheet() {
    setOpen(false)
  }

  function clearSheet() {
    if (!open) setSheet(null)
  }

  return { open, sheet, openSheet, closeSheet, clearSheet }
}

/** Gate chrome. Same bottom meta as the main app. */
export function EnterChrome({
  visible = true,
  skyTheme = DEFAULT_SKY_THEME,
}: {
  visible?: boolean
  skyTheme?: SkyThemeId
}) {
  const reduceMotion = useReducedMotion()
  const { open, sheet, openSheet, closeSheet, clearSheet } = useEnterSheet()
  const { t } = useVoraLocale()

  if (!visible) return null

  return (
    <>
      <motion.div
        className="vora-enter-chrome vora-enter-chrome--bottom"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
      >
        <div className="vora-enter-chrome-meta">
          <MetaLink
            label={t.privacy}
            active={sheet === 'privacy'}
            onClick={() => openSheet('privacy')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label={t.terms}
            active={sheet === 'terms'}
            onClick={() => openSheet('terms')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label={t.whoMade}
            active={sheet === 'made'}
            onClick={() => openSheet('made')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label={t.status}
            active={sheet === 'status'}
            onClick={() => openSheet('status')}
          />
        </div>
      </motion.div>

      <SheetPortal
        open={open}
        sheet={sheet}
        skyTheme={skyTheme}
        onClose={closeSheet}
        onExitComplete={clearSheet}
      />
    </>
  )
}

/** Sits under the bottom nav. Privacy / Terms / Who made this? / Status. */
export function AppMetaBar({
  tone = 'night',
  skyTheme = DEFAULT_SKY_THEME,
  onBeginAgain,
}: {
  tone?: 'night' | 'day'
  skyTheme?: SkyThemeId
  onBeginAgain?: () => void
}) {
  const { open, sheet, openSheet, closeSheet, clearSheet } = useEnterSheet()
  const { t } = useVoraLocale()

  return (
    <>
      <div className={`vora-app-meta-bar vora-app-meta-bar--${tone}`}>
        <MetaLink
          label={t.privacy}
          tone={tone}
          active={sheet === 'privacy'}
          onClick={() => openSheet('privacy')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label={t.terms}
          tone={tone}
          active={sheet === 'terms'}
          onClick={() => openSheet('terms')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label={t.whoMade}
          tone={tone}
          active={sheet === 'made'}
          onClick={() => openSheet('made')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label={t.status}
          tone={tone}
          active={sheet === 'status'}
          onClick={() => openSheet('status')}
        />
      </div>
      <SheetPortal
        open={open}
        sheet={sheet}
        skyTheme={skyTheme}
        onClose={closeSheet}
        onExitComplete={clearSheet}
        onBeginAgain={onBeginAgain}
      />
    </>
  )
}
