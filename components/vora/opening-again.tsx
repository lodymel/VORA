'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useVoraLocale } from './vora-locale'

/**
 * Return to the entrance — Me only.
 * Nothing to decorate. Just the word, when you mean to leave.
 */
export function OpeningAgain({
  onBeginAgain,
  className = '',
}: {
  onBeginAgain: () => void
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const { t } = useVoraLocale()

  return (
    <div className={`vora-opening-again ${className}`.trim()}>
      <p className="vora-opening-again-kicker">{t.opening}</p>
      <motion.button
        type="button"
        className="vora-opening-again-btn"
        onClick={onBeginAgain}
        aria-label={t.onceMore}
        whileTap={reduceMotion ? undefined : { opacity: 0.55 }}
        transition={{ duration: 0.18 }}
      >
        {t.onceMore}
      </motion.button>
    </div>
  )
}
