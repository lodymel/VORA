'use client'

import { motion, useReducedMotion } from 'motion/react'

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

  return (
    <div className={`vora-opening-again ${className}`.trim()}>
      <p className="vora-opening-again-kicker">Opening</p>
      <motion.button
        type="button"
        className="vora-opening-again-btn"
        onClick={onBeginAgain}
        aria-label="Return to the opening"
        whileTap={reduceMotion ? undefined : { opacity: 0.55 }}
        transition={{ duration: 0.18 }}
      >
        Once more.
      </motion.button>
    </div>
  )
}
