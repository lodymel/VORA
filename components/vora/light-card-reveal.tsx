'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { LightCard } from './light-card'
import { VoraOStar } from './logo'
import {
  captureLightCardPng,
  saveLightCardImage,
  shareOrSaveLightCard,
} from './export-light-card'
import {
  DEFAULT_LIGHT_CARD_THEME,
  type CardOrigin,
  type LightCardThemeId,
} from './light-card-theme'
import { voraAudio } from './vora-audio'
import type { Light } from './constants'
import { useVoraLocale } from './vora-locale'

const ease = [0.22, 1, 0.36, 1] as const
const easePull = [0.33, 1, 0.28, 1] as const
/** Quiet dissolve — single tween, no keyframe thrash */
const easeClose = [0.22, 1, 0.36, 1] as const

/** Open: pull → reveal. Close: soft scale + home + fade. */
const PULL_S = 0.42
const SPIN_S = 0.65
const CLOSE_S = 0.48

type Phase = 'transforming' | 'ready' | 'closing'

/**
 * Light card overlay — portaled to body (escape app-shell overflow).
 * Animation starts only after mount so opacity never sticks at 0.
 */
export function LightCardReveal({
  light,
  origin,
  theme = DEFAULT_LIGHT_CARD_THEME,
  onClose,
  onCloseStart,
}: {
  light: Light
  origin: CardOrigin
  theme?: LightCardThemeId
  onClose: () => void
  /** Sky content returns underneath as the card begins to dissolve */
  onCloseStart?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const { t } = useVoraLocale()
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<Phase>('transforming')
  const [showFace, setShowFace] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<'progress' | 'success' | 'error'>('progress')
  const cardRef = useRef<HTMLElement>(null)
  const captureCacheRef = useRef<Blob | null>(null)
  const statusClearRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const closingRef = useRef(false)

  const overlayControls = useAnimationControls()
  const travelControls = useAnimationControls()
  const seedControls = useAnimationControls()
  const spinControls = useAnimationControls()

  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : origin.x
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : origin.y
  const dx = origin.x - centerX
  const dy = origin.y - centerY

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    document.body.dataset.voraCardOpen = 'true'
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      delete document.body.dataset.voraCardOpen
      document.body.style.overflow = prevOverflow
    }
  }, [])

  const releaseChrome = useCallback(() => {
    delete document.body.dataset.voraCardOpen
  }, [])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setShowFace(true)
    setPhase('ready')
  }, [])

  useEffect(() => {
    return () => {
      if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    }
  }, [])

  // Warm the PNG while the card is open — Save/Share should feel immediate.
  useEffect(() => {
    if (phase !== 'ready' || !showFace) return
    const el = cardRef.current
    if (!el) return
    let cancelled = false
    captureCacheRef.current = null
    void captureLightCardPng(el)
      .then((blob) => {
        if (!cancelled) captureCacheRef.current = blob
      })
      .catch(() => {
        /* capture on demand if prefetch fails */
      })
    return () => {
      cancelled = true
    }
  }, [phase, showFace, light.id, theme])

  async function getCaptureBlob() {
    if (captureCacheRef.current) return captureCacheRef.current
    if (!cardRef.current) throw new Error('Card not ready')
    const blob = await captureLightCardPng(cardRef.current)
    captureCacheRef.current = blob
    return blob
  }

  const skipToReady = useCallback(() => {
    if (closingRef.current) return
    travelControls.stop()
    seedControls.stop()
    spinControls.stop()
    travelControls.set({ x: 0, y: 0 })
    seedControls.set({ opacity: 0, scale: 1 })
    spinControls.set({ opacity: 1, scale: 1, rotateY: 0 })
    finish()
  }, [finish, seedControls, spinControls, travelControls])

  const requestClose = useCallback(async () => {
    if (closingRef.current) return

    if (phase === 'transforming') {
      closingRef.current = true
      travelControls.stop()
      seedControls.stop()
      spinControls.stop()
      releaseChrome()
      onCloseStart?.()
      onClose()
      return
    }

    closingRef.current = true
    setPhase('closing')
    setStatus(null)
    // Sky copy + header/nav return under the dissolve
    releaseChrome()
    onCloseStart?.()

    if (reduceMotion) {
      await overlayControls.start({ opacity: 0, transition: { duration: 0.18 } })
      onClose()
      return
    }

    // Let React commit chrome fade + sky restore first
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })

    voraAudio.cue('spark')
    void voraAudio.unlock()

    // One continuous tween from current values — no stop/set/keyframe jumps
    await Promise.all([
      spinControls.start({
        scale: 0.22,
        opacity: 0,
        transition: { duration: CLOSE_S, ease: easeClose },
      }),
      travelControls.start({
        x: dx,
        y: dy,
        transition: { duration: CLOSE_S, ease: easeClose },
      }),
      overlayControls.start({
        opacity: 0,
        transition: { duration: CLOSE_S, ease: easeClose },
      }),
    ])

    onClose()
  }, [
    dx,
    dy,
    onClose,
    onCloseStart,
    overlayControls,
    phase,
    reduceMotion,
    releaseChrome,
    seedControls,
    spinControls,
    travelControls,
  ])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  // Run only after portal is in the DOM — avoids opacity stuck at 0
  useEffect(() => {
    if (!mounted) return
    // useReducedMotion is null until hydrated
    if (reduceMotion === null) return
    if (closingRef.current) return

    if (reduceMotion) {
      travelControls.set({ x: 0, y: 0 })
      seedControls.set({ opacity: 0, scale: 1 })
      spinControls.set({ opacity: 1, scale: 1, rotateY: 0 })
      finish()
      return
    }

    let cancelled = false
    const safety = window.setTimeout(() => {
      if (!cancelled && !closingRef.current) skipToReady()
    }, 2800)

    async function run() {
      // Wait one frame so motion nodes bind to animation controls
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      if (cancelled || closingRef.current) return

      travelControls.set({ x: dx, y: dy })
      seedControls.set({ opacity: 1, scale: 1 })
      spinControls.set({ opacity: 0, scale: 0.2, rotateY: 0 })

      voraAudio.cue('spark')
      void voraAudio.unlock()
      await Promise.all([
        travelControls.start({
          x: 0,
          y: 0,
          transition: { duration: PULL_S, ease: easePull },
        }),
        seedControls.start({
          scale: [1, 1.22, 1.08],
          transition: { duration: PULL_S, ease: easePull },
        }),
      ])
      if (cancelled || closingRef.current) return

      voraAudio.cue('card')
      setShowFace(true)
      spinControls.set({ opacity: 1, scale: 0.2, rotateY: 0 })

      await Promise.all([
        seedControls.start({
          opacity: [1, 0],
          scale: [1.08, 1.8],
          transition: { duration: SPIN_S * 0.35, ease },
        }),
        spinControls.start({
          opacity: 1,
          scale: [0.2, 0.7, 1],
          rotateY: [0, 360],
          transition: { duration: SPIN_S, ease, times: [0, 0.45, 1] },
        }),
      ])

      if (!cancelled && !closingRef.current) finish()
    }

    void run()
    return () => {
      cancelled = true
      window.clearTimeout(safety)
    }
  }, [
    mounted,
    reduceMotion,
    dx,
    dy,
    finish,
    seedControls,
    skipToReady,
    spinControls,
    travelControls,
  ])

  async function handleSave() {
    if (!cardRef.current || busy || phase !== 'ready') return
    setBusy(true)
    setStatusTone('progress')
    setStatus(t.saving)
    if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    try {
      const blob = await getCaptureBlob()
      await saveLightCardImage(blob, light.sentence)
      const { Capacitor } = await import('@capacitor/core')
      setStatusTone('success')
      setStatus(
        Capacitor.getPlatform() === 'android' ? t.savedGallery : t.savedPhotos,
      )
    } catch (error) {
      console.error('[vora] save Light card failed', error)
      setStatusTone('error')
      setStatus(t.couldNotSave)
    } finally {
      setBusy(false)
      statusClearRef.current = window.setTimeout(() => setStatus(null), 3200)
    }
  }

  async function handleShare() {
    if (!cardRef.current || busy || phase !== 'ready') return
    setBusy(true)
    setStatusTone('progress')
    setStatus(t.preparing)
    if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    try {
      const blob = await getCaptureBlob()
      const result = await shareOrSaveLightCard(blob, light.sentence)
      if (result === 'cancelled') {
        setStatus(null)
        return
      }
      setStatusTone('success')
      setStatus(result === 'shared' ? t.shared : t.saved)
    } catch {
      setStatusTone('error')
      setStatus(t.couldNotShare)
    } finally {
      setBusy(false)
      statusClearRef.current = window.setTimeout(() => setStatus(null), 3200)
    }
  }

  if (!mounted) return null

  const showSeed = phase === 'transforming' && reduceMotion !== true
  const showChrome = phase === 'ready'
  // Keep ready shadow through close so filter doesn't pop off mid-motion
  const spinReady = phase === 'ready' || phase === 'closing'

  return createPortal(
    <motion.div
      className="vora-light-card-reveal"
      data-sky-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label={t.lightCard}
      initial={{ opacity: 0 }}
      animate={overlayControls}
    >
      <OverlayOpenKick controls={overlayControls} />

      <button
        type="button"
        className="vora-light-card-reveal-backdrop"
        aria-label={
          phase === 'transforming'
            ? t.skipTransformation
            : phase === 'closing'
              ? t.closing
              : t.closeCard
        }
        disabled={phase === 'closing'}
        onClick={() => {
          if (phase === 'transforming') skipToReady()
          else if (phase === 'ready') void requestClose()
        }}
      />

      <AnimatePresence>
        {showChrome ? (
          <motion.button
            key="close"
            type="button"
            className="vora-light-card-reveal-x"
            aria-label={t.close}
            onClick={() => void requestClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <X size={18} strokeWidth={1.25} aria-hidden="true" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <div className="vora-light-card-reveal-stage">
        <motion.div
          className="vora-light-card-reveal-orbit"
          initial={{ x: dx, y: dy }}
          animate={travelControls}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={(event) => {
            event.stopPropagation()
            if (phase === 'transforming') skipToReady()
          }}
        >
          {showSeed ? (
            <motion.span
              className="vora-light-card-seed"
              aria-hidden="true"
              initial={{ opacity: 1, scale: 1 }}
              animate={seedControls}
            >
              <VoraOStar size={24} />
            </motion.span>
          ) : null}

          <motion.div
            className={`vora-light-card-reveal-spin ${spinReady ? 'vora-light-card-reveal-spin--ready' : ''}`}
            initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.2, rotateY: 0 }}
            animate={spinControls}
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
          >
            <div className="vora-light-card-reveal-back" aria-hidden="true" />
            {showFace || reduceMotion ? (
              <div className="vora-light-card-reveal-face">
                <LightCard ref={cardRef} light={light} theme={theme} size="screen" />
              </div>
            ) : null}
          </motion.div>
        </motion.div>

        <div className="vora-light-card-reveal-dock" aria-hidden={!showChrome}>
          <AnimatePresence>
            {showChrome ? (
              <motion.div
                key="actions"
                className="vora-light-card-reveal-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease }}
              >
                <button
                  type="button"
                  className="vora-light-card-action"
                  onClick={handleSave}
                  disabled={busy}
                  aria-busy={busy && status === t.saving}
                >
                  {busy && status === t.saving ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  className="vora-light-card-action vora-light-card-action--primary"
                  onClick={handleShare}
                  disabled={busy}
                  aria-busy={busy && status === t.preparing}
                >
                  {busy && status === t.preparing ? t.sharing : t.share}
                </button>
                <AnimatePresence>
                  {status ? (
                    <motion.p
                      key={status}
                      className="vora-light-card-status"
                      data-tone={statusTone}
                      role="status"
                      aria-live="polite"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease }}
                    >
                      <VoraOStar size={12} />
                      <span>{status}</span>
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}

/** One-shot open fade so overlayControls can own close without stuck opacity 0 */
function OverlayOpenKick({
  controls,
}: {
  controls: ReturnType<typeof useAnimationControls>
}) {
  useEffect(() => {
    void controls.start({ opacity: 1, transition: { duration: 0.35, ease } })
  }, [controls])
  return null
}
