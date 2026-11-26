'use client'

import { useEffect, useRef, useState } from 'react'

// same characters the ASCII art on the home page is built from
const CHARS = ".';:!+*($W&@#"

// how often a still-scrambled letter may swap to a new character, in ms
const FLICKER_MS = 140
// chance that a scrambled letter swaps on each flicker, so they drift rather than strobe
const FLICKER_CHANCE = 0.25

type Props = {
  text: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3'
  className?: string
}

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

/**
 * Text that starts as random ASCII characters and settles into the real words as
 * it scrolls up the screen. Nothing moves unless the page is scrolling: stop and
 * the letters hold still. Screen readers always get the real text.
 */
export default function ScrambleText({ text, as: Tag = 'span', className = '' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // with reduced motion the real text simply stays put
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const letters = text.split('')
    // each letter settles at its own point: roughly left to right, with a little shuffle
    const thresholds = letters.map((_, i) => (i / Math.max(letters.length, 1)) * 0.75 + Math.random() * 0.25)
    const noise = letters.map(randomChar)
    let lastFlicker = 0
    let lastShown = ''
    let inView = false

    // 0 while the title sits low on the screen, 1 once it's reached about the middle
    const progress = () => {
      const vh = window.innerHeight
      const top = el.getBoundingClientRect().top
      const from = vh * 0.92
      const to = vh * 0.5
      return Math.min(Math.max((from - top) / (from - to), 0), 1)
    }

    const render = (flicker: boolean) => {
      const p = progress()
      const out = letters
        .map((ch, i) => {
          if (ch === ' ' || ch === '\n' || p >= thresholds[i]) return ch
          if (flicker && Math.random() < FLICKER_CHANCE) noise[i] = randomChar()
          return noise[i]
        })
        .join('')
      if (out !== lastShown) {
        lastShown = out
        setDisplay(out)
      }
    }

    const onScroll = () => {
      if (!inView) return
      const now = performance.now()
      const flicker = now - lastFlicker > FLICKER_MS
      if (flicker) lastFlicker = now
      render(flicker)
    }

    render(false)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      // catch up once when leaving, so a title flung past the top reads as settled
      render(false)
    })
    observer.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [text])

  return (
    <Tag ref={ref} className={`relative ${className}`} aria-label={text}>
      {/* the real text holds the size, so the scramble never shifts the layout */}
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {display}
      </span>
    </Tag>
  )
}
