'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SkyAtmosphere } from '../sky-atmosphere'
import { VoraOStar, VoraWordmark } from '../logo'
import { VORA_SLOGAN } from '../brand'
import { EnterChrome } from '../enter-chrome'
import { DEFAULT_SKY_THEME, type SkyThemeId } from '../light-card-theme'
import { voraAudio } from '../vora-audio'

const ease = [0.22, 1, 0.36, 1] as const
const springy = [0.34, 1.4, 0.64, 1] as const

type Beat = 'signal' | 'ignite' | 'mark' | 'slogan'

/** Ritual loader — signal → O-star play → wordmark bloom → slogan. */
export function SplashScreen({
  onDone,
  skyTheme = DEFAULT_SKY_THEME,
}: {
  onDone: () => void
  skyTheme?: SkyThemeId
}) {
  const reduceMotion = useReducedMotion()
  const [beat, setBeat] = useState<Beat>('signal')

  useEffect(() => {
    voraAudio.hydrate()
    if (reduceMotion) {
      const t = window.setTimeout(onDone, 700)
      return () => window.clearTimeout(t)
    }

    const timers = [
      window.setTimeout(() => setBeat('ignite'), 650),
      window.setTimeout(() => setBeat('mark'), 1500),
      window.setTimeout(() => setBeat('slogan'), 2300),
      window.setTimeout(onDone, 3400),
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [onDone, reduceMotion])

  return (
    <div className="vora-enter-page relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8">
      <SkyAtmosphere className="absolute inset-0" depth="gate" />
      <EnterChrome visible={beat === 'mark' || beat === 'slogan'} skyTheme={skyTheme} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {beat === 'signal' ? (
            <motion.p
              key="signal"
              className="vora-enter-signal"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, times: [0, 0.2, 0.75, 1], ease }}
            >
              (( opening sky ))
            </motion.p>
          ) : null}

          {beat === 'ignite' ? (
            <motion.div
              key="ignite"
              className="vora-enter-loader"
              initial={{ opacity: 0, scale: 0.45 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.55, filter: 'blur(8px)', rotate: 18 }}
              transition={{ duration: 0.55, ease }}
            >
              <div className="vora-enter-star-stage">
                <motion.span
                  className="vora-enter-star-orbit"
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, ease: 'linear' }}
                />
                <motion.div
                  animate={{
                    rotate: [0, -20, 200, 360],
                    scale: [0.85, 1.2, 0.95, 1],
                  }}
                  transition={{ duration: 0.95, ease: [0.45, 0.05, 0.25, 1] }}
                >
                  <VoraOStar size={40} />
                </motion.div>
              </div>
              <p className="vora-enter-loader-label">Opening your Sky</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {(beat === 'mark' || beat === 'slogan') && (
          <motion.div
            key="mark"
            className="vora-enter-mark-stage flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.72, rotate: -6, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
            transition={{ duration: reduceMotion ? 0.35 : 0.95, ease: springy }}
          >
            <motion.div
              className="vora-enter-mark-chroma"
              aria-hidden="true"
              initial={{ opacity: 0.7, x: -3 }}
              animate={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.85, ease, delay: 0.1 }}
            >
              <VoraWordmark size="lg" tone="night" />
            </motion.div>
            <motion.div
              className="vora-enter-mark-chroma vora-enter-mark-chroma--b"
              aria-hidden="true"
              initial={{ opacity: 0.55, x: 3 }}
              animate={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.85, ease, delay: 0.1 }}
            >
              <VoraWordmark size="lg" tone="night" />
            </motion.div>
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -3, 0], rotate: [0, 0.6, 0] }
              }
              transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity }}
            >
              <VoraWordmark size="lg" tone="night" />
            </motion.div>
            <motion.p
              className="vora-enter-slogan"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: beat === 'slogan' ? 1 : 0, y: beat === 'slogan' ? 0 : 6 }}
              transition={{ duration: 0.85, ease }}
            >
              {VORA_SLOGAN}
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
