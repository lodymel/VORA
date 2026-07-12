'use client'

import { ConstellationStar } from './constellation-star'
import { formatStarDateLabel } from './sky-date'
import type { Light } from './constants'
import type { MouseEvent } from 'react'

const HIT = 44 // px — fixed seat, centered with margins (no transform)

let overStarCount = 0
let overStarLeaveTimer = 0

function setPageOverStar(on: boolean) {
  const page = document.querySelector('.vora-sky-page--explore')
  if (!page) return
  page.classList.toggle('vora-sky-page--over-star', on)
}

function handleStarPointerEnter() {
  window.clearTimeout(overStarLeaveTimer)
  overStarCount += 1
  setPageOverStar(true)
}

function handleStarPointerLeave() {
  overStarCount = Math.max(0, overStarCount - 1)
  window.clearTimeout(overStarLeaveTimer)
  // Debounce leave — absorbs edge hit-test jitter
  overStarLeaveTimer = window.setTimeout(() => {
    if (overStarCount <= 0) setPageOverStar(false)
  }, 80)
}

/**
 * Constellation point — star first.
 * Date is a quiet signal: hover/focus on desktop, press + selected on touch.
 */
export function ConstellationNodeButton({
  light,
  x,
  y,
  size,
  twinkleDuration,
  twinkleDelay,
  active,
  dimmed,
  index,
  onToggle,
}: {
  light: Light
  x: number
  y: number
  size: number
  twinkleDuration: number
  twinkleDelay: number
  active: boolean
  dimmed: boolean
  index: number
  onToggle: (origin: { x: number; y: number }) => void
}) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    onToggle({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerEnter={handleStarPointerEnter}
      onPointerLeave={handleStarPointerLeave}
      className={`vora-constellation-node ${
        active ? 'vora-constellation-node--active' : ''
      } ${dimmed ? 'vora-constellation-node--dimmed' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: HIT,
        height: HIT,
        marginLeft: -HIT / 2,
        marginTop: -HIT / 2,
        opacity: dimmed ? 0.48 : 1,
        transitionDelay: `${Math.min(index * 0.06, 0.45)}s`,
      }}
      aria-label={`${light.date}: ${light.sentence}`}
      aria-pressed={active}
    >
      <span className="vora-constellation-node-date" aria-hidden="true">
        {formatStarDateLabel(light)}
      </span>
      <span className="vora-constellation-node-shimmer" aria-hidden="true" />
      <ConstellationStar
        size={size}
        active={active}
        twinkleDuration={twinkleDuration}
        twinkleDelay={twinkleDelay}
      />
    </button>
  )
}
