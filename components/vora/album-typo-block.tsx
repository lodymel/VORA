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
const FIT_FLOOR = 0.78

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
      root.style.setProperty('--vora-typo-fit-scale', '1')
      const box = root.clientWidth
      if (box <= 0) return

      let widest = 0
      root.querySelectorAll<HTMLElement>('.vora-album-typo-line').forEach((node) => {
        widest = Math.max(widest, node.scrollWidth)
      })
      if (widest <= 0) return

      const room = box * FIT_AIR
      const next = widest > room ? Math.max(FIT_FLOOR, room / widest) : 1
      root.style.setProperty('--vora-typo-fit-scale', String(next))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(root)
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
