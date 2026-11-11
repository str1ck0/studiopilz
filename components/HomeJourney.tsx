'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity.image'
import type { Project } from '@/types'
import { T, fadeWindow, makeTimeline, projectOpacity } from './mycelium/timeline'

// Three.js is client-only
const MyceliumScene = dynamic(() => import('./mycelium/MyceliumScene'), { ssr: false })
const ASCIIText = dynamic(() => import('./AsciiText'), { ssr: false })

// the four lines of the journey, drawn as living ASCII
const PHRASES = [
  'welcome to\nstudio pilz',
  'bring\ncuriosity',
  'let us bend\nyour\nperception',
  'leave with\nnewborn\nwonder',
]

type JourneyProject = Pick<Project, '_id' | 'title' | 'slug' | 'category' | 'year' | 'mainImage'>

function show(el: HTMLElement | null, opacity: number, rise = 24) {
  if (!el) return
  el.style.opacity = String(opacity)
  el.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible'
  el.style.transform = `translateY(${(1 - opacity) * rise}px)`
}

export default function HomeJourney({ projects }: { projects: JourneyProject[] }) {
  const shown = useMemo(() => projects.filter((p) => p.mainImage), [projects])
  const timeline = useMemo(() => makeTimeline(shown.length), [shown.length])
  // Served through Next's image endpoint so the textures are same-origin
  // (WebGL can't use images from a CDN that doesn't allow this site's origin).
  const imageUrls = useMemo(
    () =>
      shown.map((p) => {
        const src = urlForImage(p.mainImage).width(1920).fit('max').url()
        return `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`
      }),
    [shown]
  )

  const sectionRef = useRef<HTMLElement>(null)
  // scroll position in viewport heights — drives the whole scene
  const journeyRef = useRef(0)
  const hintRef = useRef<HTMLDivElement>(null)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const curiosityRef = useRef<HTMLDivElement>(null)
  const wonderRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const captionRefs = useRef<(HTMLElement | null)[]>([])
  const asciiRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  // which phrase the ASCII layer is drawing; null while projects fill the screen
  const [phrase, setPhrase] = useState<number | null>(0)

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

      // the navbar stays hidden until the first project has opened
      document.documentElement.dataset.hero = u < timeline.portalStart + T * 0.7 ? 'on' : 'off'

      show(hintRef.current, Math.max(1 - u / 0.15, 0), 0)
      const windows = [
        fadeWindow(u, 0.45, 1.25),
        fadeWindow(u, 1.3, 1.95),
        fadeWindow(u, 1.95, 2.55, 0.14),
        Math.min(Math.max((u - timeline.endStart - T * 0.6) / 0.3, 0), 1),
      ]
      show(welcomeRef.current, windows[0])
      show(curiosityRef.current, windows[1])
      show(wonderRef.current, windows[3])

      // one ASCII layer shows whichever phrase is current; it swaps text while invisible
      show(asciiRef.current, Math.max(...windows), 0)
      const next =
        u < 1.275 ? 0 : u < 1.95 ? 1 : u < timeline.portalStart + T ? 2 : u > timeline.endStart ? 3 : null
      setPhrase((prev) => (prev === next ? prev : next))

      // in the closing scene the threads melt into the page instead of ending in a hard edge
      if (sceneRef.current) {
        const closing = Math.min(Math.max((u - timeline.endStart) / T, 0), 1)
        const mask =
          closing > 0 ? `linear-gradient(to bottom, #000 55%, rgba(0,0,0,${1 - closing}) 100%)` : ''
        sceneRef.current.style.maskImage = mask
        sceneRef.current.style.webkitMaskImage = mask
      }

      let anyCaption = 0
      captionRefs.current.forEach((caption, i) => {
        const o = projectOpacity(timeline, i, u)
        anyCaption = Math.max(anyCaption, o)
        show(caption, o)
      })
      if (shadeRef.current) shadeRef.current.style.opacity = String(anyCaption)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      delete document.documentElement.dataset.hero
    }
  }, [timeline])

  const title = 'text-4xl md:text-7xl font-light tracking-tight leading-[0.95]'
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
          <MyceliumScene journeyRef={journeyRef} timeline={timeline} imageUrls={imageUrls} />
        </div>

        {/* landing: nothing but the mushroom and a quiet nudge */}
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
          <div className="w-full h-[60vh] max-h-[400px]">
            {phrase !== null && (
              <ASCIIText
                text={PHRASES[phrase]}
                asciiFontSize={12}
                textFontSize={200}
                textColor="#ffffff"
                planeBaseHeight={14}
                enableWaves={true}
              />
            )}
          </div>
        </div>

        {/* projects */}
        <div
          ref={shadeRef}
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0"
        />
        {shown.map((project, i) => (
          <Link
            key={project._id}
            href={`/work/${project.slug}`}
            ref={(el) => {
              captionRefs.current[i] = el
            }}
            className="group absolute inset-0 flex items-end p-6 pb-12 md:p-16 text-white opacity-0 will-change-transform"
            style={{ visibility: 'hidden' }}
          >
            <div>
              <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] opacity-80">
                {String(i + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
                {project.category ? ` — ${project.category}` : ''}
                {project.year ? `, ${project.year}` : ''}
              </p>
              <h2 className={`${title} mt-3`}>{project.title}</h2>
              <p className="mt-5 font-mono text-sm uppercase tracking-[0.2em]">
                <span className="border-b border-white/60 pb-1 transition-colors group-hover:border-white">
                  view project →
                </span>
              </p>
            </div>
          </Link>
        ))}

        {/* back at the mushroom */}
        <div
          ref={wonderRef}
          className="pointer-events-none absolute inset-0 flex items-end justify-center p-6 pb-16 md:p-16 text-center opacity-0 will-change-transform"
          style={{ visibility: 'hidden' }}
        >
          <div>
            <p className="sr-only">leave with newborn wonder</p>
            <p className="pointer-events-auto flex justify-center gap-8 font-mono text-sm uppercase tracking-[0.2em]">
              <Link href="/work" className="border-b border-current pb-1 opacity-80 hover:opacity-100">
                all work
              </Link>
              <Link href="/about" className="border-b border-current pb-1 opacity-80 hover:opacity-100">
                about
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
