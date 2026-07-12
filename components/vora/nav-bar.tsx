'use client'

import { motion } from 'motion/react'
import { AppMetaBar } from './enter-chrome'
import { DEFAULT_SKY_THEME, type SkyThemeId } from './light-card-theme'

export type Tab = 'sky' | 'profile'

const items: { id: Tab; label: string }[] = [
  { id: 'sky', label: 'Sky' },
  { id: 'profile', label: 'Me' },
]

/** Soft liquid settle — weight in the middle, quiet land */
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 32,
  mass: 0.85,
}

/** Bottom tabs — glass shell, one liquid thumb that slides. */
export function NavBar({
  active,
  onChange,
  tone = 'dark',
  skyTheme = DEFAULT_SKY_THEME,
  onBeginAgain,
}: {
  active: Tab
  onChange: (t: Tab) => void
  tone?: 'light' | 'dark'
  skyTheme?: SkyThemeId
  onBeginAgain?: () => void
}) {
  const dark = tone === 'dark'
  const index = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  return (
    <nav
      className={`vora-tabbar ${dark ? 'vora-tabbar--night' : 'vora-tabbar--day'}`}
      data-sky-theme={skyTheme}
      aria-label="Main"
    >
      <div className="vora-tabbar-list" role="tablist">
        <motion.span
          className="vora-tabbar-liquid"
          aria-hidden="true"
          initial={false}
          animate={{
            x: index === 0 ? 0 : 'calc(100% + 0.15rem)',
          }}
          transition={liquidSpring}
        />
        {items.map(({ id, label }) => {
          const current = active === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={current}
              onClick={() => onChange(id)}
              className={`vora-tabbar-item ${current ? 'vora-tabbar-item--current' : ''}`}
            >
              <span className="vora-tabbar-label">{label}</span>
            </button>
          )
        })}
      </div>
      <div className="vora-tabbar-meta">
        <AppMetaBar
          tone={dark ? 'night' : 'day'}
          skyTheme={skyTheme}
          onBeginAgain={onBeginAgain}
        />
      </div>
    </nav>
  )
}
