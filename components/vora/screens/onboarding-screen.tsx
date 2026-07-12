'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SkyAtmosphere } from '../sky-atmosphere'
import { VoraOStar, VoraWordmark } from '../logo'
import { VORA_SLOGAN, VORA_TAGLINE, VORA_WHISPER } from '../brand'
import { EnterChrome } from '../enter-chrome'
import { DEFAULT_SKY_THEME, type SkyThemeId } from '../light-card-theme'
import { voraAudio } from '../vora-audio'

const ease = [0.22, 1, 0.36, 1] as const
const springy = [0.34, 1.35, 0.64, 1] as const

type Phase = 'gate' | 'whisper' | 'descend'

/** Cinematic Enter your Sky — sound opt-in, then descend into the app. */
export function OnboardingScreen({
  onDone,
  skyTheme = DEFAULT_SKY_THEME,
}: {
  onDone: () => void
  skyTheme?: SkyThemeId
}) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('gate')

  async function enterWithSound() {
    await voraAudio.enable()
    beginDescend()
  }

  function enterQuietly() {
    void voraAudio.disable()
    beginDescend()
  }

  function beginDescend() {
    setPhase('whisper')
    window.setTimeout(() => setPhase('descend'), reduceMotion ? 400 : 1200)
    window.setTimeout(onDone, reduceMotion ? 900 : 2800)
  }

  return (
    <div className="vora-enter-page relative flex h-full w-full flex-col overflow-hidden">
      <SkyAtmosphere
        className="absolute inset-0"
        depth={phase === 'descend' ? 'deep' : 'gate'}
        intensify={phase === 'descend'}
      />

      <EnterChrome visible={phase === 'gate'} skyTheme={skyTheme} />

      <AnimatePresence mode="wait">
        {phase === 'gate' ? (
          <motion.div
            key="gate"
            className="relative z-10 flex h-full w-full flex-col px-7 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.25rem))] pt-[max(4.5rem,calc(var(--vora-header-inset-top)+1.75rem))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                className="vora-enter-gate-star"
                initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.05, ease: springy, delay: 0.05 }}
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : { rotate: [0, 8, -6, 0], scale: [1, 1.08, 0.98, 1] }
                  }
                  transition={{ duration: 4.2, ease: 'easeInOut', repeat: Infinity }}
                >
                  <VoraOStar size={30} />
                </motion.div>
              </motion.div>

              <motion.div
                className="vora-enter-mark-stage"
                initial={{ opacity: 0, y: 18, scale: 0.88, rotate: -4 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ duration: 1.15, ease: springy, delay: 0.18 }}
              >
                <motion.div
                  className="vora-enter-mark-chroma"
                  aria-hidden="true"
                  initial={{ opacity: 0.55, x: -4 }}
                  animate={{ opacity: 0, x: 0 }}
                  transition={{ duration: 1, ease, delay: 0.35 }}
                >
                  <VoraWordmark size="lg" tone="night" />
                </motion.div>
                <motion.div
                  className="vora-enter-mark-chroma vora-enter-mark-chroma--b"
                  aria-hidden="true"
                  initial={{ opacity: 0.45, x: 4 }}
                  animate={{ opacity: 0, x: 0 }}
                  transition={{ duration: 1, ease, delay: 0.35 }}
                >
                  <VoraWordmark size="lg" tone="night" />
                </motion.div>
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, -4, 0], rotate: [0, 0.8, 0] }
                  }
                  transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                >
                  <VoraWordmark size="lg" tone="night" />
                </motion.div>
              </motion.div>

              <motion.p
                className="vora-enter-headline"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.45 }}
              >
                {VORA_SLOGAN}
              </motion.p>

              <motion.p
                className="vora-enter-tagline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease, delay: 0.65 }}
              >
                {VORA_TAGLINE}
              </motion.p>
            </div>

            <motion.div
              className="vora-enter-actions flex w-full shrink-0 flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.75 }}
            >
              <button type="button" onClick={() => void enterWithSound()} className="vora-enter-cta">
                Enter your Sky
              </button>
              <p className="vora-enter-sound-hint">Best with sound</p>
              <button type="button" onClick={enterQuietly} className="vora-enter-quiet">
                Enter quietly
              </button>
            </motion.div>
          </motion.div>
        ) : null}

        {phase === 'whisper' || phase === 'descend' ? (
          <motion.div
            key="whisper"
            className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === 'descend' ? 0 : 1,
              y: phase === 'descend' ? -24 : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.35 : 1.15, ease }}
          >
            <motion.div
              className="vora-enter-whisper-star"
              initial={{ opacity: 0, scale: 0.8, rotateY: 0 }}
              animate={
                phase === 'descend'
                  ? { opacity: 0, scale: 2.4, rotateY: 360, filter: 'blur(8px)' }
                  : { opacity: 1, scale: 1, rotateY: 0 }
              }
              transition={{ duration: reduceMotion ? 0.4 : 1.2, ease }}
            >
              <VoraOStar size={32} />
            </motion.div>
            <p className="vora-enter-whisper mt-8 text-balance">{VORA_WHISPER}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {phase === 'descend' ? (
        <motion.div
          className="vora-enter-veil pointer-events-none absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.4 : 1.25, ease }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
