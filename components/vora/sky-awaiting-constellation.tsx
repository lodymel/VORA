'use client'

import { motion, useReducedMotion } from 'motion/react'
import { VoraOStar } from './logo'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Empty sky — a sparse silhouette of possibility.
 * Few O-stars. Much air. Not a crowded preview of Lights.
 */
const PHANTOMS = [
  { x: 22, y: 42, size: 9, delay: 0 },
  { x: 38, y: 28, size: 13, delay: 0.12 },
  { x: 52, y: 36, size: 10, delay: 0.22 },
  { x: 64, y: 24, size: 15, delay: 0.32 },
  { x: 78, y: 40, size: 9, delay: 0.42 },
  { x: 46, y: 54, size: 8, delay: 0.28 },
  { x: 70, y: 58, size: 8, delay: 0.48 },
] as const

const LINES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 5],
  [3, 6],
]

export function SkyAwaitingConstellation({
  dissolving = false,
}: {
  dissolving?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="vora-sky-awaiting"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{
        opacity: dissolving ? 0 : 1,
        scale: dissolving ? (reduceMotion ? 1 : 1.02) : 1,
        filter: dissolving ? 'blur(5px)' : 'blur(0px)',
      }}
      transition={{ duration: dissolving ? 0.9 : 1.4, ease }}
    >
      <svg
        className="vora-sky-awaiting-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {LINES.map(([a, b], i) => {
          const from = PHANTOMS[a]
          const to = PHANTOMS[b]
          return (
            <motion.line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="vora-sky-awaiting-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: dissolving ? 0 : 0.22 }}
              transition={{ duration: 1.3, ease, delay: reduceMotion ? 0 : 0.4 + i * 0.08 }}
            />
          )
        })}
      </svg>

      {PHANTOMS.map((star, i) => (
        <motion.span
          key={i}
          className="vora-sky-awaiting-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            dissolving
              ? { opacity: 0, scale: 0.3 }
              : reduceMotion
                ? { opacity: 0.38, scale: 1 }
                : { opacity: [0.2, 0.42, 0.26], scale: [0.96, 1.04, 0.98] }
          }
          transition={
            dissolving
              ? { duration: 0.7, ease, delay: i * 0.04 }
              : reduceMotion
                ? { duration: 0.6, ease, delay: 0.2 + i * 0.05 }
                : {
                    duration: 5.2 + i * 0.35,
                    ease: 'easeInOut',
                    delay: 0.35 + star.delay,
                    repeat: Infinity,
                  }
          }
        >
          <VoraOStar size={star.size} />
        </motion.span>
      ))}
    </motion.div>
  )
}
