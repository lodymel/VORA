'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { SkyAtmosphere } from '../sky-atmosphere'
import { ConstellationNodeButton } from '../constellation-node-button'
import { buildConstellation, ConstellationLines, getConstellationWorldScale } from '../sky-constellation'
import { useConstellationPan } from '../use-constellation-pan'
import { SkyTodaysLightPanel } from '../sky-todays-light-panel'
import { SkyHoldAscent } from '../sky-hold-ascent'
import { SkyAwaitingConstellation } from '../sky-awaiting-constellation'
import { LightCardReveal } from '../light-card-reveal'
import { DEFAULT_LIGHT_CARD_THEME, type CardOrigin, type SkyThemeId } from '../light-card-theme'
import { voraAudio } from '../vora-audio'
import {
  getSkyHeroHeldLight,
  getSkyHeroSentence,
  hasLightToday,
  shouldRestHeroAfterRelease,
  type Light,
} from '../constants'
import { hasMeaningfulContent, normalizeLightSentence } from '../distill-reflection'
import { hasHangul } from '../text-script'
import { allowsHangul } from '../locale'
import { useVoraLocale } from '../vora-locale'

type PendingHold = { sentence: string; source: 'today' | 'diary' }

export function SkyScreen({
  lights,
  todaysLight,
  onSaveLight,
  onDeleteLight,
  isWriting = false,
  writeDraft = '',
  onWriteDraftChange,
  onFinishWrite,
  onCancelWrite,
  onWriteOwn,
  homeNonce = 0,
  skyTheme = DEFAULT_LIGHT_CARD_THEME,
  onHoldingChange,
}: {
  lights: Light[]
  /** Daily invitation prompt — used when you haven’t held a Light today yet */
  todaysLight: string
  onSaveLight: (sentence: string) => boolean
  onDeleteLight: (id: string) => void
  isWriting?: boolean
  writeDraft?: string
  onWriteDraftChange?: (next: string) => void
  onFinishWrite: (sentence: string) => boolean | void
  onCancelWrite: () => void
  onWriteOwn?: () => void
  homeNonce?: number
  skyTheme?: SkyThemeId
  /** True while the Hold ascent is in flight — parent can lock nav. */
  onHoldingChange?: (holding: boolean) => void
}) {
  const { locale } = useVoraLocale()
  const [selected, setSelected] = useState<Light | null>(null)
  const [reveal, setReveal] = useState<{ light: Light; origin: CardOrigin } | null>(null)
  const [skyUnderCard, setSkyUnderCard] = useState(false)
  const [ascent, setAscent] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(
    null,
  )
  const [skyBeganWhisper, setSkyBeganWhisper] = useState(false)
  /** Last today Light was Released — rest the hero; don’t re-pin the same daily line + Hold. */
  const [heroQuiet, setHeroQuiet] = useState(false)
  const prevLightCount = useRef(lights.length)
  const selectionBeforeWrite = useRef<Light | null>(null)
  const pendingSelectSentence = useRef<string | null>(null)
  const pendingRevealAfterWrite = useRef<{ light: Light; origin: CardOrigin } | null>(null)
  const pendingHold = useRef<PendingHold | null>(null)
  const wasWriting = useRef(false)
  const selectedRef = useRef<Light | null>(null)
  const saveLightRef = useRef(onSaveLight)
  const finishWriteRef = useRef(onFinishWrite)
  saveLightRef.current = onSaveLight
  finishWriteRef.current = onFinishWrite
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const nodes = useMemo(() => buildConstellation(lights, 'top'), [lights])
  const worldScale = useMemo(() => getConstellationWorldScale(nodes.length), [nodes.length])
  const { panRef, didDrag, explore } = useConstellationPan(pageRef, stageRef, worldRef, worldScale, homeNonce)
  const heldTodayLight = useMemo(
    () => getSkyHeroHeldLight(lights, todaysLight),
    [lights, todaysLight],
  )
  const alreadyInSky = !!heldTodayLight
  const restingHero = heroQuiet && !heldTodayLight
  const draftDuplicateToday = useMemo(
    () => hasLightToday(lights, normalizeLightSentence(writeDraft)),
    [lights, writeDraft],
  )
  // Body follows what you held — or rests after Release — never fake-holds the daily line.
  const heroSentence = useMemo(() => {
    if (heldTodayLight) return heldTodayLight.sentence
    if (restingHero) return ''
    return getSkyHeroSentence(lights, todaysLight)
  }, [heldTodayLight, restingHero, lights, todaysLight])
  selectedRef.current = selected

  useEffect(() => {
    if (heldTodayLight) setHeroQuiet(false)
  }, [heldTodayLight])

  // Quiet is a breath — then soft return to today’s invitation (no instant same-line Hold loop).
  useEffect(() => {
    if (!heroQuiet || heldTodayLight) return
    const timer = window.setTimeout(() => setHeroQuiet(false), 3000)
    return () => window.clearTimeout(timer)
  }, [heroQuiet, heldTodayLight])

  useEffect(() => {
    onHoldingChange?.(!!ascent)
  }, [ascent, onHoldingChange])

  useEffect(() => {
    if (homeNonce === 0) return
    const pending = pendingHold.current
    pendingHold.current = null
    setAscent(null)
    // Logo home mid-ascent — commit so the Light is never lost.
    if (pending) {
      if (pending.source === 'today') {
        pendingSelectSentence.current = pending.sentence
        if (!saveLightRef.current(pending.sentence)) pendingSelectSentence.current = null
      } else {
        pendingSelectSentence.current = pending.sentence
        if (finishWriteRef.current(pending.sentence) === false) {
          pendingSelectSentence.current = null
        }
      }
    } else {
      pendingSelectSentence.current = null
    }
    setSelected(null)
    setReveal(null)
    setSkyUnderCard(false)
    setHeroQuiet(false)
    selectionBeforeWrite.current = null
    pendingRevealAfterWrite.current = null
    pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [homeNonce])

  useEffect(() => {
    const prev = prevLightCount.current
    prevLightCount.current = lights.length
    if (prev === 0 && lights.length === 1) {
      setSkyBeganWhisper(true)
      const timer = window.setTimeout(() => setSkyBeganWhisper(false), 3400)
      return () => window.clearTimeout(timer)
    }
  }, [lights.length])

  useEffect(() => {
    setSelected((prev) => {
      if (!prev) return null
      return lights.find((light) => light.id === prev.id) ?? null
    })
    setReveal((prev) => {
      if (!prev) return null
      const next = lights.find((light) => light.id === prev.light.id)
      return next ? { ...prev, light: next } : null
    })
  }, [lights])

  useEffect(() => {
    if (isWriting && !wasWriting.current) {
      selectionBeforeWrite.current = selectedRef.current
      setReveal(null)
      setSelected(null)
    } else if (!isWriting && wasWriting.current) {
      const pendingCard = pendingRevealAfterWrite.current
      if (pendingCard) {
        pendingRevealAfterWrite.current = null
        selectionBeforeWrite.current = null
        pendingSelectSentence.current = null
        void voraAudio.unlock()
        voraAudio.cue('select')
        setSelected(pendingCard.light)
        setSkyUnderCard(true)
        setReveal({ light: pendingCard.light, origin: pendingCard.origin })
      } else {
        const pending = pendingSelectSentence.current
        if (pending) {
          const found = lights.find(
            (light) => light.daysAgo === 0 && light.sentence.trim() === pending,
          )
          if (found) {
            setSelected(found)
            pendingSelectSentence.current = null
          }
        } else {
          /* Cancel — return to today's Light, one soft landing */
          selectionBeforeWrite.current = null
          setSelected(null)
          setReveal(null)
        }
      }
    }
    wasWriting.current = isWriting
  }, [isWriting, lights])

  useEffect(() => {
    const pending = pendingSelectSentence.current
    if (!pending || isWriting) return
    const found = lights.find(
      (light) => light.daysAgo === 0 && light.sentence.trim() === pending,
    )
    if (!found) return
    setSelected(found)
    pendingSelectSentence.current = null
    selectionBeforeWrite.current = null
  }, [lights, isWriting])

  function handleDelete(id: string) {
    if (shouldRestHeroAfterRelease(lights, id)) setHeroQuiet(true)
    onDeleteLight(id)
    setSelected(null)
    setReveal(null)
    selectionBeforeWrite.current = null
  }

  function commitHold(sentence: string, source: 'today' | 'diary') {
    const trimmed = sentence.trim()
    setHeroQuiet(false)
    if (source === 'today') {
      pendingSelectSentence.current = trimmed
      const added = onSaveLight(trimmed)
      if (!added) pendingSelectSentence.current = null
      return
    }
    pendingSelectSentence.current = trimmed
    selectionBeforeWrite.current = null
    const added = onFinishWrite(trimmed)
    if (added === false) pendingSelectSentence.current = null
    setReveal(null)
  }

  function measureAscent(sentence: string) {
    const page = pageRef.current
    const stage = stageRef.current
    const headline = page?.querySelector('.vora-sky-headline-slot') as HTMLElement | null
    if (!page || !stage || !headline) return null

    const pageBox = page.getBoundingClientRect()
    const headBox = headline.getBoundingClientRect()
    const stageBox = stage.getBoundingClientRect()

    const provisional: Light = {
      id: `pending-${Date.now()}`,
      sentence,
      date: 'Today',
      daysAgo: 0,
    }
    const nextNodes = buildConstellation([...lights, provisional], 'top')
    const target = nextNodes[nextNodes.length - 1]
    const scale = getConstellationWorldScale(nextNodes.length)
    const worldW = stageBox.width * scale.x
    const worldH = stageBox.height * scale.y
    const originX = stageBox.width / 2 - worldW / 2 + panRef.current.x
    const originY = stageBox.height / 2 - worldH / 2 + panRef.current.y

    return {
      from: {
        x: headBox.left + headBox.width / 2 - pageBox.left,
        y: headBox.top + headBox.height * 0.45 - pageBox.top,
      },
      to: {
        x: stageBox.left + originX + (target.x / 100) * worldW - pageBox.left,
        y: stageBox.top + originY + (target.y / 100) * worldH - pageBox.top,
      },
    }
  }

  function handleHoldLight(sentence: string, source: 'today' | 'diary') {
    if (ascent || pendingHold.current) return
    const trimmed = normalizeLightSentence(sentence)
    if (!trimmed) return
    // Diary must be at least one sentence. Today's Star is curated — always holdable.
    if (source === 'diary' && !hasMeaningfulContent(trimmed)) return
    if (hasHangul(trimmed) && !allowsHangul(locale)) return
    if (hasLightToday(lights, trimmed)) return

    void voraAudio.unlock()
    voraAudio.cue('hold')

    const points = measureAscent(trimmed)
    pendingHold.current = { sentence: trimmed, source }
    if (!points) {
      commitHold(trimmed, source)
      pendingHold.current = null
      return
    }
    setAscent(points)
  }

  function handleAscentComplete() {
    const pending = pendingHold.current
    pendingHold.current = null
    setAscent(null)
    if (!pending) return
    commitHold(pending.sentence, pending.source)
  }

  function openCard(light: Light, origin: CardOrigin) {
    void voraAudio.unlock()
    voraAudio.cue('select')
    setSelected(light)
    setSkyUnderCard(true)
    setReveal({ light, origin })
  }

  // Hide sky copy only while the card is fully present — restore as close begins
  const hideSkyCopy = !!reveal && skyUnderCard

  return (
    <div
      ref={pageRef}
      className={`vora-sky-page vora-sky-page--explore relative flex h-full w-full flex-col ${
        hideSkyCopy ? 'vora-sky-page--revealing' : ''
      }${isWriting ? ' vora-sky-page--writing' : ''}`}
    >
      <SkyAtmosphere className="absolute inset-0" depth="sky" explore={explore} />

      <div className="vora-sky-stack relative z-10 flex min-h-0 flex-1 flex-col">
        <section className="vora-sky-constellation-band shrink-0">
          <div ref={stageRef} className="vora-sky-constellation-stage relative">
            <div
              ref={worldRef}
              className="vora-constellation-world"
              style={{
                width: `${worldScale.x * 100}%`,
                height: `${worldScale.y * 100}%`,
              }}
            >
              {nodes.length === 0 ? (
                <SkyAwaitingConstellation dissolving={!!ascent} />
              ) : (
                <>
                  <ConstellationLines nodes={nodes} activeId={selected?.id ?? null} />
                  {nodes.map((node, i) => {
                    const active = !isWriting && selected?.id === node.light.id
                    const cardOpen = reveal?.light.id === node.light.id
                    return (
                      <ConstellationNodeButton
                        key={node.light.id}
                        light={node.light}
                        x={node.x}
                        y={node.y}
                        size={node.size}
                        twinkleDuration={node.twinkleDuration}
                        twinkleDelay={node.twinkleDelay}
                        active={active}
                        dimmed={(!!selected && !active && !isWriting) || !!ascent}
                        index={i}
                        onToggle={(origin) => {
                          if (didDrag.current || ascent) return
                          if (isWriting) {
                            selectionBeforeWrite.current = null
                            pendingSelectSentence.current = null
                            pendingRevealAfterWrite.current = { light: node.light, origin }
                            onCancelWrite()
                            return
                          }
                          if (active && cardOpen) {
                            setSelected(null)
                            setReveal(null)
                            return
                          }
                          openCard(node.light, origin)
                        }}
                      />
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="vora-sky-ritual vora-sky-ritual--editorial">
          <SkyTodaysLightPanel
            todaysLight={heroSentence}
            alreadyInSky={alreadyInSky}
            heldTodayLight={heldTodayLight}
            viewingLight={null}
            isWriting={isWriting}
            draft={writeDraft}
            onDraftChange={onWriteDraftChange}
            ascending={!!ascent}
            skyBeganWhisper={skyBeganWhisper}
            quietAfterRelease={restingHero}
            isDuplicateToday={draftDuplicateToday}
            onHoldLight={handleHoldLight}
            onWriteOwn={onWriteOwn}
            onCancelWrite={onCancelWrite}
            onDeleteLight={handleDelete}
          />
        </section>
      </div>

      <AnimatePresence>
        {ascent ? (
          <SkyHoldAscent
            key="ascent"
            from={ascent.from}
            to={ascent.to}
            onComplete={handleAscentComplete}
          />
        ) : null}
      </AnimatePresence>

      {reveal && !isWriting ? (
        <LightCardReveal
          key={reveal.light.id}
          light={reveal.light}
          origin={reveal.origin}
          theme={skyTheme}
          onCloseStart={() => setSkyUnderCard(false)}
          onClose={() => {
            setReveal(null)
            setSelected(null)
          }}
        />
      ) : null}
    </div>
  )
}
