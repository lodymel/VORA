'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SkyAtmosphere } from '../sky-atmosphere'
import { VoraOStar, VoraWordmark } from '../logo'
import { VORA_SLOGAN, VORA_TAGLINE } from '../brand'
import { EnterChrome } from '../enter-chrome'
import { DEFAULT_SKY_THEME, type SkyThemeId } from '../light-card-theme'
import { voraAudio } from '../vora-audio'

/** Soft editorial ease — arrives late, never snaps. */
const soft = [0.25, 0.1, 0.25, 1] as const

type Beat = 'void' | 'star' | 'name' | 'invite' | 'crossing'

/**
 * Enter ritual — A light finds its name.
 * The star is born inside the O. Letters gather around it.
 * No travel, no jump — only dissolve in place.
 */
export function EnterRitualScreen({
  onDone,
  skyTheme = DEFAULT_SKY_THEME,
}: {
  onDone: () => void
  skyTheme?: SkyThemeId
}) {
  const reduceMotion = useReducedMotion()
  const [beat, setBeat] = useState<Beat>('void')
  const timers = useRef<number[]>([])
  const doneRef = useRef(false)

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  useEffect(() => {
    voraAudio.hydrate()
    doneRef.current = false
    clearTimers()

    if (reduceMotion) {
      setBeat('invite')
      return () => clearTimers()
    }

    setBeat('void')
    later(1000, () => setBeat('star'))
    later(2900, () => setBeat('name'))
    later(4800, () => setBeat('invite'))

    return () => clearTimers()
  }, [reduceMotion])

  async function enterWithSound() {
    await voraAudio.enable()
    beginCrossing()
  }

  function beginCrossing() {
    clearTimers()
    setBeat('crossing')
    later(reduceMotion ? 420 : 1500, finish)
  }

  const showStar = beat === 'star' || beat === 'name'
  const starFading = beat === 'name'
  const showMark =
    beat === 'name' || beat === 'invite' || beat === 'crossing'
  const inviting = beat === 'invite'
  const crossing = beat === 'crossing'
  const chromeVisible = beat === 'invite'
  /** Frame stays from star onward so the O seat never moves. */
  const showFrame = beat !== 'void'

  return (
    <div className="vora-enter-page vora-enter-ritual relative flex h-full w-full flex-col overflow-hidden">
      <SkyAtmosphere
        className="absolute inset-0"
        depth={crossing ? 'deep' : 'gate'}
        intensify={crossing}
      />

      <EnterChrome visible={chromeVisible} skyTheme={skyTheme} />

      <div className="relative z-10 flex h-full w-full flex-col px-7 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.25rem))] pt-[max(3.5rem,calc(var(--vora-header-inset-top)+1.25rem))]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="vora-enter-ritual-stage" aria-live="polite">
            {showFrame ? (
              <div className="vora-enter-ritual-frame">
                {/* Invisible wordmark holds the exact O seat from first star. */}
                <span className="vora-enter-ritual-frame-measure" aria-hidden="true">
                  <VoraWordmark size="lg" tone="night" />
                </span>

                <motion.div
                  className="vora-enter-ritual-mark"
                  initial={false}
                  animate={{
                    opacity: showMark ? (crossing ? 0 : 1) : 0,
                  }}
                  transition={{
                    duration: crossing
                      ? reduceMotion
                        ? 0.35
                        : 1.35
                      : reduceMotion
                        ? 0.2
                        : 1.85,
                    ease: soft,
                  }}
                >
                  <VoraWordmark size="lg" tone="night" />
                </motion.div>

                <AnimatePresence>
                  {showStar ? (
                    <motion.div
                      key="o-star"
                      className="vora-enter-ritual-star"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: starFading ? 0 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0.2 : starFading ? 1.65 : 1.7,
                        ease: soft,
                      }}
                    >
                      <span className="vora-enter-ritual-star-breath">
                        <VoraOStar size={17} />
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
          </div>

          {showFrame ? (
            <motion.div
              className="vora-enter-ritual-address"
              initial={false}
              animate={{
                opacity: inviting ? 1 : 0,
              }}
              transition={{
                duration: reduceMotion ? 0.2 : 1.55,
                ease: soft,
              }}
              aria-hidden={!inviting}
            >
              <p className="vora-enter-headline">{VORA_SLOGAN}</p>
              <p className="vora-enter-tagline">{VORA_TAGLINE}</p>
            </motion.div>
          ) : null}
        </div>

        {showFrame ? (
          <motion.div
            className="vora-enter-actions flex w-full shrink-0 flex-col items-center"
            initial={false}
            animate={{
              opacity: inviting ? 1 : 0,
            }}
            transition={{
              duration: reduceMotion ? 0.2 : 1.45,
              ease: soft,
              delay: inviting && !reduceMotion ? 0.55 : 0,
            }}
            style={{ pointerEvents: inviting ? 'auto' : 'none' }}
            aria-hidden={!inviting}
          >
            <div className="vora-enter-cta-row">
              <span className="vora-enter-cta-orbit vora-enter-cta-orbit--left" aria-hidden="true">
                <i className="vora-enter-cta-mark vora-enter-cta-mark--dot" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--spark" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--diamond" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--star" />
              </span>
              <button
                type="button"
                onClick={() => void enterWithSound()}
                className="vora-enter-cta"
                tabIndex={inviting ? 0 : -1}
              >
                Enter your Sky
              </button>
              <span className="vora-enter-cta-orbit vora-enter-cta-orbit--right" aria-hidden="true">
                <i className="vora-enter-cta-mark vora-enter-cta-mark--star" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--diamond" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--spark" />
                <i className="vora-enter-cta-mark vora-enter-cta-mark--dot" />
              </span>
            </div>
            <p className="vora-enter-sound-hint">Best with sound</p>
          </motion.div>
        ) : null}
      </div>

      <AnimatePresence>
        {crossing ? (
          <motion.div
            key="veil"
            className="vora-enter-ritual-veil pointer-events-none absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.3 : 1.25, ease: soft }}
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
