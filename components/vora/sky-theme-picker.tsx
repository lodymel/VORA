'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { SkyAtmosphere } from './sky-atmosphere'
import { VORA_SLOGAN, VORA_TAGLINE } from './brand'
import { SKY_THEMES, type SkyThemeId } from './light-card-theme'

const soft = [0.25, 0.1, 0.25, 1] as const

function themeLabel(id: SkyThemeId) {
  return SKY_THEMES.find((theme) => theme.id === id)?.label ?? 'Default'
}

function ThemeThumb({
  themeId,
  active = false,
  className = '',
}: {
  themeId: SkyThemeId
  active?: boolean
  className?: string
}) {
  return (
    <span
      className={`vora-sky-theme-thumb ${active ? 'vora-sky-theme-thumb--active' : ''} ${className}`.trim()}
      data-sky-theme={themeId}
      aria-hidden="true"
    >
      <span className="vora-sky-theme-thumb-wash" />
      {themeId === 'aurora' ? <span className="vora-sky-theme-thumb-aurora" /> : null}
    </span>
  )
}

/**
 * Theme studio flow: settings row → immersive full-sky preview → thumbnail strip → Done.
 */
export function SkyThemePicker({
  value,
  onChange,
}: {
  value: SkyThemeId
  onChange: (theme: SkyThemeId) => void
}) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setDraft(value)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeStudio()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function closeStudio() {
    setOpen(false)
  }

  function applyAndClose() {
    onChange(draft)
    setOpen(false)
  }

  const studio = mounted
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              key="vora-sky-theme-studio"
              className="vora-sky-theme-studio"
              data-sky-theme={draft}
              role="dialog"
              aria-modal="true"
              aria-labelledby="vora-sky-theme-studio-title"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.35, ease: soft }}
            >
              <SkyAtmosphere key={draft} className="absolute inset-0" depth="sky" />

              <button
                type="button"
                className="vora-sky-theme-studio-close"
                aria-label="Close"
                onClick={closeStudio}
              >
                <X size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>

              <div className="vora-sky-theme-studio-stage">
                <p className="vora-sky-theme-studio-kicker">Theme</p>
                <h2 id="vora-sky-theme-studio-title" className="vora-sky-theme-studio-title">
                  {themeLabel(draft)}
                </h2>
                <p className="vora-sky-theme-studio-sample">{VORA_SLOGAN}</p>
                <p className="vora-sky-theme-studio-sample-accent">{VORA_TAGLINE}</p>
              </div>

              <motion.div
                className="vora-sky-theme-studio-dock"
                initial={reduceMotion ? false : { y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08, ease: soft }}
              >
                <div
                  className="vora-sky-theme-studio-rail"
                  role="radiogroup"
                  aria-label="Night sky themes"
                >
                  {SKY_THEMES.map((theme) => {
                    const active = draft === theme.id
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={theme.label}
                        onClick={() => {
                        setDraft(theme.id)
                        onChange(theme.id)
                      }}
                        className={`vora-sky-theme-studio-option ${
                          active ? 'vora-sky-theme-studio-option--active' : ''
                        }`}
                      >
                        <ThemeThumb themeId={theme.id} active={active} />
                        <span className="vora-sky-theme-studio-option-name">{theme.label}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  className="vora-sky-theme-studio-done"
                  onClick={applyAndClose}
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )
    : null

  return (
    <>
      <button
        type="button"
        className="vora-me-row vora-me-row--button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="vora-me-row-label">Theme</span>
        <span className="vora-me-theme-current">
          <ThemeThumb themeId={value} className="vora-sky-theme-thumb--row" />
          <span className="vora-me-row-value">{themeLabel(value)}</span>
        </span>
      </button>
      {studio}
    </>
  )
}
