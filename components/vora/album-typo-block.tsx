'use client'

import { useLayoutEffect, useRef } from 'react'
import type { AlbumTypoLines } from './mirror-album-typo'
import { hasHangul } from './text-script'
import styles from './album-typo-block.module.css'

type Tone = 'sky' | 'card'

const CLASS = {
  sky: {
    title: 'vora-mirror-album-title',
    primary: 'vora-mirror-album-primary',
    accent: 'vora-mirror-album-accent',
    row: 'vora-album-typo-row',
    line: 'vora-album-typo-line',
  },
  card: {
    title: 'vora-light-card-title',
    primary: 'vora-light-card-primary',
    accent: 'vora-light-card-accent',
    row: 'vora-album-typo-row',
    line: 'vora-album-typo-line',
  },
} as const

/** Keep a quiet margin inside the measure — never flush to the edge. */
const FIT_AIR = 0.94
/** Floor so long Lights stay readable; budgets should usually avoid this. */
const FIT_FLOOR = 0.48

function TypoLines({
  lines,
  className,
  rowClass,
  lineClass,
}: {
  lines: string[]
  className: string
  rowClass: string
  lineClass: string
}) {
  if (lines.length === 0) return null
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={`${i}-${line}`} className={`${styles.row} ${rowClass}`}>
          <span className={`${styles.line} ${lineClass}`}>{line}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * Shared Sky + Card sentence render — explicit lines only, no free CSS wrap.
 * Each line sits in a full-width row so overflow centers (never LTR right-drift).
 * Fit-scale keeps the whole poster inside the measure with breathing room.
 */
export function AlbumTypoBlock({
  lines,
  tone,
  as: Tag = 'h1',
}: {
  lines: AlbumTypoLines
  tone: Tone
  as?: 'h1' | 'h2'
}) {
  const rootRef = useRef<HTMLHeadingElement>(null)
  const c = CLASS[tone]
  const hangul = hasHangul([...lines.primaryLines, ...lines.accentLines].join(''))
  const lineKey = [...lines.primaryLines, '|', ...lines.accentLines].join('\n')

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const fit = () => {
      const voices = root.querySelectorAll<HTMLElement>(
        '.vora-mirror-album-primary, .vora-mirror-album-accent, .vora-light-card-primary, .vora-light-card-accent',
      )
      voices.forEach((node) => node.style.removeProperty('font-size'))
      const naturalFontSizes = [...voices].map(
        (node) => Number.parseFloat(getComputedStyle(node).fontSize) || 16,
      )
      const box = root.clientWidth
      const parent = root.parentElement
      if (box <= 0 || !parent) return

      let widest = 0
      root.querySelectorAll<HTMLElement>('.vora-album-typo-line').forEach((node) => {
        widest = Math.max(widest, node.scrollWidth)
      })
      if (widest <= 0) return

      const room = box * FIT_AIR
      const widthScale = widest > room ? room / widest : 1

      // The card body also has a fixed star and gap. Fit the complete line stack
      // into the remaining height so long Korean cannot disappear below the card.
      const parentStyle = getComputedStyle(parent)
      const gap = Number.parseFloat(parentStyle.rowGap || parentStyle.gap || '0') || 0
      const siblings = [...parent.children].filter((node) => node !== root) as HTMLElement[]
      const siblingHeight = siblings.reduce((sum, node) => sum + node.offsetHeight, 0)
      const gapCount = Math.max(0, parent.children.length - 1)
      const heightRoom = Math.max(1, (parent.clientHeight - siblingHeight - gap * gapCount) * FIT_AIR)
      const naturalHeight = root.scrollHeight
      const heightScale = naturalHeight > heightRoom ? heightRoom / naturalHeight : 1
      const next = Math.max(FIT_FLOOR, Math.min(widthScale, heightScale, 1))
      voices.forEach((node, index) => {
        if (next < 0.999) node.style.fontSize = `${naturalFontSizes[index] * next}px`
      })
    }

    fit()
    const ro = new ResizeObserver(fit)
    const fitContainer = root.parentElement
    if (fitContainer) ro.observe(fitContainer)
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(fit)
    }
    return () => ro.disconnect()
  }, [lineKey, tone])

  return (
    <Tag
      ref={rootRef}
      className={`${c.title}${hangul ? ' vora-lang-ko' : ''}`}
      lang={hangul ? 'ko' : undefined}
    >
      <TypoLines
        lines={lines.primaryLines}
        className={c.primary}
        rowClass={c.row}
        lineClass={c.line}
      />
      {lines.accentLines.length > 0 ? (
        <TypoLines
          lines={lines.accentLines}
          className={c.accent}
          rowClass={c.row}
          lineClass={c.line}
        />
      ) : null}
    </Tag>
  )
}
