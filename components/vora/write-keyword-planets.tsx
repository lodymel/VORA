'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import type { LightCategoryId } from './constants'
import { hasKnownMoodRail, markMoodRailKnown } from './mood-rail-hint'

export type WritePlanetId = LightCategoryId

export type WritePlanet = {
  id: WritePlanetId
  /** Quiet mood word — what the user is opening. */
  label: string
}

export const WRITE_PLANETS: WritePlanet[] = [
  { id: 'success', label: 'Success' },
  { id: 'love', label: 'Love' },
  { id: 'dream', label: 'Dream' },
  { id: 'fun', label: 'Fun' },
  { id: 'health', label: 'Health' },
]

const WRITE_EASE = [0.22, 1, 0.36, 1] as const

/** Same liquid settle as bottom tab — milky slide between moods. */
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 32,
  mass: 0.85,
}

/**
 * Mood rail — words only, quiet craft.
 * Tap → a Light from that category softens into the diary.
 * Underline glides like the tab bar liquid.
 */
export function WriteKeywordPlanets({
  visible,
  disabled = false,
  activeId = null,
  onPick,
}: {
  visible: boolean
  disabled?: boolean
  activeId?: WritePlanetId | null
  onPick: (planet: WritePlanet) => void
}) {
  const [whisper, setWhisper] = useState(false)

  useEffect(() => {
    if (!visible) return
    setWhisper(!hasKnownMoodRail())
  }, [visible])

  function handlePick(planet: WritePlanet) {
    if (!hasKnownMoodRail()) {
      markMoodRailKnown()
      setWhisper(false)
    }
    onPick(planet)
  }

  const kicker = activeId ? 'Tap again for another' : 'Tap for a Light'

  return (
    <motion.div
      className="vora-write-planets-slot"
      initial={false}
      animate={visible ? 'open' : 'closed'}
      variants={{
        open: {
          height: 'auto',
          opacity: 1,
          marginBottom: 28,
          transition: { duration: 0.62, ease: WRITE_EASE },
        },
        closed: {
          height: 0,
          opacity: 0,
          marginBottom: 0,
          transition: { duration: 0.5, ease: WRITE_EASE },
        },
      }}
      style={{ overflow: 'hidden', pointerEvents: visible ? 'auto' : 'none' }}
      aria-hidden={!visible}
    >
      <div className="vora-write-planets">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={kicker}
            className="vora-write-planets-kicker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: WRITE_EASE }}
          >
            {kicker}
          </motion.p>
        </AnimatePresence>

        <LayoutGroup id="vora-mood-rail">
          <div
            className={`vora-write-planets-rail${whisper ? ' vora-write-planets-rail--whisper' : ''}`}
            role="group"
            aria-label="Tap a feeling to receive a Light"
          >
            {WRITE_PLANETS.map((planet) => {
              const active = activeId === planet.id
              return (
                <button
                  key={planet.id}
                  type="button"
                  className={`vora-write-planet vora-write-planet--${planet.id}${
                    active ? ' vora-write-planet--active' : ''
                  }`}
                  disabled={disabled || !visible}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => handlePick(planet)}
                  aria-label={
                    active
                      ? `Another ${planet.label} Light`
                      : `A Light from ${planet.label}`
                  }
                  aria-pressed={active}
                >
                  <span className="vora-write-planet-label">{planet.label}</span>
                  {active ? (
                    <motion.span
                      layoutId="vora-mood-underline"
                      className="vora-write-planet-underline"
                      transition={liquidSpring}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <AnimatePresence initial={false}>
          {whisper && visible ? (
            <motion.p
              key="mood-whisper"
              className="vora-write-planets-whisper"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.45, ease: WRITE_EASE, delay: 0.15 }}
            >
              A soft sentence, ready for you
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
