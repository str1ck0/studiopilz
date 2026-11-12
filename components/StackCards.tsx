'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import ScrambleText from './ScrambleText'

export type StackCard = { title: string; body: ReactNode }

// clears the fixed navigation bar
const NAV_OFFSET = 96
// how much of each earlier card's header stays visible above the next one
const PEEK = 56

/**
 * Numbered cards that pin as you scroll. Each new card slides over the last,
 * which shrinks and tilts back, leaving its number and title peeking out on top.
 */
export default function StackCards({ cards }: { cards: StackCard[] }) {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tops: number[] = []

    // Pin each card just below the previous card's header. A card taller than the
    // screen pins by its bottom edge instead, so all of its text can still be read.
    const layout = () => {
      wrapRefs.current.forEach((wrap, i) => {
        if (!wrap) return
        const wanted = NAV_OFFSET + i * PEEK
        const top = Math.min(wanted, window.innerHeight - wrap.offsetHeight - 16)
        tops[i] = top
        wrap.style.top = `${top}px`
      })
      update()
    }

    const update = () => {
      if (reduced) return
      const vh = window.innerHeight
      cardRefs.current.forEach((card, i) => {
        const next = wrapRefs.current[i + 1]
        if (!card || !next) return
        // 0 while the next card is still below the screen, 1 once it has pinned
        const nextTop = next.getBoundingClientRect().top
        const range = Math.max(vh - (tops[i + 1] ?? NAV_OFFSET), 1)
        const p = Math.min(Math.max((vh - nextTop) / range, 0), 1)
        const tilt = i % 2 === 0 ? -1.5 : 1.5
        card.style.transform = `scale(${1 - p * 0.06}) rotate(${p * tilt}deg)`
        const shade = shadeRefs.current[i]
        if (shade) shade.style.opacity = String(p * 0.2)
      })
    }

    layout()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', layout)
    const observer = new ResizeObserver(layout)
    wrapRefs.current.forEach((wrap) => wrap && observer.observe(wrap))
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', layout)
      observer.disconnect()
    }
  }, [cards.length])

  return (
    <div className="relative flex flex-col gap-6 md:gap-10">
      {cards.map((card, i) => (
        <div
          key={card.title}
          ref={(el) => {
            wrapRefs.current[i] = el
          }}
          className="sticky"
          style={{ top: NAV_OFFSET + i * PEEK, zIndex: i + 1 }}
        >
          <div
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="relative origin-top overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-[0_-24px_60px_-36px_rgba(0,0,0,0.45)] will-change-transform"
          >
            <div className="flex items-baseline gap-4 border-b border-foreground/10 px-5 py-4 md:px-8">
              <span className="font-mono text-sm opacity-50">{String(i + 1).padStart(2, '0')}</span>
              <ScrambleText as="h2" text={card.title} className="text-lg font-bold tracking-tight md:text-xl" />
            </div>
            <div className="px-5 py-6 md:px-8 md:py-10">{card.body}</div>
            {/* darkens a card as it's pushed to the back */}
            <div
              ref={(el) => {
                shadeRefs.current[i] = el
              }}
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black opacity-0"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
