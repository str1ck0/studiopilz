'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { T, doorAt, fadeWindow, makeTimeline } from './mycelium/timeline'
import { setHomeHero } from '@/lib/spores'
import { MENU_CLOSED, openMenu } from '@/lib/menu'

// Three.js is client-only
const MyceliumScene = dynamic(() => import('./mycelium/MyceliumScene'), { ssr: false })
const ASCIIText = dynamic(() => import('./AsciiText'), { ssr: false })

// the logo, split in two: "studio" is its top half, "↑pilz" its bottom half
const STUDIO_CROP: [number, number, number, number] = [0, 0, 1, 0.49]
const PILZ_CROP: [number, number, number, number] = [0.19, 0.5, 0.81, 0.5]

// the four lines of the journey, drawn as living ASCII
const PHRASES = [
  'welcome',
  'bring\ncuriosity',
  'let us bend\nyour\nperception',
  'leave with\nnewborn\nwonder',
]

function show(el: HTMLElement | null, opacity: number, rise = 24) {
  if (!el) return
  el.style.opacity = String(opacity)
  el.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible'
  el.style.transform = `translateY(${(1 - opacity) * rise}px)`
}

// mushroom → threads → dive → back out over the whole network → into the glass mushroom, which opens the menu
const TIMELINE = makeTimeline()

export default function HomeJourney() {
  const timeline = TIMELINE

  const sectionRef = useRef<HTMLElement>(null)
  // scroll position in viewport heights — drives the whole scene
  const journeyRef = useRef(0)
  const hintRef = useRef<HTMLDivElement>(null)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const curiosityRef = useRef<HTMLDivElement>(null)
  const wonderRef = useRef<HTMLDivElement>(null)
  const asciiRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const studioRef = useRef<HTMLDivElement>(null)
  const pilzRef = useRef<HTMLDivElement>(null)
  // the ASCII logo only exists while the landing is on screen
  const [logoMounted, setLogoMounted] = useState(true)
  // which phrase the ASCII layer is drawing
  const [phrase, setPhrase] = useState(0)
  // the warm light that fills the screen as we arrive inside the mushroom
  const veilRef = useRef<HTMLDivElement>(null)
  // the menu opens once per glide in; scrolling back out a little arms it again
  const armed = useRef(true)

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      let u = Math.min(Math.max(-rect.top / window.innerHeight, 0), timeline.total)
      // dev only: ?u=3.2 freezes the journey at a point, handy for screenshots
      if (process.env.NODE_ENV === 'development') {
        const forced = new URLSearchParams(window.location.search).get('u')
        if (forced !== null) u = Number(forced)
      }
      journeyRef.current = u

      // the navbar stays hidden through the opening scene; as the camera pulls back
      // out of the dive, it appears and the drifting spores swoosh into its logo
      const hero = u < timeline.endStart + T * 0.1
      document.documentElement.dataset.hero = hero ? 'on' : 'off'
      setHomeHero(hero)

      // the glide into the mushroom at the very end
      const door = doorAt(timeline, u)

      // the two halves of the logo part like curtains as the threads spread out
      const away = Math.min(Math.max(u / 0.45, 0), 1)
      const wide = window.innerWidth >= 768
      const halves: [HTMLDivElement | null, number][] = [
        [studioRef.current, -1],
        [pilzRef.current, 1],
      ]
      for (const [el, side] of halves) {
        if (!el) continue
        const shift = away * away * 30 * side
        el.style.opacity = String(1 - away)
        el.style.filter = away > 0 ? `blur(${away * 5}px)` : ''
        el.style.transform = wide ? `translateX(${shift}vw)` : `translateY(${shift}vh)`
        el.style.visibility = away >= 1 ? 'hidden' : 'visible'
      }
      const wantLogo = u < 0.6
      setLogoMounted((prev) => (prev === wantLogo ? prev : wantLogo))
      const windows = [
        fadeWindow(u, 0.45, 1.25),
        fadeWindow(u, 1.3, 1.95),
        fadeWindow(u, 1.95, 2.55, 0.14),
        Math.min(Math.max((u - timeline.endStart - T * 0.6) / 0.3, 0), 1) * Math.max(1 - door * 4, 0),
      ]
      // "scroll" nudges on the landing, and again while resting over the network
      const resting = Math.min(Math.max((u - timeline.endStart - T) / 0.3, 0), 1) * Math.max(1 - door * 6, 0)
      show(hintRef.current, Math.max(1 - u / 0.15, resting), 0)
      show(welcomeRef.current, windows[0])
      show(curiosityRef.current, windows[1])
      show(wonderRef.current, windows[3])

      // one ASCII layer shows whichever phrase is current; it swaps text while invisible
      show(asciiRef.current, Math.max(...windows), 0)
      // (each swap happens while the layer is faded out, between two windows)
      const next = u < 1.275 ? 0 : u < 1.95 ? 1 : u < 2.6 ? 2 : 3
      setPhrase((prev) => (prev === next ? prev : next))

      if (veilRef.current) veilRef.current.style.opacity = String(Math.min(Math.max((door - 0.55) / 0.4, 0), 1))
      // inside: the menu opens
      if (door >= 0.92 && armed.current) {
        armed.current = false
        openMenu()
      } else if (door < 0.7) armed.current = true

      // in the closing scene the threads melt into the page instead of ending in a hard edge
      if (sceneRef.current) {
        const closing = Math.min(Math.max((u - timeline.endStart) / T, 0), 1)
        const mask =
          closing > 0 ? `linear-gradient(to bottom, #000 55%, rgba(0,0,0,${1 - closing}) 100%)` : ''
        sceneRef.current.style.maskImage = mask
        sceneRef.current.style.webkitMaskImage = mask
      }
    }
    // closing the menu from inside the mushroom drifts back out to the network
    const onMenuClosed = () => {
      if (doorAt(timeline, journeyRef.current) < 0.9 || !sectionRef.current) return
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top + (timeline.doorStart - 0.35) * window.innerHeight, behavior: 'smooth' })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    window.addEventListener(MENU_CLOSED, onMenuClosed)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener(MENU_CLOSED, onMenuClosed)
      delete document.documentElement.dataset.hero
      setHomeHero(false)
    }
  }, [timeline])

  const definition = 'max-w-md text-sm md:text-base leading-relaxed'
  const layer = 'pointer-events-none absolute inset-0 flex p-6 pb-12 md:p-16 opacity-0 will-change-transform'

  return (
    <section
      ref={sectionRef}
      data-hero-journey
      className="relative"
      style={{ height: `${(timeline.total + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={sceneRef} className="absolute inset-0">
          <MyceliumScene journeyRef={journeyRef} timeline={timeline} />
        </div>

        {/* landing: the mushroom between "studio" and "pilz", and a quiet nudge */}
        <p className="sr-only">studio pilz</p>
        <div
          ref={studioRef}
          className="pointer-events-none absolute inset-x-0 top-[3vh] h-[22vh] md:inset-x-auto md:left-[3vw] md:top-[30vh] md:h-[34vh] md:w-[36vw] mix-blend-difference will-change-transform"
        >
          {logoMounted && (
            <ASCIIText
              imageSrc="/studiopilz_logo.svg"
              imageCrop={STUDIO_CROP}
              asciiFontSize={6}
              textFontSize={200}
              textColor="#ffffff"
              planeBaseHeight={14}
              enableWaves={true}
            />
          )}
        </div>
        <div
          ref={pilzRef}
          className="pointer-events-none absolute inset-x-0 bottom-[8vh] h-[22vh] md:inset-x-auto md:bottom-auto md:right-[3vw] md:top-[30vh] md:h-[34vh] md:w-[36vw] mix-blend-difference will-change-transform"
        >
          {logoMounted && (
            <ASCIIText
              imageSrc="/studiopilz_logo.svg"
              imageCrop={PILZ_CROP}
              asciiFontSize={6}
              textFontSize={200}
              textColor="#ffffff"
              planeBaseHeight={14}
              enableWaves={true}
            />
          )}
        </div>

        <div ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-50 animate-pulse">
            scroll
          </span>
        </div>

        {/* the network unravels */}
        <div ref={welcomeRef} className={`${layer} items-end`}>
          <div>
            <h1 className="sr-only">welcome to studio pilz</h1>
            <p className={definition}>
              <span className="font-bold">Pilz</span>{' '}
              <span className="font-mono text-sm opacity-60">/pɪlts/</span>{' '}
              <em className="opacity-70">noun,</em> German for mushroom. A fruiting body that emerges
              when the conditions are right. Beneath the surface, a vast network connecting separate
              organisms, passing signals and nutrients between them. No centre, no hierarchy. Grows
              by connecting.
            </p>
          </div>
        </div>

        {/* the dive */}
        <div ref={curiosityRef} className={`${layer} items-end justify-end text-right`}>
          <div className="flex flex-col items-end">
            <p className="sr-only">bring curiosity</p>
            <p className={definition}>
              <span className="font-bold">stu·di·o</span>{' '}
              <span className="font-mono text-sm opacity-60">/ˈstjuːdɪəʊ/</span>{' '}
              <em className="opacity-70">noun</em> A place where people make things. Ideas come in,
              get pulled apart, rebuilt, and eventually leave as something real.
            </p>
          </div>
        </div>

        {/* the phrases, as symbols and numbers */}
        <div
          ref={asciiRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center mix-blend-difference opacity-0"
        >
          <p className="sr-only">let us bend your perception</p>
          <div className="w-full h-[75vh]">
            <ASCIIText
              text={PHRASES[phrase]}
              // finer characters on narrower screens, where the width squeezes the words
              asciiFontSize={typeof window === 'undefined' ? 12 : Math.round(Math.min(12, Math.max(5, window.innerWidth / 110)))}
              textFontSize={200}
              textColor="#ffffff"
              planeBaseHeight={14}
              enableWaves={true}
            />
          </div>
        </div>

        {/* out over the whole network */}
        <div
          ref={wonderRef}
          className="pointer-events-none absolute inset-0 flex items-end justify-center p-6 pb-16 md:p-16 text-center opacity-0 will-change-transform"
          style={{ visibility: 'hidden' }}
        >
          <p className="sr-only">leave with newborn wonder</p>
        </div>

        {/* inside the mushroom: its light fills the screen, and the menu opens */}
        <div
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, var(--glow) 0%, color-mix(in srgb, var(--glow) 35%, var(--background)) 45%, var(--background) 100%)' }}
        />
      </div>
    </section>
  )
}
