'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'

/**
 * Wraps an image so it comes alive as it scrolls through the screen.
 * Every image gets its own temperament from its seed: some start black and white
 * and flush with colour, some start small and soft and grow into focus, some do both,
 * each at its own pace. As they scroll away they fade back a little, so the page
 * never sits still. The same seed always behaves the same way.
 */

type Temperament = {
  colour: boolean
  focus: boolean
  /** where along its pass through the screen it is fully in bloom */
  peakStart: number
  peakEnd: number
  /** how much bloom it keeps as it leaves (1 = all of it) */
  linger: number
  /** starting size and softness when growing into focus */
  from: number
  blur: number
  tilt: number
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function temperament(seed: string): Temperament {
  let h = hash(seed)
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const kind = Math.floor(next() * 3) // 0 colour, 1 focus, 2 both
  return {
    colour: kind !== 1,
    focus: kind !== 0,
    peakStart: 0.28 + next() * 0.17,
    peakEnd: 0.55 + next() * 0.17,
    linger: 0.25 + next() * 0.45,
    from: 0.8 + next() * 0.12,
    blur: 2 + next() * 3,
    tilt: (next() - 0.5) * 3,
  }
}

export default function ScrollBloom({
  seed,
  leaveOnly = false,
  className = '',
  style,
  children,
}: {
  seed: string
  /** for an image that's already on screen when the page opens: start in full bloom, only fade on the way out */
  leaveOnly?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const t = useMemo(() => temperament(seed), [seed])
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: leaveOnly ? ['start start', 'end start'] : ['start end', 'end start'],
  })
  const bloom = useTransform(
    scrollYProgress,
    leaveOnly ? [0, 1] : [0, t.peakStart, t.peakEnd, 1],
    leaveOnly ? [1, t.linger] : [0, 1, 1, t.linger],
  )
  const filter = useTransform(bloom, (b) => {
    const parts = []
    if (t.colour) parts.push(`grayscale(${(1 - b).toFixed(3)})`)
    if (t.focus && b < 0.999) parts.push(`blur(${((1 - b) * t.blur).toFixed(2)}px)`)
    return parts.join(' ') || 'none'
  })
  const scale = useTransform(bloom, (b) => (t.focus ? t.from + (1 - t.from) * b : 1))
  const rotate = useTransform(bloom, (b) => (t.focus ? (1 - b) * t.tilt : 0))

  return (
    <motion.div ref={ref} className={className} style={reduce ? style : { ...style, filter, scale, rotate }}>
      {children}
    </motion.div>
  )
}
