'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { hasMeaningfulContent, normalizeLightSentence } from './distill-reflection'
import { getAlbumTypoLines, MirrorTodaysLight } from './mirror-todays-light'
import { formatSkyDate } from './sky-date'
import type { Light } from './constants'
import { hasKnownWriteOwn, markWriteOwnKnown } from './write-own-hint'
import { hasHangul } from './text-script'
import { allowsHangul } from './locale'
import { useVoraLocale } from './vora-locale'
import { useKeyboardInset } from './use-keyboard-inset'

const MAX_DRAFT = 280
const WRITE_EASE = [0.22, 1, 0.36, 1] as const
/** One shared breath for write enter / leave */
const WRITE_FADE = { duration: 0.55, ease: WRITE_EASE }

function resizeDiaryField(el: HTMLTextAreaElement | null, compact = false) {
  if (!el) return
  // Grow with wrapped lines — never leave a one-line chip that scrolls sideways.
  // Cap to the scroll column so Hold / Cancel stay on screen (Notes energy).
  el.style.height = 'auto'
  const main = el.closest('.vora-sky-todays-main') as HTMLElement | null
  const shortLandscape =
    typeof window !== 'undefined' &&
    window.innerWidth > window.innerHeight &&
    window.innerHeight <= 500
  const floor = (compact ? 4.5 : shortLandscape ? 4.25 : 12) * 16
  const ceiling = main ? Math.max(floor, main.clientHeight - 8) : 22 * 16
  const next = Math.min(Math.max(el.scrollHeight, floor), ceiling)
  el.style.height = `${next}px`
}

/** Today's Star hero — diary write, browse stars, hold ritual. */
export function SkyTodaysLightPanel({
  todaysLight,
  alreadyInSky = false,
  heldTodayLight = null,
  viewingLight = null,
  isWriting = false,
  ascending = false,
  skyBeganWhisper = false,
  quietAfterRelease = false,
  draft = '',
  onDraftChange,
  onHoldLight,
  onWriteOwn,
  onCancelWrite,
  onDeleteLight,
  isDuplicateToday = false,
}: {
  todaysLight: string
  alreadyInSky?: boolean
  heldTodayLight?: Light | null
  viewingLight?: Light | null
  isWriting?: boolean
  ascending?: boolean
  skyBeganWhisper?: boolean
  /** Last today Light was Released — rest the hero; don’t re-show Hold on the same line. */
  quietAfterRelease?: boolean
  /** Lifted draft — survives leaving Write without discard. */
  draft?: string
  onDraftChange?: (next: string) => void
  onHoldLight?: (sentence: string, source: 'today' | 'diary') => void
  onWriteOwn?: () => void
  onCancelWrite?: () => void
  onDeleteLight?: (id: string) => void
  /** Draft matches a Light already held today. */
  isDuplicateToday?: boolean
}) {
  const { locale, setLocale, t } = useVoraLocale()
  useKeyboardInset(isWriting)

  const [savedFlash, setSavedFlash] = useState(false)
  const [releaseArmed, setReleaseArmed] = useState(false)
  const [discardArmed, setDiscardArmed] = useState(false)
  const [writeInvite, setWriteInvite] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const caretToEndRef = useRef(false)
  const wasInSky = useRef(alreadyInSky)
  const isToday = !viewingLight && !isWriting
  const isQuiet = isToday && quietAfterRelease && !alreadyInSky
  // Flash is visual only — never keep Hold/Release chrome after the Light leaves the sky.
  const inSky = isToday && alreadyInSky
  const releaseTarget = viewingLight ?? (isToday && inSky ? heldTodayLight : null)
  const displaySentence = viewingLight?.sentence ?? todaysLight
  const dateStamp = useMemo(
    () => formatSkyDate(viewingLight ?? heldTodayLight, locale),
    [viewingLight, heldTodayLight, locale],
  )
  const albumLines = useMemo(
    () => (displaySentence.trim() ? getAlbumTypoLines(displaySentence) : null),
    [displaySentence],
  )
  /** Remount copy when the held Light changes (Hold / Release / quiet) */
  const contentKey =
    viewingLight?.id ??
    heldTodayLight?.id ??
    (isQuiet ? 'quiet-after-release' : `prompt:${todaysLight}`)
  const writingHangul = isWriting && hasHangul(draft)
  const hangulBlocked = writingHangul && !allowsHangul(locale)
  const draftReady = hasMeaningfulContent(draft)
  const duplicateBlocked = draftReady && isDuplicateToday
  const canHoldDiary =
    draftReady && !duplicateBlocked && (!hasHangul(draft) || allowsHangul(locale))
  const showSentenceHint = isWriting && !ascending && !hangulBlocked && !draftReady
  const showDuplicateHint = isWriting && !ascending && !hangulBlocked && duplicateBlocked
  const writeDescriptionId = showDuplicateHint
    ? 'vora-write-duplicate-hint'
    : showSentenceHint
      ? 'vora-write-sentence-hint'
      : undefined
  const writeDescriptionIds = ['vora-write-prompt', writeDescriptionId]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    setWriteInvite(!hasKnownWriteOwn())
  }, [])

  useEffect(() => {
    if (!isWriting) {
      setDiscardArmed(false)
      return
    }
    markWriteOwnKnown()
    setWriteInvite(false)
  }, [isWriting])

  useEffect(() => {
    if (!wasInSky.current && alreadyInSky && isToday) {
      setSavedFlash(true)
    } else if (wasInSky.current && !alreadyInSky) {
      setSavedFlash(false)
    }
    wasInSky.current = alreadyInSky
  }, [alreadyInSky, isToday])

  useEffect(() => {
    if (!savedFlash) return
    const timer = window.setTimeout(() => setSavedFlash(false), 2800)
    return () => window.clearTimeout(timer)
  }, [savedFlash])

  useEffect(() => {
    if (!isWriting) return
    if (draft.trim()) caretToEndRef.current = true
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
    // Snapshot draft only when entering write — caret goes to end on restore.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [isWriting])

  useLayoutEffect(() => {
    if (!isWriting) return
    const el = inputRef.current
    resizeDiaryField(el, ascending)
    if (caretToEndRef.current && el && !ascending) {
      caretToEndRef.current = false
      const end = el.value.length
      el.focus()
      el.setSelectionRange(end, end)
    }
  }, [draft, isWriting, writingHangul, ascending])

  useEffect(() => {
    if (!isWriting) return
    const onResize = () => resizeDiaryField(inputRef.current, ascending)
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [isWriting, ascending])

  function setDraft(next: string) {
    onDraftChange?.(next)
  }

  function handleSaveToday() {
    if (!isToday || inSky || ascending || isQuiet) return
    const sentence = todaysLight.trim()
    if (!sentence) return
    onHoldLight?.(sentence, 'today')
  }

  function handleHoldDiary() {
    const trimmed = normalizeLightSentence(draft)
    if (!canHoldDiary || ascending) return
    onHoldLight?.(trimmed, 'diary')
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

  function handleCancelClick() {
    if (ascending) return
    if (hasMeaningfulContent(draft)) {
      setDiscardArmed(true)
      return
    }
    onCancelWrite?.()
  }

  function handleConfirmDiscard() {
    setDiscardArmed(false)
    setDraft('')
    onCancelWrite?.()
  }

  useEffect(() => {
    setReleaseArmed(false)
  }, [viewingLight?.id, heldTodayLight?.id, isWriting])

  useEffect(() => {
    if (!isWriting || ascending) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (discardArmed) {
        setDiscardArmed(false)
        return
      }
      handleCancelClick()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cancel uses latest draft/discard
  }, [isWriting, ascending, discardArmed, draft])

  return (
    <section
      className={`vora-sky-todays-light w-full text-center ${
        ascending ? 'vora-sky-todays-light--ascending' : ''
      }${isWriting ? ' vora-sky-todays-light--writing' : ''}${
        writingHangul ? ' vora-lang-ko' : ''
      }`}
    >
      <div className="vora-sky-todays-main">
        {isToday && !isWriting && !isQuiet && !inSky ? (
          <p className="vora-sky-todays-kicker">{t.todaysStar}</p>
        ) : null}

        <p className="vora-sky-date">
          <span>{dateStamp.weekday}</span>
          <span className="vora-sky-date-sep" aria-hidden="true">
            ·
          </span>
          <span>{dateStamp.date}</span>
        </p>

        <div className="vora-sky-headline-slot">
          {isWriting ? (
            <div
              key="writing"
              className={`vora-sky-headline-layer vora-mirror-headline vora-mirror-headline--writing${
                writingHangul ? ' vora-lang-ko' : ''
              }`}
            >
              <div className="vora-mirror-album-title vora-sky-write-field">
                <p id="vora-write-prompt" className="vora-sky-write-prompt">
                  {t.writePlaceholder}
                </p>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    setDiscardArmed(false)
                  }}
                  maxLength={MAX_DRAFT}
                  rows={4}
                  disabled={ascending}
                  readOnly={ascending}
                  lang={writingHangul || locale === 'ko' ? 'ko' : undefined}
                  className={`vora-sky-diary-input${writingHangul ? ' vora-lang-ko' : ''}`}
                  aria-label={t.writeOwnAria}
                  aria-describedby={writeDescriptionIds}
                  enterKeyHint="done"
                  autoCapitalize="sentences"
                />
              </div>
            </div>
          ) : (
            <motion.div
              key={contentKey}
              className="vora-sky-headline-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: ascending ? 0.55 : 1 }}
              transition={WRITE_FADE}
            >
              {isQuiet || !albumLines ? (
                <p className="vora-sky-quiet-line">{t.releasedQuiet}</p>
              ) : (
                <MirrorTodaysLight
                  lines={albumLines}
                  glowing={isToday && (savedFlash || ascending)}
                  saveStar={isToday && savedFlash}
                  tappable={isToday && !alreadyInSky && !ascending && !isQuiet}
                  tapDisabled={inSky || ascending || isQuiet}
                  onTap={handleSaveToday}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div
        className="vora-sky-ritual-actions"
        data-vora-cta-shelf={isWriting ? 'write' : 'browse'}
      >
        {discardArmed && isWriting ? (
          <>
            <div className="vora-sky-ritual-action-primary">
              <p className="vora-sky-leave-prompt" role="status">
                {t.leaveLight}
              </p>
              <button
                type="button"
                onClick={() => setDiscardArmed(false)}
                className="vora-sky-diary-hold vora-whisper-chip"
                aria-label={t.keepWriting}
              >
                {t.keepWriting}
              </button>
            </div>
            <div className="vora-sky-ritual-action-secondary">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="vora-sky-release-link"
                aria-label={t.leave}
              >
                {t.leave}
              </button>
            </div>
          </>
        ) : releaseArmed && releaseTarget && onDeleteLight ? (
          <>
            <div className="vora-sky-ritual-action-primary">
              <button
                type="button"
                onClick={() => setReleaseArmed(false)}
                className="vora-sky-diary-hold vora-whisper-chip"
                aria-label={t.keep}
              >
                {t.keep}
              </button>
            </div>
            <div className="vora-sky-ritual-action-secondary">
              <button
                type="button"
                onClick={handleConfirmRelease}
                className="vora-sky-release-link"
                aria-label={t.release}
              >
                {t.release}
              </button>
            </div>
          </>
        ) : isWriting ? (
          <>
            <div className="vora-sky-write-guidance">
              {hangulBlocked ? (
                <button
                  type="button"
                  className="vora-sky-write-hint vora-sky-write-hint--action"
                  onClick={() => setLocale('ko')}
                >
                  <span className="vora-sky-write-hint-label">{t.writeHangulHint}</span>
                  <span className="vora-sky-write-hint-cta">{t.writeSwitchKo}</span>
                </button>
              ) : showDuplicateHint ? (
                <p
                  id="vora-write-duplicate-hint"
                  className="vora-sky-write-hint vora-sky-write-hint--sentence"
                  role="status"
                >
                  {t.writeDuplicateHint}
                </p>
              ) : showSentenceHint ? (
                <p
                  id="vora-write-sentence-hint"
                  className="vora-sky-write-hint vora-sky-write-hint--sentence"
                  role="status"
                >
                  {t.writeSentenceHint}
                </p>
              ) : (
                <span className="vora-sky-write-guidance-spacer" aria-hidden="true" />
              )}
            </div>
            <div className="vora-sky-ritual-action-primary">
              <button
                type="button"
                onClick={handleHoldDiary}
                disabled={!canHoldDiary || ascending}
                className="vora-sky-diary-hold vora-whisper-chip"
              >
                {ascending ? t.holding : t.holdToSky}
              </button>
            </div>
            <div className="vora-sky-ritual-action-secondary">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={ascending}
                className="vora-sky-diary-cancel"
              >
                {t.cancel}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="vora-sky-ritual-action-primary">
              {/* Release always wins — never hide it behind “Your sky begins.” */}
              {releaseTarget && onDeleteLight ? (
                <button
                  type="button"
                  onClick={handleReleaseClick}
                  className="vora-sky-release-link"
                >
                  {t.releaseFromSky}
                </button>
              ) : skyBeganWhisper ? (
                <p
                  className="vora-mirror-tap-hint vora-whisper-chip vora-whisper-chip--rising"
                  aria-live="polite"
                >
                  {t.skyBegins}
                </p>
              ) : isQuiet ? (
                <span className="vora-sky-ritual-action-spacer" aria-hidden="true" />
              ) : isToday && !inSky && todaysLight.trim() ? (
                <button
                  type="button"
                  onClick={handleSaveToday}
                  disabled={ascending}
                  className={`vora-mirror-tap-hint vora-whisper-chip ${
                    ascending ? 'vora-whisper-chip--rising' : ''
                  }`}
                  aria-live="polite"
                >
                  {ascending ? t.rising : t.holdThisLight}
                </button>
              ) : (
                <span className="vora-sky-ritual-action-spacer" aria-hidden="true" />
              )}
            </div>

            <div className="vora-sky-ritual-action-secondary">
              {onWriteOwn ? (
                <button
                  type="button"
                  onClick={() => {
                    markWriteOwnKnown()
                    setWriteInvite(false)
                    onWriteOwn()
                  }}
                  disabled={ascending}
                  className={`vora-sky-write-own${writeInvite || isQuiet ? ' vora-sky-write-own--invite' : ''}`}
                >
                  <span className="vora-sky-write-own-liquid" aria-hidden="true" />
                  <span className="vora-sky-write-own-label">{t.writeYourOwn}</span>
                </button>
              ) : (
                <span className="vora-sky-ritual-action-spacer" aria-hidden="true" />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
