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
  const c = CLASS[tone]
  const hangul = hasHangul([...lines.primaryLines, ...lines.accentLines].join(''))
  return (
    <Tag
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
