'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PenLine, Volume2, VolumeX } from 'lucide-react'
import { AppShell } from './app-shell'
import { NavBar } from './nav-bar'
import { VoraHeader } from './vora-header'
import { EnterRitualScreen } from './screens/enter-ritual-screen'
import { SkyScreen } from './screens/sky-screen'
import { ProfileScreen } from './screens/profile-screen'
import { addLightIfNew, getTodaysLight, hasLightToday, isSeedLight, removeLight, resolveSkyLights, createSeedLights } from './constants'
import { useVoraPersistence } from './use-vora-persistence'
import { voraAudio } from './vora-audio'
import { skyThemeUsesLightChrome } from './light-card-theme'
import { hasKnownWriteOwn, markWriteOwnKnown } from './write-own-hint'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

export function VoraApp() {
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
  } = useVoraPersistence()
  const todaysLight = useMemo(() => getTodaysLight(), [])
  const [writing, setWriting] = useState(false)
  const [skyHomeNonce, setSkyHomeNonce] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [writeInvite, setWriteInvite] = useState(false)

  useEffect(() => {
    setSoundOn(voraAudio.hydrate())
  }, [])

  useEffect(() => {
    setWriteInvite(!hasKnownWriteOwn())
  }, [hydrated])

  function closeMetaSheets() {
    window.dispatchEvent(new Event('vora:close-sheets'))
  }

  function openWriting() {
    markWriteOwnKnown()
    setWriteInvite(false)
    closeMetaSheets()
    if (tab === 'profile') setTab('sky')
    setWriting(true)
  }

  function toggleWriting() {
    setWriting((w) => {
      if (!w) {
        markWriteOwnKnown()
        setWriteInvite(false)
        closeMetaSheets()
        if (tab === 'profile') setTab('sky')
        return true
      }
      return false
    })
  }

  useEffect(() => {
    if (stage === 'app') setSoundOn(voraAudio.isEnabled())
  }, [stage])

  function addLight(sentence: string): boolean {
    let added = false
    setLights((prev) => {
      const next = addLightIfNew(prev, sentence)
      if (!next) return prev
      added = true
      // Keep the starter seven while the personal sky is still sparse.
      return resolveSkyLights(next)
    })
    return added
  }

  function handleSaveLight(sentence: string): boolean {
    return addLight(sentence)
  }

  function handleDeleteLight(id: string) {
    setLights((prev) => {
      const next = removeLight(prev, id)
      const userLeft = next.filter((light) => !isSeedLight(light))
      // Empty personal sky → restore the default constellation.
      if (userLeft.length === 0) return createSeedLights()
      return next
    })
  }

  function handleFinishWrite(sentence: string) {
    addLight(sentence)
    setWriting(false)
  }

  function goHome() {
    // Logo = Sky home: clear write/card/selection/pan, leave Me, close meta sheets.
    setWriting(false)
    setTab('sky')
    setSkyHomeNonce((n) => n + 1)
    closeMetaSheets()
  }

  function returnToGate() {
    setWriting(false)
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
    <AppShell ambient={stage === 'app'} skyTheme={skyTheme} pointerSurface={pointerSurface}>
      <AnimatePresence mode="wait">
        {(stage === 'splash' || stage === 'onboarding') && (
          <motion.div key="enter" className="h-full w-full" {...fade}>
            <EnterRitualScreen
              skyTheme={skyTheme}
              onDone={() => {
                setSoundOn(voraAudio.isEnabled())
                setStage('app')
              }}
            />
          </motion.div>
        )}

        {stage === 'app' && (
          <motion.div
            key="app"
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <div className="relative h-full w-full">
              <VoraHeader
                tone={tab === 'sky' ? (skyLightChrome ? 'light' : 'night') : 'light'}
                onHome={goHome}
                trailing={
                  <div className="vora-header-actions">
                    <button
                      type="button"
                      onClick={() => void toggleSound()}
                      className={`vora-header-sound-btn ${soundOn ? 'vora-header-sound-btn--on' : ''}`}
                      aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
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
                      onClick={toggleWriting}
                      className={`vora-header-write-btn${writing ? ' vora-header-write-btn--active' : ''}${
                        writeInvite && !writing ? ' vora-header-write-btn--invite' : ''
                      }`}
                      aria-label={writing ? 'Close writing' : 'Write your own Light'}
                      aria-pressed={writing}
                    >
                      <PenLine size={17} strokeWidth={1.35} aria-hidden="true" />
                    </button>
                  </div>
                }
              />

              <AnimatePresence mode="wait">
                {tab === 'sky' && (
                  <motion.div key="sky" className="h-full w-full" {...fade}>
                    <SkyScreen
                      lights={lights}
                      todaysLight={todaysLight}
                      alreadyInSky={hasLightToday(lights, todaysLight)}
                      onSaveLight={handleSaveLight}
                      onDeleteLight={handleDeleteLight}
                      isWriting={writing}
                      onFinishWrite={handleFinishWrite}
                      onCancelWrite={() => setWriting(false)}
                      onWriteOwn={openWriting}
                      homeNonce={skyHomeNonce}
                      skyTheme={skyTheme}
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
                      onReturnToGate={returnToGate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <NavBar
                active={tab}
                onChange={setTab}
                tone={tab === 'sky' ? (skyLightChrome ? 'light' : 'dark') : 'light'}
                skyTheme={skyTheme}
                onBeginAgain={returnToGate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
