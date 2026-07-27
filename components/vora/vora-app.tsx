'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PenLine, Volume2, VolumeX } from 'lucide-react'
import { AppShell } from './app-shell'
import { NavBar } from './nav-bar'
import { VoraHeader } from './vora-header'
import { EnterRitualScreen } from './screens/enter-ritual-screen'
import { SkyScreen } from './screens/sky-screen'
import { ProfileScreen } from './screens/profile-screen'
import {
  addLightIfNew,
  getTodaysLight,
  localDayKey,
  removeLight,
  resolveSkyLights,
} from './constants'
import { useVoraPersistence } from './use-vora-persistence'
import { voraAudio } from './vora-audio'
import { skyThemeUsesLightChrome } from './light-card-theme'
import { hasKnownWriteOwn, markWriteOwnKnown } from './write-own-hint'
import { allowsHangul } from './locale'
import { VoraLocaleProvider, useVoraLocale } from './vora-locale'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
}

function VoraAppChrome() {
  const {
    hydrated,
    stage,
    setStage,
    tab,
    setTab,
    lights,
    setLights,
    skyTheme,
    setSkyTheme,
    days,
    isSubscribed,
    locale,
    setLocale,
  } = useVoraPersistence()
  const localeReadyRef = useRef(false)
  const [dayKey, setDayKey] = useState(() => localDayKey())
  const [writing, setWriting] = useState(false)
  const [writeDraft, setWriteDraft] = useState('')
  const [skyHomeNonce, setSkyHomeNonce] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [writeInvite, setWriteInvite] = useState(false)
  const [skyHolding, setSkyHolding] = useState(false)
  // dayKey intentionally causes a render at midnight; the helper reads today's date.
  void dayKey
  const todaysLight = getTodaysLight(locale)

  useEffect(() => {
    // After hydrate, refresh curated sky when language changes.
    // UI + seeds swap immediately; user Lights stay. Keep Write open so
    // “Switch to 한국어” mid-draft doesn’t kick the user out of the field.
    if (!hydrated) return
    if (!localeReadyRef.current) {
      localeReadyRef.current = true
      return
    }
    setLights((prev) => resolveSkyLights(prev, { locale }))
  }, [locale, hydrated, setLights])

  useEffect(() => {
    function syncCalendarDay() {
      const next = localDayKey()
      setDayKey((prev) => {
        if (prev === next) return prev
        setLights((lights) => resolveSkyLights(lights, { locale }))
        return next
      })
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') syncCalendarDay()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', syncCalendarDay)
    window.addEventListener('pageshow', syncCalendarDay)
    const timer = window.setInterval(syncCalendarDay, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', syncCalendarDay)
      window.removeEventListener('pageshow', syncCalendarDay)
      window.clearInterval(timer)
    }
  }, [locale, setLights])

  useEffect(() => {
    setSoundOn(voraAudio.hydrate())
  }, [])

  useEffect(() => {
    setWriteInvite(!hasKnownWriteOwn())
  }, [hydrated])

  useEffect(() => {
    if (writing) {
      document.body.dataset.voraWriting = 'true'
    } else {
      delete document.body.dataset.voraWriting
    }
    return () => {
      delete document.body.dataset.voraWriting
    }
  }, [writing])

  useEffect(() => {
    if (skyHolding) {
      document.body.dataset.voraHolding = 'true'
    } else {
      delete document.body.dataset.voraHolding
    }
    return () => {
      delete document.body.dataset.voraHolding
    }
  }, [skyHolding])

  // Never leave Write stuck open on Me, or with a meta sheet covering the field.
  useEffect(() => {
    if (!writing) return
    if (tab === 'profile') {
      setWriting(false)
      return
    }
    closeMetaSheets()
  }, [writing, tab])

  function closeMetaSheets() {
    window.dispatchEvent(new Event('vora:close-sheets'))
  }

  function openWriting() {
    if (skyHolding) return
    markWriteOwnKnown()
    setWriteInvite(false)
    closeMetaSheets()
    if (tab === 'profile') setTab('sky')
    setWriting(true)
  }

  function toggleWriting() {
    if (skyHolding) return
    setWriting((w) => {
      if (!w) {
        markWriteOwnKnown()
        setWriteInvite(false)
        closeMetaSheets()
        if (tab === 'profile') setTab('sky')
        return true
      }
      // Soft close — draft stays for the next open (Apple Notes energy).
      return false
    })
  }

  useEffect(() => {
    if (stage === 'app') setSoundOn(voraAudio.isEnabled())
  }, [stage])

  function addLight(sentence: string): boolean {
    let added = false
    setLights((prev) => {
      const next = addLightIfNew(prev, sentence, {
        allowHangul: allowsHangul(locale),
        locale,
      })
      if (!next) return prev
      added = true
      // Keep the starter seven while the personal sky is still sparse.
      return resolveSkyLights(next, { locale })
    })
    return added
  }

  function handleSaveLight(sentence: string): boolean {
    return addLight(sentence)
  }

  function handleDeleteLight(id: string) {
    // Always re-resolve — ages “today”, refills seeds, restores default sky if empty.
    setLights((prev) => resolveSkyLights(removeLight(prev, id), { locale }))
  }

  function handleFinishWrite(sentence: string): boolean {
    const added = addLight(sentence)
    // Only leave write when the Light actually landed — keep draft on silent fails.
    if (added) {
      setWriteDraft('')
      setWriting(false)
    }
    return added
  }

  function handleCancelWrite() {
    // Discard already cleared draft in the panel when confirmed.
    setWriting(false)
  }

  function goHome() {
    // Logo = Sky home: clear write/card/selection/pan, leave Me, close meta sheets.
    // Draft is kept — Write again and the sentence is still there.
    // Mid-ascent: still go home — Sky commits the pending Hold before clearing.
    setWriting(false)
    setTab('sky')
    setSkyHomeNonce((n) => n + 1)
    closeMetaSheets()
  }

  function returnToGate() {
    setWriting(false)
    setWriteDraft('')
    setTab('sky')
    setStage('splash')
  }

  async function toggleSound() {
    const next = !voraAudio.isEnabled()
    if (next) await voraAudio.enable()
    else await voraAudio.disable()
    setSoundOn(voraAudio.isEnabled())
  }

  const skyLightChrome = skyThemeUsesLightChrome(skyTheme)

  const pointerSurface = stage === 'app' && tab === 'profile' ? 'me' : 'sky'

  if (!hydrated) {
    return (
      <AppShell skyTheme={skyTheme}>
        <div className="flex h-full items-center justify-center" />
      </AppShell>
    )
  }

  return (
    <VoraLocaleProvider locale={locale} setLocale={setLocale}>
      <VoraAppShell
        stage={stage}
        tab={tab}
        setTab={setTab}
        lights={lights}
        todaysLight={todaysLight}
        skyTheme={skyTheme}
        setSkyTheme={setSkyTheme}
        days={days}
        isSubscribed={isSubscribed}
        writing={writing}
        writeDraft={writeDraft}
        setWriteDraft={setWriteDraft}
        skyHomeNonce={skyHomeNonce}
        soundOn={soundOn}
        writeInvite={writeInvite}
        skyHolding={skyHolding}
        skyLightChrome={skyLightChrome}
        pointerSurface={pointerSurface}
        onOpenWriting={openWriting}
        onToggleWriting={toggleWriting}
        onSaveLight={handleSaveLight}
        onDeleteLight={handleDeleteLight}
        onFinishWrite={handleFinishWrite}
        onCancelWrite={handleCancelWrite}
        onHoldingChange={setSkyHolding}
        onHome={goHome}
        onReturnToGate={returnToGate}
        onToggleSound={() => void toggleSound()}
        onEnterDone={() => {
          setSoundOn(voraAudio.isEnabled())
          setStage('app')
        }}
        onSoftCloseWrite={() => setWriting(false)}
      />
    </VoraLocaleProvider>
  )
}

function VoraAppShell({
  stage,
  tab,
  setTab,
  lights,
  todaysLight,
  skyTheme,
  setSkyTheme,
  days,
  isSubscribed,
  writing,
  writeDraft,
  setWriteDraft,
  skyHomeNonce,
  soundOn,
  writeInvite,
  skyHolding,
  skyLightChrome,
  pointerSurface,
  onOpenWriting,
  onToggleWriting,
  onSaveLight,
  onDeleteLight,
  onFinishWrite,
  onCancelWrite,
  onHoldingChange,
  onHome,
  onReturnToGate,
  onToggleSound,
  onEnterDone,
  onSoftCloseWrite,
}: {
  stage: 'splash' | 'onboarding' | 'app'
  tab: 'sky' | 'profile'
  setTab: (t: 'sky' | 'profile') => void
  lights: ReturnType<typeof useVoraPersistence>['lights']
  todaysLight: string
  skyTheme: ReturnType<typeof useVoraPersistence>['skyTheme']
  setSkyTheme: ReturnType<typeof useVoraPersistence>['setSkyTheme']
  days: number
  isSubscribed: boolean
  writing: boolean
  writeDraft: string
  setWriteDraft: (next: string) => void
  skyHomeNonce: number
  soundOn: boolean
  writeInvite: boolean
  skyHolding: boolean
  skyLightChrome: boolean
  pointerSurface: 'sky' | 'me'
  onOpenWriting: () => void
  onToggleWriting: () => void
  onSaveLight: (sentence: string) => boolean
  onDeleteLight: (id: string) => void
  onFinishWrite: (sentence: string) => boolean
  onCancelWrite: () => void
  onHoldingChange: (holding: boolean) => void
  onHome: () => void
  onReturnToGate: () => void
  onToggleSound: () => void
  onEnterDone: () => void
  onSoftCloseWrite: () => void
}) {
  const { t } = useVoraLocale()

  return (
    <AppShell ambient={stage === 'app'} skyTheme={skyTheme} pointerSurface={pointerSurface}>
      <AnimatePresence mode="wait">
        {(stage === 'splash' || stage === 'onboarding') && (
          <motion.div key="enter" className="h-full w-full" {...fade}>
            <EnterRitualScreen skyTheme={skyTheme} onDone={onEnterDone} />
          </motion.div>
        )}

        {stage === 'app' && (
          <motion.div
            key="app"
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <div className="relative h-full w-full">
              <VoraHeader
                tone={tab === 'sky' ? (skyLightChrome ? 'light' : 'night') : 'light'}
                onHome={onHome}
                trailing={
                  <div className="vora-header-actions">
                    <button
                      type="button"
                      onClick={onToggleSound}
                      className={`vora-header-sound-btn ${soundOn ? 'vora-header-sound-btn--on' : ''}`}
                      aria-label={soundOn ? t.muteSound : t.enableSound}
                      aria-pressed={soundOn}
                    >
                      {soundOn ? (
                        <Volume2 size={16} strokeWidth={1.35} aria-hidden="true" />
                      ) : (
                        <VolumeX size={16} strokeWidth={1.35} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onToggleWriting}
                      disabled={skyHolding}
                      className={`vora-header-write-btn${writing ? ' vora-header-write-btn--active' : ''}${
                        writeInvite && !writing ? ' vora-header-write-btn--invite' : ''
                      }`}
                      aria-label={writing ? t.closeWritingAria : t.writeOwnAria}
                      aria-pressed={writing}
                    >
                      <PenLine size={17} strokeWidth={1.35} aria-hidden="true" />
                    </button>
                  </div>
                }
              />

              <AnimatePresence>
                {tab === 'sky' && (
                  <motion.div key="sky" className="h-full w-full" {...fade}>
                    <SkyScreen
                      lights={lights}
                      todaysLight={todaysLight}
                      onSaveLight={onSaveLight}
                      onDeleteLight={onDeleteLight}
                      isWriting={writing}
                      writeDraft={writeDraft}
                      onWriteDraftChange={setWriteDraft}
                      onFinishWrite={onFinishWrite}
                      onCancelWrite={onCancelWrite}
                      onWriteOwn={onOpenWriting}
                      homeNonce={skyHomeNonce}
                      skyTheme={skyTheme}
                      onHoldingChange={onHoldingChange}
                    />
                  </motion.div>
                )}
                {tab === 'profile' && (
                  <motion.div key="profile" className="h-full w-full" {...fade}>
                    <ProfileScreen
                      days={days}
                      lights={lights}
                      todaysLight={todaysLight}
                      isSubscribed={isSubscribed}
                      skyTheme={skyTheme}
                      onSkyThemeChange={setSkyTheme}
                      onReturnToGate={onReturnToGate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <NavBar
                active={tab}
                locked={skyHolding || writing}
                hidden={writing || skyHolding}
                onChange={(next) => {
                  if (skyHolding || writing) return
                  // Leaving Sky soft-closes Write; draft stays for return.
                  if (next === 'profile') onSoftCloseWrite()
                  setTab(next)
                }}
                tone={tab === 'sky' ? (skyLightChrome ? 'light' : 'dark') : 'light'}
                skyTheme={skyTheme}
                onBeginAgain={onReturnToGate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

export function VoraApp() {
  return <VoraAppChrome />
}
