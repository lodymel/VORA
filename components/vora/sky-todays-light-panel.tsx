'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hasMeaningfulContent } from './distill-reflection'
import { getAlbumTypoLines, MirrorTodaysLight } from './mirror-todays-light'
import { formatSkyDate } from './sky-date'
import { pickCategoryLight, type Light } from './constants'
import {
  WriteKeywordPlanets,
  type WritePlanet,
  type WritePlanetId,
} from './write-keyword-planets'
import { hasKnownWriteOwn, markWriteOwnKnown } from './write-own-hint'
import { hasHangul } from './text-script'

const MAX_DRAFT = 280
const WRITE_EASE = [0.22, 1, 0.36, 1] as const
/** One shared breath for write enter / leave */
const WRITE_FADE = { duration: 0.55, ease: WRITE_EASE }

/** Today&apos;s Light hero — diary write, browse stars, hold ritual. */
export function SkyTodaysLightPanel({
  todaysLight,
  alreadyInSky = false,
  heldTodayLight = null,
  viewingLight = null,
  isWriting = false,
  ascending = false,
  skyBeganWhisper = false,
  onHoldLight,
  onWriteOwn,
  onCancelWrite,
  onDeleteLight,
}: {
  todaysLight: string
  alreadyInSky?: boolean
  heldTodayLight?: Light | null
  viewingLight?: Light | null
  isWriting?: boolean
  ascending?: boolean
  skyBeganWhisper?: boolean
  onHoldLight?: (sentence: string, source: 'today' | 'diary') => void
  onWriteOwn?: () => void
  onCancelWrite?: () => void
  onDeleteLight?: (id: string) => void
}) {
  const [savedFlash, setSavedFlash] = useState(false)
  const [draft, setDraft] = useState('')
  const [planetId, setPlanetId] = useState<WritePlanetId | null>(null)
  const [releaseArmed, setReleaseArmed] = useState(false)
  const [writeInvite, setWriteInvite] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wasInSky = useRef(alreadyInSky)
  const isToday = !viewingLight && !isWriting
  const inSky = isToday && (alreadyInSky || savedFlash)
  const releaseTarget = viewingLight ?? (isToday && inSky ? heldTodayLight : null)
  const displaySentence = viewingLight?.sentence ?? todaysLight
  const dateStamp = useMemo(() => formatSkyDate(viewingLight), [viewingLight])
  const albumLines = useMemo(() => getAlbumTypoLines(displaySentence), [displaySentence])
  /** Stable while writing so cancel returns to the same Light without a second swap */
  const contentKey = viewingLight?.id ?? 'today'
  const writingHangul = isWriting && hasHangul(draft)

  useEffect(() => {
    setWriteInvite(!hasKnownWriteOwn())
  }, [])

  useEffect(() => {
    if (!isWriting) return
    markWriteOwnKnown()
    setWriteInvite(false)
  }, [isWriting])

  useEffect(() => {
    if (!wasInSky.current && alreadyInSky && isToday) setSavedFlash(true)
    wasInSky.current = alreadyInSky
  }, [alreadyInSky, isToday])

  useEffect(() => {
    if (!savedFlash) return
    const timer = window.setTimeout(() => setSavedFlash(false), 2800)
    return () => window.clearTimeout(timer)
  }, [savedFlash])

  useEffect(() => {
    if (!isWriting) {
      setDraft('')
      setPlanetId(null)
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 580)
    return () => window.clearTimeout(timer)
  }, [isWriting])

  useEffect(() => {
    setReleaseArmed(false)
  }, [viewingLight?.id, heldTodayLight?.id, isWriting])

  function handleSaveToday() {
    if (!isToday || inSky || ascending) return
    onHoldLight?.(todaysLight, 'today')
  }

  function handleHoldDiary() {
    const trimmed = draft.trim()
    if (!hasMeaningfulContent(trimmed) || ascending) return
    onHoldLight?.(trimmed, 'diary')
  }

  function handlePlanet(planet: WritePlanet) {
    if (ascending) return
    setPlanetId(planet.id)
    setDraft((prev) => pickCategoryLight(planet.id, prev).slice(0, MAX_DRAFT))
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleReleaseClick() {
    if (!releaseTarget || !onDeleteLight || ascending) return
    setReleaseArmed(true)
  }

  function handleConfirmRelease() {
    if (!releaseTarget || !onDeleteLight) return
    onDeleteLight(releaseTarget.id)
    setReleaseArmed(false)
  }

  return (
    <section
      className={`vora-sky-todays-light w-full text-center ${
        ascending ? 'vora-sky-todays-light--ascending' : ''
      }${isWriting ? ' vora-sky-todays-light--writing' : ''}`}
    >
      <p className="vora-sky-date">
        <span>{dateStamp.weekday}</span>
        <span className="vora-sky-date-sep" aria-hidden="true">
          ·
        </span>
        <span>{dateStamp.date}</span>
      </p>

      <WriteKeywordPlanets
        visible={isWriting && !ascending}
        disabled={ascending}
        activeId={planetId}
        onPick={handlePlanet}
      />

      <div className="vora-sky-headline-slot">
        <AnimatePresence mode="sync" initial={false}>
          {isWriting ? (
            <motion.div
              key="writing"
              className={`vora-sky-headline-layer vora-mirror-headline vora-mirror-headline--writing${
                writingHangul ? ' vora-lang-ko' : ''
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={WRITE_FADE}
            >
              <div className="vora-mirror-album-title">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    setPlanetId(null)
                  }}
                  maxLength={MAX_DRAFT}
                  rows={2}
                  disabled={ascending}
                  lang={writingHangul ? 'ko' : undefined}
                  className={`vora-sky-diary-input vora-mirror-album-primary text-balance${
                    writingHangul ? ' vora-lang-ko' : ''
                  }`}
                  placeholder="One sentence, only for you…"
                  aria-label="Write your Light"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={contentKey}
              className="vora-sky-headline-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: ascending ? 0.55 : 1 }}
              exit={{ opacity: 0 }}
              transition={WRITE_FADE}
            >
              <MirrorTodaysLight
                lines={albumLines}
                glowing={isToday && (savedFlash || ascending)}
                saveStar={isToday && savedFlash}
                tappable={isToday && !alreadyInSky && !ascending}
                tapDisabled={inSky || ascending}
                onTap={handleSaveToday}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="vora-sky-ritual-actions">
        {releaseArmed && releaseTarget && onDeleteLight ? (
          <>
            <div className="vora-sky-ritual-action-primary">
              <button
                type="button"
                onClick={() => setReleaseArmed(false)}
                className="vora-sky-release-link"
                aria-label="Keep this Light"
              >
                Keep
              </button>
            </div>
            <div className="vora-sky-ritual-action-secondary">
              <button
                type="button"
                onClick={handleConfirmRelease}
                className="vora-sky-release-confirm-chip"
                aria-label="Release this Light from Sky"
              >
                Release
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="vora-sky-ritual-action-primary">
              <AnimatePresence mode="sync" initial={false}>
                {isWriting ? (
                  <motion.button
                    key="hold-diary"
                    type="button"
                    onClick={handleHoldDiary}
                    disabled={!draft.trim() || ascending}
                    className="vora-sky-diary-hold vora-whisper-chip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    {ascending ? 'Holding…' : 'Hold to Sky'}
                  </motion.button>
                ) : skyBeganWhisper ? (
                  <motion.p
                    key="sky-begins"
                    className="vora-mirror-tap-hint vora-whisper-chip vora-whisper-chip--rising"
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    Your sky begins.
                  </motion.p>
                ) : releaseTarget && onDeleteLight ? (
                  <motion.button
                    key="release"
                    type="button"
                    onClick={handleReleaseClick}
                    className="vora-sky-release-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    Release from Sky
                  </motion.button>
                ) : isToday && !inSky ? (
                  <motion.button
                    key="hold-today"
                    type="button"
                    onClick={handleSaveToday}
                    disabled={ascending}
                    className={`vora-mirror-tap-hint vora-whisper-chip ${
                      ascending ? 'vora-whisper-chip--rising' : ''
                    }`}
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    {ascending ? 'Rising…' : 'Hold this Light'}
                  </motion.button>
                ) : (
                  <span key="primary-spacer" className="vora-sky-ritual-action-spacer" aria-hidden="true" />
                )}
              </AnimatePresence>
            </div>

            <div className="vora-sky-ritual-action-secondary">
              <AnimatePresence mode="wait" initial={false}>
                {isWriting ? (
                  <motion.button
                    key="cancel-write"
                    type="button"
                    onClick={onCancelWrite}
                    disabled={ascending}
                    className="vora-sky-diary-cancel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    Cancel
                  </motion.button>
                ) : onWriteOwn ? (
                  <motion.button
                    key="write-own"
                    type="button"
                    onClick={() => {
                      markWriteOwnKnown()
                      setWriteInvite(false)
                      onWriteOwn()
                    }}
                    disabled={ascending}
                    className={`vora-sky-write-own${writeInvite ? ' vora-sky-write-own--invite' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={WRITE_FADE}
                  >
                    <span className="vora-sky-write-own-liquid" aria-hidden="true" />
                    <span className="vora-sky-write-own-label">Write your own</span>
                  </motion.button>
                ) : (
                  <span key="secondary-spacer" className="vora-sky-ritual-action-spacer" aria-hidden="true" />
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
