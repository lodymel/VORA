'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { LightCard } from './light-card'
import { VoraOStar } from './logo'
import {
  captureLightCardPng,
  prepareLightCardExport,
  saveLightCardImage,
  shareOrSaveLightCard,
  type PreparedLightCardExport,
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
const easeTurn = [0.2, 0.72, 0.24, 1] as const
/** Quiet dissolve — single tween, no keyframe thrash */
const easeClose = [0.22, 1, 0.36, 1] as const

/** Open: preserve VORA's original full turn, with the pull and spin overlapping. */
const PULL_S = 0.46
const SPIN_S = 0.88
const SPIN_DELAY_S = 0.16
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
  const [busyAction, setBusyAction] = useState<'save' | 'share' | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success')
  const cardRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const busyActionRef = useRef<'save' | 'share' | null>(null)
  const captureCacheRef = useRef<Blob | null>(null)
  const capturePromiseRef = useRef<Promise<Blob> | null>(null)
  const exportCacheRef = useRef<PreparedLightCardExport | null>(null)
  const exportPromiseRef = useRef<Promise<PreparedLightCardExport> | null>(null)
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
    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    document.body.dataset.voraCardOpen = 'true'
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      delete document.body.dataset.voraCardOpen
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // A modal is one interaction island: remove the app behind it from the
  // accessibility tree, keep focus inside, then return to the originating Star.
  useEffect(() => {
    if (!mounted) return
    const overlay = overlayRef.current
    if (!overlay) return

    const background = [...document.body.children].filter(
      (node): node is HTMLElement => node instanceof HTMLElement && node !== overlay,
    )
    const previous = background.map((node) => ({
      node,
      inert: node.inert,
      ariaHidden: node.getAttribute('aria-hidden'),
    }))
    for (const item of previous) {
      item.node.inert = true
      item.node.setAttribute('aria-hidden', 'true')
    }
    overlay.focus({ preventScroll: true })

    return () => {
      for (const item of previous) {
        item.node.inert = item.inert
        if (item.ariaHidden == null) item.node.removeAttribute('aria-hidden')
        else item.node.setAttribute('aria-hidden', item.ariaHidden)
      }
      const opener = openerRef.current
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [mounted])

  useEffect(() => {
    if (phase !== 'ready') return
    closeButtonRef.current?.focus({ preventScroll: true })
  }, [phase])

  const releaseChrome = useCallback(() => {
    delete document.body.dataset.voraCardOpen
  }, [])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setPhase('ready')
  }, [])

  useEffect(() => {
    return () => {
      if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    }
  }, [])

  // Never compete with the 3D reveal for the main thread. DOM capture is
  // intentionally deferred until the turn has fully settled; in practice it
  // still finishes during the short moment before a user reaches Save/Share.
  useEffect(() => {
    if (!mounted || phase !== 'ready') return
    const el = cardRef.current
    if (!el) return
    let cancelled = false
    captureCacheRef.current = null
    exportCacheRef.current = null
    const capturePromise = captureLightCardPng(el)
    capturePromiseRef.current = capturePromise
    const exportPromise = capturePromise
      .then(async (blob) => {
        if (!cancelled) captureCacheRef.current = blob
        return prepareLightCardExport(blob, light.sentence)
      })
    exportPromiseRef.current = exportPromise
    void exportPromise
      .then((prepared) => {
        if (!cancelled) exportCacheRef.current = prepared
      })
      .catch(() => {
        /* capture and prepare on demand if prefetch fails */
      })
      .finally(() => {
        if (capturePromiseRef.current === capturePromise) {
          capturePromiseRef.current = null
        }
        if (exportPromiseRef.current === exportPromise) {
          exportPromiseRef.current = null
        }
      })
    return () => {
      cancelled = true
    }
  }, [mounted, phase, light.id, light.sentence, theme])

  async function getCaptureBlob() {
    if (captureCacheRef.current) return captureCacheRef.current
    if (capturePromiseRef.current) return capturePromiseRef.current
    if (!cardRef.current) throw new Error('Card not ready')
    const capturePromise = captureLightCardPng(cardRef.current)
    capturePromiseRef.current = capturePromise
    try {
      const blob = await capturePromise
      captureCacheRef.current = blob
      return blob
    } finally {
      if (capturePromiseRef.current === capturePromise) {
        capturePromiseRef.current = null
      }
    }
  }

  async function getPreparedExport(blob: Blob) {
    if (exportCacheRef.current) return exportCacheRef.current
    if (exportPromiseRef.current) return exportPromiseRef.current
    const exportPromise = prepareLightCardExport(blob, light.sentence)
    exportPromiseRef.current = exportPromise
    try {
      const prepared = await exportPromise
      exportCacheRef.current = prepared
      return prepared
    } finally {
      if (exportPromiseRef.current === exportPromise) {
        exportPromiseRef.current = null
      }
    }
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
      if (event.key === 'Escape') {
        event.preventDefault()
        void requestClose()
        return
      }
      if (event.key !== 'Tab' || phase === 'closing') return

      const overlay = overlayRef.current
      if (!overlay) return
      const focusable = [...overlay.querySelectorAll<HTMLElement>(
        'button:not(:disabled):not([tabindex="-1"]), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )].filter((node) => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      if (focusable.length === 0) {
        event.preventDefault()
        overlay.focus({ preventScroll: true })
        return
      }

      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement)
      const nextIndex = event.shiftKey
        ? activeIndex <= 0 ? focusable.length - 1 : activeIndex - 1
        : activeIndex < 0 || activeIndex === focusable.length - 1 ? 0 : activeIndex + 1
      event.preventDefault()
      focusable[nextIndex]?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, requestClose])

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
      // Keep the 3D layer opaque. Animating parent opacity can flatten its
      // preserve-3d children on mobile WebKit and expose mirrored type.
      spinControls.set({ opacity: 1, scale: 0.2, rotateY: 0 })

      voraAudio.cue('spark')
      void voraAudio.unlock()
      const pull = travelControls.start({
        x: 0,
        y: 0,
        transition: { duration: PULL_S, ease: easePull },
      })
      const seed = seedControls.start({
        opacity: [1, 0.92, 0.48, 0],
        scale: [1, 1.18, 1.42, 1.8],
        transition: {
          duration: SPIN_DELAY_S + SPIN_S * 0.58,
          ease,
          times: [0, 0.28, 0.62, 1],
        },
      })
      const spin = spinControls.start({
        opacity: 1,
        scale: 1,
        rotateY: 360,
        transition: {
          delay: SPIN_DELAY_S,
          duration: SPIN_S,
          ease: easeTurn,
        },
      })

      await pull
      if (cancelled || closingRef.current) return

      voraAudio.cue('card')

      await Promise.all([seed, spin])
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
    if (!cardRef.current || busyActionRef.current || phase !== 'ready') return
    busyActionRef.current = 'save'
    setBusyAction('save')
    setStatus(null)
    if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    try {
      const blob = await getCaptureBlob()
      const prepared = await getPreparedExport(blob)
      await saveLightCardImage(blob, light.sentence, prepared)
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
      busyActionRef.current = null
      setBusyAction(null)
      statusClearRef.current = window.setTimeout(() => setStatus(null), 3200)
    }
  }

  async function handleShare() {
    if (!cardRef.current || busyActionRef.current || phase !== 'ready') return
    busyActionRef.current = 'share'
    setBusyAction('share')
    setStatus(null)
    if (statusClearRef.current) window.clearTimeout(statusClearRef.current)
    try {
      const blob = await getCaptureBlob()
      const prepared = await getPreparedExport(blob)
      const result = await shareOrSaveLightCard(blob, light.sentence, prepared)
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
      busyActionRef.current = null
      setBusyAction(null)
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
      ref={overlayRef}
      className="vora-light-card-reveal"
      data-sky-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label={t.lightCard}
      tabIndex={-1}
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
        tabIndex={-1}
        onClick={() => {
          if (phase === 'transforming') skipToReady()
          else if (phase === 'ready') void requestClose()
        }}
      />

      <AnimatePresence>
        {showChrome ? (
          <motion.button
            ref={closeButtonRef}
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
            <div className="vora-light-card-reveal-face">
              <LightCard ref={cardRef} light={light} theme={theme} size="screen" />
            </div>
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
                  disabled={busyAction !== null}
                  aria-busy={busyAction === 'save'}
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  className="vora-light-card-action vora-light-card-action--primary"
                  onClick={handleShare}
                  disabled={busyAction !== null}
                  aria-busy={busyAction === 'share'}
                >
                  {t.share}
                </button>
                <div
                  className="vora-light-card-status-slot"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <AnimatePresence initial={false}>
                    {status ? (
                      <motion.p
                        key={`${statusTone}:${status}`}
                        className="vora-light-card-status"
                        data-tone={statusTone}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease }}
                      >
                        <span className="vora-light-card-status-copy">
                          <span className="vora-light-card-status-icon" aria-hidden="true">
                            <VoraOStar size={12} />
                          </span>
                          <span>{status}</span>
                          <span className="vora-light-card-status-icon" aria-hidden="true">
                            <VoraOStar size={12} />
                          </span>
                        </span>
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
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
