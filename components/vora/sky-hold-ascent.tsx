'use client'

import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

/** Light rises from the ritual headline into the constellation band. */
export function SkyHoldAscent({
  from,
  to,
  onComplete,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  onComplete: () => void
}) {
  const reduceMotion = useReducedMotion()
  const doneRef = useRef(false)

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    onComplete()
  }

  if (reduceMotion) {
    return (
      <motion.div
        className="vora-sky-ascent-seed"
        style={{ left: to.x, top: to.y }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 1] }}
        transition={{ duration: 0.55, ease }}
        onAnimationComplete={finish}
        aria-hidden="true"
      />
    )
  }

  const dx = to.x - from.x
  const dy = to.y - from.y

  return (
    <motion.div
      className="vora-sky-ascent-seed"
      style={{ left: from.x, top: from.y }}
      initial={{ opacity: 0, scale: 0.35, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0.85, 0],
        scale: [0.35, 1.15, 1, 0.7, 0.35],
        x: [0, dx * 0.15, dx * 0.55, dx],
        y: [0, dy * 0.08, dy * 0.45, dy],
      }}
      transition={{ duration: 1.65, ease, times: [0, 0.18, 0.55, 0.82, 1] }}
      onAnimationComplete={finish}
      aria-hidden="true"
    >
      <span className="vora-sky-ascent-spark" />
    </motion.div>
  )
}
