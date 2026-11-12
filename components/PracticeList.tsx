'use client'

import { useEffect, useRef, useState } from 'react'

export type Offering = { title: string; description: string }

// the practice areas behind our offerings, each with a few words on what's in it
const PRACTICE = [
  { title: 'Creative Code', tags: 'touchdesigner, python, p5.js, three.js, osc' },
  { title: 'CRT Signal Chains', tags: 'salvaged tvs, video synthesis, live feeds' },
  { title: 'Audio-Reactive', tags: 'sound, sensors, light, environment' },
  { title: 'AI Systems', tags: 'whisper, ollama, image & video generation' },
  { title: '3D & Fabrication', tags: 'blender, cad, 3d printing' },
]

const OFFERING_TAGS = ['site-specific, interactive, live av', 'websites, web apps, experiences', 'identity, art direction, print']

// where each row sits across the full width: pushed left, right or in between.
// Rows are aligned rather than offset, so a long one can never run off screen.
const PLACEMENT: { justify: 'flex-start' | 'center' | 'flex-end'; nudge: string }[] = [
  { justify: 'flex-start', nudge: '0%' },
  { justify: 'flex-end', nudge: '6%' },
  { justify: 'center', nudge: '0%' },
  { justify: 'flex-start', nudge: '12%' },
  { justify: 'flex-end', nudge: '0%' },
  { justify: 'flex-start', nudge: '4%' },
  { justify: 'center', nudge: '10%' },
  { justify: 'flex-end', nudge: '14%' },
]

const CHARS = ".';:!+*($W&@#"

/** a row title that scrambles through ASCII characters each time it's activated */
function Title({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text)
  useEffect(() => {
    let frame = 0
    // leaving mid-scramble snaps straight back to the real word
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame = requestAnimationFrame(() => setDisplay(text))
      return () => cancelAnimationFrame(frame)
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / 320, 1)
      const settled = Math.floor(t * text.length)
      setDisplay(
        t === 1
          ? text
          : text
              .split('')
              .map((ch, i) => (i < settled || ch === ' ' ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
              .join(''),
      )
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, text])
  return (
    <span className="relative">
      <span className="invisible">{text}</span>
      <span aria-hidden className="absolute inset-0">
        {display}
      </span>
    </span>
  )
}

/**
 * What we do, as big mono rows spread across the page. Hovering (or tapping) a
 * row fills it in through a flash of stripes while its title scrambles.
 */
export default function PracticeList({ offerings }: { offerings: Offering[] }) {
  const lastPointer = useRef('mouse')
  const [active, setActive] = useState<number | null>(null)

  const rows = [...offerings.map((o, i) => ({ title: o.title, tags: OFFERING_TAGS[i] ?? '' })), ...PRACTICE]

  return (
    <ul
      className="flex flex-col gap-2 md:gap-3"
      onPointerDownCapture={(e) => {
        lastPointer.current = e.pointerType
      }}
      onPointerLeave={() => setActive(null)}
    >
      {rows.map((row, i) => {
        const on = active === i
        const place = PLACEMENT[i % PLACEMENT.length]
        const tagsFirst = place.justify === 'flex-end'
        return (
          <li
            key={row.title}
            className="flex"
            style={{
              justifyContent: place.justify,
              paddingLeft: place.justify === 'flex-start' ? place.nudge : undefined,
              paddingRight: place.justify === 'flex-end' ? place.nudge : undefined,
            }}
          >
            <button
              type="button"
              aria-label={`${row.title}: ${row.tags}`}
              aria-pressed={on}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => {
                if (lastPointer.current !== 'mouse') setActive((prev) => (prev === i ? null : i))
              }}
              className={`relative inline-flex max-w-full flex-wrap items-baseline gap-x-5 gap-y-1 overflow-hidden px-3 py-1.5 text-left transition-colors duration-200 md:px-5 md:py-2 ${
                on ? 'text-background' : 'bg-foreground/[0.05] text-foreground'
              } ${tagsFirst ? 'flex-row-reverse justify-end' : ''}`}
            >
              {/* the fill: wipes in in steps, with stripes flashing across */}
              <span
                aria-hidden
                className="absolute inset-0 bg-foreground"
                style={{ clipPath: on ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)', transition: 'clip-path 260ms steps(5)' }}
              />
              {on && (
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,var(--background)_0px,var(--background)_2px,transparent_2px,transparent_6px)] motion-safe:animate-[row-stripes_420ms_steps(4)_forwards] motion-reduce:hidden"
                />
              )}
              <span className="relative font-mono text-[clamp(1.75rem,6.2vw,6rem)] uppercase leading-none tracking-tight">
                <Title text={row.title} active={on} />
              </span>
              <span className="relative max-w-[18rem] font-mono text-[10px] uppercase leading-snug tracking-wider opacity-60 md:text-[11px]">
                {row.tags}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
