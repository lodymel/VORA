'use client'

import { motion, useReducedMotion } from 'motion/react'
import { MirrorAtmosphere } from '../mirror-atmosphere'
import { VORA_SLOGAN, VORA_TAGLINE } from '../brand'
import type { Light } from '../constants'
import type { SkyThemeId } from '../light-card-theme'
import { SkyThemePicker } from '../sky-theme-picker'
import { OpeningAgain } from '../opening-again'

const soft = [0.25, 0.1, 0.25, 1] as const

function presenceLine(days: number) {
  if (days <= 1) return 'Day 1 with you.'
  return `Day ${days} with you.`
}

/** Me — poem, sky themes, VORA+. */
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

          {/* Reminders: hidden until Capacitor Local Notifications. */}

          <motion.section className="vora-me-group" aria-labelledby="vora-me-sky-h" {...fade(0.04)}>
            <h2 id="vora-me-sky-h" className="vora-me-group-label">
              Your sky
            </h2>
            <div className="vora-me-inset">
              <SkyThemePicker value={skyTheme} onChange={onSkyThemeChange} />
            </div>
          </motion.section>

          <motion.section className="vora-me-group" aria-labelledby="vora-me-plus-h" {...fade(0.08)}>
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
                <div className="vora-me-row">
                  <span className="vora-me-row-label">Subscribe</span>
                  <span className="vora-me-row-value vora-me-row-value--locked">Coming soon</span>
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
