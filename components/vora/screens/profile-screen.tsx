'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Minus } from 'lucide-react'
import { MirrorAtmosphere } from '../mirror-atmosphere'
import { VORA_SLOGAN, VORA_TAGLINE } from '../brand'
import type { Light } from '../constants'
import {
  MAX_REMINDER_TIMES,
  addReminderTime,
  formatReminderClock,
  removeReminderTime,
  updateReminderTime,
  type LightReminder,
  type ReminderTime,
} from '../light-reminder'
import { MeTimeSheet } from '../me-time-sheet'
import {
  getReminderCapability,
  requestReminderPermission,
} from '../web-reminder'
import type { SkyThemeId } from '../light-card-theme'
import { SkyThemePicker } from '../sky-theme-picker'
import styles from './me-reminder.module.css'

const soft = [0.25, 0.1, 0.25, 1] as const

function presenceLine(days: number) {
  if (days <= 1) return 'Day 1 with you.'
  return `Day ${days} with you.`
}

type SheetState =
  | { mode: 'closed' }
  | { mode: 'edit'; time: ReminderTime }
  | { mode: 'add'; hour: number; minute: number }

/** Me — poem, sky, multi-time reminders, VORA+. */
export function ProfileScreen({
  days,
  lightReminder,
  onLightReminderChange,
  isSubscribed,
  onSubscribe,
  skyTheme,
  onSkyThemeChange,
  onReturnToGate,
}: {
  days: number
  lights: Light[]
  todaysLight: string
  lightReminder: LightReminder
  onLightReminderChange: (value: LightReminder) => void
  isSubscribed: boolean
  onSubscribe: () => void
  skyTheme: SkyThemeId
  onSkyThemeChange: (value: SkyThemeId) => void
  onReturnToGate?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [capabilityNote, setCapabilityNote] = useState('')
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })

  useEffect(() => {
    setCapabilityNote(getReminderCapability().limitNote)
  }, [])

  const times = useMemo(() => lightReminder.times, [lightReminder.times])
  const canAdd = times.length < MAX_REMINDER_TIMES

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

  async function setEnabled(enabled: boolean) {
    onLightReminderChange({ ...lightReminder, enabled })
    if (enabled) {
      await requestReminderPermission()
      setCapabilityNote(getReminderCapability().limitNote)
    }
  }

  function openAdd() {
    if (!canAdd) return
    const last = times[times.length - 1]
    setSheet({
      mode: 'add',
      hour: last ? (last.hour + 1) % 24 : 6,
      minute: last ? last.minute : 0,
    })
  }

  function onSheetSave(hour: number, minute: number) {
    if (sheet.mode === 'edit') {
      onLightReminderChange(updateReminderTime(lightReminder, sheet.time.id, hour, minute))
    } else if (sheet.mode === 'add') {
      onLightReminderChange(addReminderTime(lightReminder, hour, minute))
    }
    setSheet({ mode: 'closed' })
  }

  return (
    <div className="vora-me-page relative z-0 h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="vora-me-scroll relative min-h-full">
        <MirrorAtmosphere className="absolute inset-0" variant="morning" />

        <div className="vora-me-inner relative z-10">
          <motion.header className="vora-me-header" {...fade(0)}>
            <h1 className="vora-me-identity">{VORA_SLOGAN}</h1>
            <p className="vora-me-identity-sub">{VORA_TAGLINE}</p>
            <p className="vora-me-presence">{presenceLine(days)}</p>
          </motion.header>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-when-h" {...fade(0.04)}>
            <h2 id="vora-me-when-h" className="vora-me-group-label">
              When
            </h2>
            <div className="vora-me-inset">
              <div className="vora-me-row">
                <span className="vora-me-row-label" id="vora-me-remind-label">
                  Remind me
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lightReminder.enabled}
                  aria-labelledby="vora-me-remind-label"
                  className={`${styles.switch}${lightReminder.enabled ? ` ${styles.switchOn}` : ''}`}
                  onClick={() => void setEnabled(!lightReminder.enabled)}
                >
                  <span className={styles.knob} aria-hidden="true" />
                </button>
              </div>

              {lightReminder.enabled ? (
                <>
                  {times.map((time) => (
                    <div key={time.id}>
                      <div className="vora-me-sep" aria-hidden="true" />
                      <div className="vora-me-row">
                        <button
                          type="button"
                          className={styles.timeBtn}
                          onClick={() => setSheet({ mode: 'edit', time })}
                          aria-label={`Edit ${formatReminderClock(time.hour, time.minute)}`}
                        >
                          <span className={styles.timeClock}>
                            {formatReminderClock(time.hour, time.minute)}
                          </span>
                          <span className={styles.timeHint}>Every day</span>
                        </button>
                        {times.length > 1 ? (
                          <button
                            type="button"
                            className={styles.remove}
                            aria-label={`Remove ${formatReminderClock(time.hour, time.minute)}`}
                            onClick={() =>
                              onLightReminderChange(removeReminderTime(lightReminder, time.id))
                            }
                          >
                            <Minus size={16} strokeWidth={2} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  <div className="vora-me-sep" aria-hidden="true" />
                  <button
                    type="button"
                    className={styles.add}
                    onClick={openAdd}
                    disabled={!canAdd}
                  >
                    {canAdd ? 'Add a time' : 'Up to five times'}
                  </button>
                </>
              ) : null}
            </div>
            {capabilityNote ? <p className={styles.note}>{capabilityNote}</p> : null}
          </motion.section>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-sky-h" {...fade(0.08)}>
            <h2 id="vora-me-sky-h" className="vora-me-group-label">
              Your sky
            </h2>
            <div className="vora-me-inset">
              <SkyThemePicker value={skyTheme} onChange={onSkyThemeChange} />
            </div>
          </motion.section>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-plus-h" {...fade(0.12)}>
            <h2 id="vora-me-plus-h" className="vora-me-group-label">
              VORA+
            </h2>
            <div className="vora-me-inset">
              {isSubscribed ? (
                <div className="vora-me-row">
                  <span className="vora-me-row-label">Subscription</span>
                  <span className="vora-me-row-value vora-me-row-value--active">Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="vora-me-row vora-me-row--button"
                  onClick={onSubscribe}
                >
                  <span className="vora-me-row-label">Subscribe</span>
                  <span className="vora-me-row-value">Home &amp; Lock</span>
                </button>
              )}
            </div>
          </motion.section>

          {onReturnToGate ? (
            <motion.footer className="vora-me-footer" {...fade(0.16)}>
              <button type="button" className="vora-me-footer-link" onClick={onReturnToGate}>
                Once more.
              </button>
            </motion.footer>
          ) : null}
        </div>
      </div>

      <MeTimeSheet
        open={sheet.mode !== 'closed'}
        title={sheet.mode === 'add' ? 'Add a time' : 'Time'}
        skyTheme={skyTheme}
        initialHour={
          sheet.mode === 'edit' ? sheet.time.hour : sheet.mode === 'add' ? sheet.hour : 6
        }
        initialMinute={
          sheet.mode === 'edit' ? sheet.time.minute : sheet.mode === 'add' ? sheet.minute : 0
        }
        onCancel={() => setSheet({ mode: 'closed' })}
        onSave={onSheetSave}
      />
    </div>
  )
}
