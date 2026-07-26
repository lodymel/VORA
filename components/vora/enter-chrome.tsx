'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  DEFAULT_SKY_THEME,
  type SkyThemeId,
} from './light-card-theme'
import { useCoarsePointer } from './pointer-env'
import { PRIVACY_LEDE, PRIVACY_UPDATED, PrivacyChapters } from './privacy-content'
import { TERMS_LEDE, TERMS_UPDATED, TermsChapters } from './terms-content'

const ease = [0.22, 1, 0.36, 1] as const
/** Snappy sheet ease — cubic-bezier that stays on the GPU path */
const sheetEase = [0.32, 0.72, 0, 1] as const
const sheetEasePhone = [0.22, 1, 0.36, 1] as const

export type EnterSheetId = 'made' | 'privacy' | 'terms' | 'status'

const STATUS_LINES = [
  { label: 'Sky', value: 'Clear' },
  { label: 'Constellation', value: 'Quiet' },
  { label: 'Lights', value: 'Ready' },
  { label: 'Sound', value: 'Waiting' },
]

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
  // Fixed px lift — percentage y + mid-flight layout changes caused Android snaps.
  const lift = useMemo(() => {
    if (typeof window === 'undefined') return 900
    return Math.max(640, Math.round(window.innerHeight))
  }, [])

  const slide = reduceMotion
    ? { type: 'tween' as const, duration: 0.2, ease }
    : coarse
      ? { type: 'tween' as const, duration: 0.42, ease: sheetEasePhone }
      : { type: 'tween' as const, duration: 0.5, ease: sheetEase }
  const scrim = reduceMotion
    ? { type: 'tween' as const, duration: 0.16, ease }
    : { type: 'tween' as const, duration: coarse ? 0.32 : 0.38, ease }

  return (
    <motion.div
      className={`vora-enter-panel${coarse ? ' vora-enter-panel--lite' : ''}`}
      data-sky-theme={skyTheme}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vora-enter-panel-title"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      <motion.button
        type="button"
        className="vora-enter-panel-scrim"
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={scrim}
      />

      <motion.div
        className="vora-enter-panel-dock"
        initial={reduceMotion ? { opacity: 0 } : { y: lift }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { y: lift }}
        transition={slide}
        style={{ willChange: 'transform' }}
      >
        <aside className="vora-enter-panel-sheet">
          <div className="vora-enter-panel-wash" aria-hidden="true" />
          {!coarse ? (
            <>
              <div className="vora-enter-panel-glow" aria-hidden="true" />
              <div className="vora-enter-panel-dust" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="vora-enter-panel-grain" aria-hidden="true" />
            </>
          ) : null}
          <div className="vora-enter-panel-edge" aria-hidden="true" />

          <div className="vora-enter-panel-top">
            <motion.button
              type="button"
              className="vora-enter-panel-close"
              onClick={onClose}
              aria-label="Close"
              whileTap={{ opacity: 0.55 }}
              transition={{ duration: 0.16 }}
            >
              <span aria-hidden="true">×</span>
            </motion.button>
          </div>

          <div className="vora-enter-panel-content">
            {sheet === 'privacy' ? (
              <div className="vora-enter-panel-policy">
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  Privacy
                </p>
                <h2 className="vora-enter-panel-headline">Privacy Policy</h2>
                <p className="vora-enter-panel-copy">{PRIVACY_LEDE}</p>
                <p className="vora-enter-panel-updated">{PRIVACY_UPDATED}</p>
                <div className="vora-enter-panel-chapters">
                  <PrivacyChapters whisperClassName="vora-enter-panel-whisper" />
                </div>
              </div>
            ) : null}

            {sheet === 'terms' ? (
              <div className="vora-enter-panel-policy">
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  Terms
                </p>
                <h2 className="vora-enter-panel-headline">Terms of Use</h2>
                <p className="vora-enter-panel-copy">{TERMS_LEDE}</p>
                <p className="vora-enter-panel-updated">{TERMS_UPDATED}</p>
                <div className="vora-enter-panel-chapters">
                  <TermsChapters whisperClassName="vora-enter-panel-whisper" />
                </div>
              </div>
            ) : null}

            {sheet === 'status' ? (
              <>
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  Status
                </p>
                <h2 className="vora-enter-panel-headline">Sky is clear.</h2>
                <ul className="vora-enter-status-list">
                  {STATUS_LINES.map((line) => (
                    <li key={line.label} className="vora-enter-status-row">
                      <span className="vora-enter-status-dot" aria-hidden="true" />
                      <span className="vora-enter-status-label">{line.label}</span>
                      <span className="vora-enter-status-value">{line.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {sheet === 'made' ? (
              <>
                <p id="vora-enter-panel-title" className="vora-enter-panel-kicker">
                  Who made this?
                </p>
                <h2 className="vora-enter-panel-headline">
                  <span className="vora-enter-panel-brand">VORA</span>
                  <span className="vora-enter-panel-by"> by LODY STUDIO.</span>
                </h2>
                <p className="vora-enter-panel-copy vora-enter-panel-copy--verse">
                  Look at yourself.
                  {'\n'}
                  Your words become stars.
                </p>
                {onBeginAgain ? (
                  <motion.button
                    type="button"
                    className="vora-enter-panel-begin"
                    onClick={() => {
                      onClose()
                      onBeginAgain()
                    }}
                    whileTap={{ opacity: 0.7 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span className="vora-enter-panel-begin-star" aria-hidden="true" />
                    Once more.
                  </motion.button>
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
  sheet,
  skyTheme,
  onClose,
  onBeginAgain,
}: {
  sheet: EnterSheetId | null
  skyTheme: SkyThemeId
  onClose: () => void
  onBeginAgain?: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {sheet ? (
        <EnterSheetPanel
          key="vora-meta-sheet"
          sheet={sheet}
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
  const [sheet, setSheet] = useState<EnterSheetId | null>(null)

  useEffect(() => {
    if (!sheet) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSheet(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

  useEffect(() => {
    function onCloseSheets() {
      setSheet(null)
    }
    window.addEventListener('vora:close-sheets', onCloseSheets)
    return () => window.removeEventListener('vora:close-sheets', onCloseSheets)
  }, [])

  function openSheet(id: EnterSheetId) {
    setSheet((prev) => (prev === id ? null : id))
  }

  return { sheet, setSheet, openSheet }
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
  const { sheet, setSheet, openSheet } = useEnterSheet()

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
            label="Privacy"
            active={sheet === 'privacy'}
            onClick={() => openSheet('privacy')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label="Terms"
            active={sheet === 'terms'}
            onClick={() => openSheet('terms')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label="Who made this?"
            active={sheet === 'made'}
            onClick={() => openSheet('made')}
          />
          <span className="vora-enter-meta-dot" aria-hidden="true">
            ·
          </span>
          <MetaLink
            label="Status"
            active={sheet === 'status'}
            onClick={() => openSheet('status')}
          />
        </div>
      </motion.div>

      <SheetPortal
        sheet={sheet}
        skyTheme={skyTheme}
        onClose={() => setSheet(null)}
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
  const { sheet, setSheet, openSheet } = useEnterSheet()

  return (
    <>
      <div className={`vora-app-meta-bar vora-app-meta-bar--${tone}`}>
        <MetaLink
          label="Privacy"
          tone={tone}
          active={sheet === 'privacy'}
          onClick={() => openSheet('privacy')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label="Terms"
          tone={tone}
          active={sheet === 'terms'}
          onClick={() => openSheet('terms')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label="Who made this?"
          tone={tone}
          active={sheet === 'made'}
          onClick={() => openSheet('made')}
        />
        <span className="vora-enter-meta-dot" aria-hidden="true">
          ·
        </span>
        <MetaLink
          label="Status"
          tone={tone}
          active={sheet === 'status'}
          onClick={() => openSheet('status')}
        />
      </div>
      <SheetPortal
        sheet={sheet}
        skyTheme={skyTheme}
        onClose={() => setSheet(null)}
        onBeginAgain={onBeginAgain}
      />
    </>
  )
}
