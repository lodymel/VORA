'use client'

import { useEffect, useRef, useState } from 'react'
import {
  distillReflection,
  hasMeaningfulContent,
  pickGentleInvite,
} from '../distill-reflection'
import { MirrorBottomSheet } from '../mirror-bottom-sheet'
import { MirrorLightStar } from '../mirror-light-star'
import { MirrorOval } from '../mirror-oval'
import { MirrorPageShell } from '../mirror-page-shell'
import { MirrorReflectionView } from '../mirror-reflection-view'
import { MirrorStage } from '../mirror-stage'
import { pickRandom, SPARK_PROMPTS } from '../constants'
import { MirrorPedestalSpacer, WriteLightPedestal } from '../write-light-pedestal'
import { voraAudio } from '../vora-audio'

type Phase = 'writing' | 'review' | 'creating' | 'complete'
type Sheet = 'none' | 'edit' | 'read'

const MAX_DRAFT_LENGTH = 280

/** Creating Light beat timings (ms) — stillness → star ignite → bloom → ascend → complete */
const CREATING_BEATS = {
  stillness: 400,
  ignite: 560,
  bloom: 1220,
  peak: 1900,
  ascend: 2700,
  complete: 3800,
} as const

export function WriteLightFlow({
  onCreateAccount,
  onDismiss,
  onCancel,
}: {
  onCreateAccount: (sentence: string) => void
  onDismiss: (sentence: string) => void
  onCancel: () => void
}) {
  const [phase, setPhase] = useState<Phase>('writing')
  const [creatingStep, setCreatingStep] = useState(0)
  const [draft, setDraft] = useState('')
  const [reflection, setReflection] = useState('')
  const [invite, setInvite] = useState<string | null>(null)
  const [sheet, setSheet] = useState<Sheet>('none')
  const [prompt] = useState(() => pickRandom(SPARK_PROMPTS))
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase !== 'writing') return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'creating') return

    void voraAudio.unlock()

    const timers = [
      window.setTimeout(() => {
        setCreatingStep(1)
        voraAudio.cue('spark')
      }, CREATING_BEATS.ignite),
      window.setTimeout(() => {
        setCreatingStep(2)
        voraAudio.cue('hold')
      }, CREATING_BEATS.bloom),
      window.setTimeout(() => setCreatingStep(3), CREATING_BEATS.peak),
      window.setTimeout(() => {
        setCreatingStep(4)
        voraAudio.cue('card')
      }, CREATING_BEATS.ascend),
      window.setTimeout(() => {
        setCreatingStep(0)
        setPhase('complete')
      }, CREATING_BEATS.complete),
    ]

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [phase])

  function goToReview(raw: string) {
    const trimmed = raw.trim()
    if (!hasMeaningfulContent(trimmed)) return
    setReflection(distillReflection(trimmed))
    setInvite(null)
    void voraAudio.unlock()
    voraAudio.cue('write')
    setPhase('review')
  }

  function handleContinue() {
    const trimmed = draft.trim()
    if (!hasMeaningfulContent(trimmed)) {
      setInvite(pickGentleInvite())
      return
    }
    goToReview(trimmed)
  }

  function tryAgain() {
    setReflection('')
    setInvite(null)
    setDraft('')
    setSheet('none')
    setCreatingStep(0)
    setPhase('writing')
  }

  function createLight() {
    if (!reflection.trim()) return
    setCreatingStep(0)
    setPhase('creating')
  }

  const pedestalActions =
    phase === 'writing' ? (
      <WriteLightPedestal
        primaryLabel="Continue"
        onPrimary={handleContinue}
        primaryDisabled={!draft.trim()}
        onSecondary={onCancel}
        secondaryLabel="Step back"
      />
    ) : phase === 'review' ? (
      <WriteLightPedestal
        primaryLabel="Create Light"
        onPrimary={createLight}
        primaryDisabled={!reflection.trim()}
        onSecondary={onCancel}
        links={[
          { label: 'Write again', onClick: tryAgain },
          { label: 'Step back', onClick: onCancel },
        ]}
      />
    ) : phase === 'complete' ? (
      <WriteLightPedestal
        primaryLabel="Create account"
        onPrimary={() => onCreateAccount(reflection)}
        onSecondary={() => onDismiss(reflection)}
        secondaryLabel="Not now"
      />
    ) : (
      <MirrorPedestalSpacer />
    )

  const starWrapClass = [
    'vora-mirror-creating-star-wrap',
    creatingStep >= 1 ? 'vora-mirror-creating-star-wrap--ignite' : '',
    creatingStep >= 2 ? 'vora-mirror-creating-star-wrap--bloom' : '',
    creatingStep >= 4 ? 'vora-mirror-creating-star-wrap--ascend' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const mirrorContent = (
    <MirrorOval
      bright={phase === 'review' || phase === 'creating'}
      creating={phase === 'creating'}
      creatingStep={creatingStep}
    >
      <div className="vora-mirror-oval-inner">
        <div className="vora-mirror-state-stack vora-mirror-state-stack--flow">
          <div
            className={`vora-mirror-state ${phase === 'writing' ? 'vora-mirror-state--active' : ''}`}
            aria-hidden={phase !== 'writing'}
          >
            <div className="vora-mirror-writing vora-mirror-writing--compact">
              <p className="vora-mirror-todays-kicker">Your Light</p>
              <p className="vora-mirror-writing-prompt text-balance">{prompt.title}</p>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (invite) setInvite(null)
                }}
                maxLength={MAX_DRAFT_LENGTH}
                rows={2}
                className="vora-mirror-oval-input"
                placeholder="Write a sentence you believe…"
                aria-label="Write your Light"
              />
              <div className="vora-mirror-invite-slot" aria-live="polite">
                {invite ? <p className="vora-mirror-invite text-balance">{invite}</p> : null}
              </div>
            </div>
          </div>

          <div
            className={`vora-mirror-state ${
              phase === 'review' || (phase === 'creating' && creatingStep < 1)
                ? 'vora-mirror-state--active'
                : ''
            } ${phase === 'creating' && creatingStep >= 1 ? 'vora-mirror-state--exit' : ''}`}
            aria-hidden={phase !== 'review' && !(phase === 'creating' && creatingStep < 1)}
          >
            <MirrorReflectionView
              text={reflection}
              onReadMore={() => setSheet('read')}
              onEdit={() => setSheet('edit')}
            />
          </div>

          <div
            className={`vora-mirror-state ${
              phase === 'creating' && creatingStep >= 1 ? 'vora-mirror-state--active' : ''
            }`}
            aria-hidden={phase !== 'creating' || creatingStep < 1}
            aria-live="polite"
          >
            <div className="vora-mirror-creating-stage">
              <div className={starWrapClass}>
                <MirrorLightStar
                  emerging={creatingStep >= 1 && creatingStep < 2}
                  intense={creatingStep >= 3}
                />
              </div>
              <p
                className={`vora-mirror-creating-label ${
                  creatingStep >= 2 ? 'vora-mirror-creating-label--visible' : ''
                }`}
              >
                Creating your Light…
              </p>
            </div>
          </div>

          <div
            className={`vora-mirror-state ${phase === 'complete' ? 'vora-mirror-state--active' : ''}`}
            aria-hidden={phase !== 'complete'}
          >
            <div className="vora-mirror-complete-stage">
              <MirrorLightStar />
              <p className="vora-mirror-complete text-balance">
                Your Light has been added to your Sky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MirrorOval>
  )

  return (
    <div className="absolute inset-0 z-50">
      <MirrorPageShell
        showHeader={phase !== 'complete'}
        atmosphere={phase === 'review' || phase === 'creating' ? 'night' : 'celestial'}
        className={
          phase === 'creating'
            ? 'vora-mirror-shell--creating'
            : phase === 'review'
              ? 'vora-mirror-shell--review'
              : ''
        }
      >
        <MirrorStage mirror={mirrorContent} pedestal={pedestalActions} />
      </MirrorPageShell>

      <MirrorBottomSheet
        open={sheet === 'read'}
        title="Your reflection"
        onClose={() => setSheet('none')}
      >
        <p className="vora-mirror-sheet-body vora-mirror-sheet-body--serif">{reflection}</p>
      </MirrorBottomSheet>

      <MirrorBottomSheet open={sheet === 'edit'} title="Edit reflection" onClose={() => setSheet('none')}>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={5}
          className="vora-mirror-sheet-input vora-mirror-sheet-input--serif"
          aria-label="Edit your reflection"
        />
        <button
          type="button"
          onClick={() => setSheet('none')}
          className="vora-pill vora-pill--mirror mt-6 w-full"
        >
          Save
        </button>
      </MirrorBottomSheet>
    </div>
  )
}
