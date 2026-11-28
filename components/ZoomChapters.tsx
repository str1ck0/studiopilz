'use client'

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

export type Chapter = { title: string; body: ReactNode }

/**
 * The studio page as a few quiet chapters. Each one reads like an ordinary page section;
 * only at the seams does anything move: a chapter eases gently back as it ends, the next
 * comes forward, and its title turns from glyphs into letters as it arrives.
 */
export default function ZoomChapters({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="flex flex-col">
      {chapters.map((chapter, i) => (
        <ZoomChapter key={chapter.title} chapter={chapter} index={i} first={i === 0} />
      ))}
    </div>
  )
}

function ZoomChapter({ chapter, index, first }: { chapter: Chapter; index: number; first: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // coming forward: from when its top enters the screen until it's a little above the middle
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.4'] })
  // easing back: as its end climbs from the middle to near the top
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ['end 0.6', 'end 0.1'] })

  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  const e = (v: number) => (first ? 1 : ease(v))
  const scale = useTransform([enter, leave], ([a, b]: number[]) => (0.94 + 0.06 * e(a)) * (1 - 0.04 * b))
  const opacity = useTransform([enter, leave], ([a, b]: number[]) => (first ? 1 : Math.min(a * 1.6, 1)) * (1 - 0.6 * b))

  return (
    <motion.section
      ref={ref}
      aria-labelledby={`chapter-${index}`}
      className="relative flex min-h-[100svh] flex-col justify-center py-24 md:py-32"
      style={reduce ? undefined : { scale, opacity }}
    >
      <div className="mb-10 flex items-baseline gap-4 md:mb-14">
        <span className="font-mono text-sm opacity-50">{String(index + 1).padStart(2, '0')}</span>
        <h2
          id={`chapter-${index}`}
          aria-label={chapter.title}
          className="break-words font-semibold lowercase leading-[0.9] tracking-[-0.05em]"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
        >
          <SymbolTitle text={chapter.title.toLowerCase()} />
        </h2>
      </div>
      {chapter.body}
    </motion.section>
  )
}

// odd glyphs that stand in for the letters until they're read
const GLYPHS = '◐◑◒◓□■○●△▽◇⊓⊔⊏⊐↯∞ʘɸƎИʁʕ⌐¬ʎ'

/**
 * A title that starts as glyphs, one per letter, and turns into its letters left to right
 * as it's scrolled into view; scrolling back up turns it back. Each glyph sits inside its
 * letter's own box, so the title never shifts and nothing overlaps.
 */
function SymbolTitle({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  // from when the title enters at the bottom until it's a little above the middle
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.45'] })
  const cells = useRef<{ letter: HTMLElement; glyph: HTMLElement }[]>([])

  const render = (p: number) => {
    const list = cells.current
    const settled = reduce ? list.length : Math.floor(p * (list.length + 1))
    // the waiting glyphs change as you scroll, a step at a time
    const step = Math.floor(p * 24)
    list.forEach((c, i) => {
      const done = i < settled
      c.letter.style.visibility = done ? '' : 'hidden'
      const g = done ? '' : GLYPHS[((Math.imul(i + 1, 2654435761) ^ Math.imul(step + 1, 40503)) >>> 0) % GLYPHS.length]
      if (c.glyph.textContent !== g) c.glyph.textContent = g
    })
  }

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const fit = () => {
      // each glyph as big as its letter allows, never wider
      const size = parseFloat(getComputedStyle(root).fontSize)
      cells.current = [...root.querySelectorAll<HTMLElement>('[data-cell]')].map((el) => {
        const glyph = el.lastElementChild as HTMLElement
        glyph.style.fontSize = `${Math.min(size * 0.72, el.offsetWidth * 1.05).toFixed(1)}px`
        return { letter: el.firstElementChild as HTMLElement, glyph }
      })
      render(scrollYProgress.get())
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduce])

  useMotionValueEvent(scrollYProgress, 'change', render)

  // words stay whole when the title wraps; each letter is a cell its glyph sits inside
  return (
    <span ref={ref} aria-hidden>
      {text.split(' ').map((word, w, words) => (
        <span key={w}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => (
              <span key={i} data-cell className="relative inline-block">
                <span>{ch}</span>
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden font-bold leading-none tracking-normal" />
              </span>
            ))}
          </span>
          {w < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}
