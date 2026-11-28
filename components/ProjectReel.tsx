'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { urlForImage } from '@/sanity/lib/image'
import type { Project } from '@/types'

// a picture's proportions are kept, within reason
const clampAspect = (a?: number) => Math.min(Math.max(a || 4 / 3, 0.55), 2.2)
// solid, so the spores drifting behind the page stay behind the panels
const PANEL = 'bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]'

type Picture = { key: string; image: Project['mainImage']; alt: string; aspect: number }

/**
 * The projects as one long reel. Scrolling down glides a row of full-height panels
 * sideways: an index of every project, then each project in turn, its name and a few
 * words, followed by its pictures, each at its own proportions. Every panel opens its
 * project; the names in the index glide the reel to theirs.
 */
export default function ProjectReel({ projects }: { projects: Project[] }) {
  const shown = projects.filter((p) => p.mainImage)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  // where each project starts along the track, for the index links
  const starts = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let distance = 0
    let x = 0
    let target = 0
    let raf = 0
    let pictures: { el: HTMLElement; inner: HTMLElement; left: number; width: number }[] = []

    const measure = () => {
      distance = Math.max(track.scrollWidth - window.innerWidth, 0)
      // the page scrolls exactly as far as the reel travels
      section.style.height = `${window.innerHeight + distance}px`
      pictures = [...track.querySelectorAll<HTMLElement>('[data-reel-picture]')].map((el) => ({
        el,
        inner: el.firstElementChild as HTMLElement,
        left: el.offsetLeft,
        width: el.offsetWidth,
      }))
      read()
      x = target
      draw()
    }

    const read = () => {
      const p = Math.min(Math.max(-section.getBoundingClientRect().top / Math.max(distance, 1), 0), 1)
      target = p * distance
    }

    const draw = () => {
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`
      if (barRef.current) barRef.current.style.transform = `scaleX(${distance ? (x / distance).toFixed(4) : 0})`
      if (reduced) return
      // each picture drifts a little inside its frame as it passes
      const W = window.innerWidth
      for (const p of pictures) {
        const centre = p.left - x + p.width / 2
        if (centre < -p.width || centre > W + p.width) continue
        const off = ((centre - W / 2) / W) * -4
        p.inner.style.transform = `translate3d(${off.toFixed(2)}%,0,0)`
      }
    }

    // ease toward the scroll position, so the reel glides rather than jumps
    const tick = () => {
      raf = 0
      x += (target - x) * (reduced ? 1 : 0.14)
      if (Math.abs(target - x) < 0.3) x = target
      draw()
      if (x !== target) raf = requestAnimationFrame(tick)
    }
    const onScroll = () => {
      read()
      if (!raf) raf = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  /** glide the reel to a project's first panel */
  const goTo = (i: number) => {
    const section = sectionRef.current
    const track = trackRef.current
    const el = starts.current[i]
    if (!section || !track || !el) return
    const distance = Math.max(track.scrollWidth - window.innerWidth, 1)
    const along = Math.min(el.offsetLeft - track.offsetLeft, distance)
    const top = section.getBoundingClientRect().top + window.scrollY + along
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (!shown.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono text-sm lowercase tracking-wide opacity-50">no projects yet</p>
      </div>
    )
  }

  const textPanel = `${PANEL} flex h-full w-[min(78vw,22rem)] shrink-0 flex-col justify-between p-5 md:w-[min(30vw,24rem)] md:p-6`

  return (
    <section ref={sectionRef} aria-label="projects" className="relative" style={{ height: '200vh' }}>
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-20 md:pt-24">
        <div ref={trackRef} className="flex min-h-0 flex-1 gap-1.5 px-6 will-change-transform md:px-12">
          {/* the index */}
          <div className={textPanel}>
            <p className="font-mono text-xs lowercase tracking-wide opacity-60">
              {String(shown.length).padStart(2, '0')} projects · scroll →
            </p>
            <ol className="mt-6 flex flex-col gap-1">
              {shown.map((project, i) => (
                <li key={project._id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className="flex w-full items-baseline justify-between gap-4 text-left outline-none transition-colors hover:text-glow focus-visible:text-glow"
                  >
                    <span className="text-lg font-semibold lowercase leading-tight tracking-[-0.03em] md:text-xl">{project.title}</span>
                    <span className="shrink-0 font-mono text-xs opacity-60">{project.year}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {shown.map((project, i) => {
            const pictures: Picture[] = [
              { key: 'main', image: project.mainImage, alt: project.mainImage.alt || project.title, aspect: clampAspect(project.mainAspect) },
              ...(project.reel ?? [])
                .filter((g) => g.asset)
                .map((g, k) => ({ key: `g${k}`, image: g, alt: g.alt || `${project.title}, picture ${k + 2}`, aspect: clampAspect(g.aspect) })),
            ]
            const href = `/work/${project.slug}`
            return (
              <div key={project._id} className="contents">
                <Link
                  href={href}
                  ref={(el) => {
                    starts.current[i] = el
                  }}
                  className={`group ${textPanel} outline-none`}
                >
                  <div>
                    <h3
                      className="break-words font-semibold lowercase leading-[0.9] tracking-[-0.05em] transition-colors duration-200 group-hover:text-glow group-focus-visible:text-glow"
                      style={{ fontSize: 'clamp(2rem, 3.4vw, 3.5rem)' }}
                    >
                      {project.title}
                    </h3>
                    <p className="mt-3 font-mono text-xs lowercase tracking-wide opacity-60">
                      {project.category?.replace('-', ' ')} · {project.year}
                    </p>
                  </div>
                  <div>
                    {project.description && (
                      <p className="line-clamp-6 text-sm leading-relaxed opacity-80 md:text-base">{project.description}</p>
                    )}
                    <p className="mt-4 font-mono text-xs lowercase tracking-wide opacity-70 transition-opacity group-hover:opacity-100">
                      view project →
                    </p>
                  </div>
                </Link>
                {pictures.map((pic) => (
                  <Link
                    key={pic.key}
                    href={href}
                    tabIndex={-1}
                    data-reel-picture
                    className="relative block h-full shrink-0 overflow-hidden bg-foreground/5"
                    style={{ aspectRatio: pic.aspect }}
                  >
                    <div className="absolute inset-y-0 -left-[3%] -right-[3%] will-change-transform">
                      <Image
                        src={urlForImage(pic.image).height(1400).url()}
                        alt={pic.alt}
                        fill
                        sizes={`${Math.round(pic.aspect * 80)}vh`}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )
          })}
        </div>

        {/* how far along the reel */}
        <div className="mx-6 mt-4 h-px bg-foreground/10 md:mx-12">
          <div ref={barRef} className="h-full origin-left bg-foreground/60" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  )
}
