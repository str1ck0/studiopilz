'use client'

import { useEffect, useRef, useState } from 'react'

// same characters the ASCII art on the home page is built from
const CHARS = ".';:!+*($W&@#"

type Props = {
  text: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3'
  className?: string
  /** how long the scramble takes to settle, in ms */
  duration?: number
}

/**
 * Text that runs through random ASCII characters before settling into the real
 * words, the first time it scrolls into view. Screen readers get the real text.
 */
export default function ScrambleText({ text, as: Tag = 'span', className = '', duration = 900 }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // with reduced motion the real text simply stays put
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let last = 0
    const scramble = (settled: number) =>
      text
        .split('')
        .map((ch, i) => (i < settled || ch === ' ' || ch === '\n' ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join('')

    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        // repaint about 30 times a second so the characters flicker, not blur
        if (now - last > 33 || t === 1) {
          last = now
          setDisplay(t === 1 ? text : scramble(Math.floor(t * text.length)))
        }
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      setDisplay(scramble(0))
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [text, duration])

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
