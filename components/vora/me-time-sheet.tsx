'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  REMINDER_MINUTE_STEP,
  REMINDER_PRESETS,
  clampHour,
  clampMinute,
  formatReminderClock,
} from './light-reminder'
import { DEFAULT_SKY_THEME, type SkyThemeId } from './light-card-theme'
import styles from './me-time-sheet.module.css'

const soft = [0.25, 0.1, 0.25, 1] as const
const ITEM_H = 44

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 / REMINDER_MINUTE_STEP }, (_, i) => i * REMINDER_MINUTE_STEP)

type Props = {
  open: boolean
  title?: string
  initialHour: number
  initialMinute: number
  skyTheme?: SkyThemeId
  onCancel: () => void
  onSave: (hour: number, minute: number) => void
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/**
 * Quiet scroll column — no OS dropdown chrome.
 * Snap to center; pearl focus band.
 */
function TimeColumn({
  label,
  values,
  value,
  onChange,
  open,
}: {
  label: string
  values: number[]
  value: number
  onChange: (next: number) => void
  open: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef(false)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!open) return
    const el = scrollerRef.current
    if (!el) return
    const index = Math.max(0, values.indexOf(value))
    lockRef.current = true
    el.scrollTop = index * ITEM_H
    window.requestAnimationFrame(() => {
      lockRef.current = false
    })
  }, [open, value, values])

  function commitFromScroll() {
    const el = scrollerRef.current
    if (!el || lockRef.current) return
    const index = Math.round(el.scrollTop / ITEM_H)
    const clamped = Math.min(values.length - 1, Math.max(0, index))
    const next = values[clamped] ?? value
    const target = clamped * ITEM_H
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTo({ top: target, behavior: 'smooth' })
    }
    if (next !== value) onChange(next)
  }

  function onScroll() {
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = window.requestAnimationFrame(() => {
      // Live update while dragging so the hero clock stays in sync
      const el = scrollerRef.current
      if (!el || lockRef.current) return
      const index = Math.round(el.scrollTop / ITEM_H)
      const clamped = Math.min(values.length - 1, Math.max(0, index))
      const next = values[clamped] ?? value
      if (next !== value) onChange(next)
    })
  }

  return (
    <div className={styles.wheel}>
      <span className={styles.wheelLabel}>{label}</span>
      <div className={styles.columnShell}>
        <div className={styles.columnFocus} aria-hidden="true" />
        <div
          ref={scrollerRef}
          className={styles.column}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          onScroll={onScroll}
          onScrollEnd={commitFromScroll}
          onKeyDown={(event) => {
            const index = values.indexOf(value)
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
              event.preventDefault()
              const prev = values[Math.max(0, index - 1)]
              if (prev != null) onChange(prev)
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
              event.preventDefault()
              const next = values[Math.min(values.length - 1, index + 1)]
              if (next != null) onChange(next)
            }
          }}
          onPointerUp={commitFromScroll}
          onTouchEnd={commitFromScroll}
        >
          <div className={styles.columnPad} aria-hidden="true" />
          {values.map((n) => {
            const active = n === value
            return (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={active}
                className={`${styles.item}${active ? ` ${styles.itemOn}` : ''}`}
                onClick={() => onChange(n)}
              >
                {pad2(n)}
              </button>
            )
          })}
          <div className={styles.columnPad} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

/**
 * VORA time sheet — pearl mist, Instrument clock, branded wheels.
 * Quiet craft + clear one-job UI: no OS dropdown.
 */
export function MeTimeSheet({
  open,
  title = 'Time',
  initialHour,
  initialMinute,
  skyTheme = DEFAULT_SKY_THEME,
  onCancel,
  onSave,
}: Props) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [hour, setHour] = useState(clampHour(initialHour))
  const [minute, setMinute] = useState(clampMinute(initialMinute))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    setHour(clampHour(initialHour))
    setMinute(clampMinute(initialMinute))
  }, [open, initialHour, initialMinute])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={styles.root}
          data-sky-theme={skyTheme}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: soft }}
        >
          <button type="button" className={styles.backdrop} aria-label="Close" onClick={onCancel} />

          <motion.div
            className={styles.panel}
            initial={reduceMotion ? false : { y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 16, opacity: 0 }}
            transition={{ duration: 0.38, ease: soft }}
          >
            <p id={titleId} className={styles.kicker}>
              {title}
            </p>
            <p className={styles.clock} aria-live="polite">
              {formatReminderClock(hour, minute)}
            </p>

            <div className={styles.wheels} role="group" aria-label="Choose time">
              <TimeColumn
                label="Hour"
                values={HOURS}
                value={hour}
                open={open}
                onChange={(n) => setHour(clampHour(n))}
              />
              <span className={styles.colon} aria-hidden="true">
                :
              </span>
              <TimeColumn
                label="Min"
                values={MINUTES}
                value={minute}
                open={open}
                onChange={(n) => setMinute(clampMinute(n))}
              />
            </div>

            <div className={styles.presets} role="group" aria-label="Suggestions">
              {REMINDER_PRESETS.map((preset) => {
                const active = hour === preset.hour && minute === preset.minute
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.preset}${active ? ` ${styles.presetOn}` : ''}`}
                    aria-pressed={active}
                    onClick={() => {
                      setHour(preset.hour)
                      setMinute(preset.minute)
                    }}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.ghost} onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.done}
                onClick={() => onSave(hour, minute)}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
