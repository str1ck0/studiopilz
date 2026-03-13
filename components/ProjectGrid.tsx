'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-card]') as HTMLElement
    const amount = card ? card.offsetWidth + 16 : 340
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  if (!projects?.length) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500 font-mono tracking-wider uppercase">Loading projects from the Mycelial Network...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Right fade — signals more content */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-6 w-24 z-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to left, var(--background) 0%, transparent 100%)',
          opacity: canScrollRight ? 1 : 0,
        }}
      />
      {/* Left fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-6 w-24 z-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to right, var(--background) 0%, transparent 100%)',
          opacity: canScrollLeft ? 1 : 0,
        }}
      />

      {/* Arrow buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-all duration-300 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-all duration-300 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-6 pb-6 no-scrollbar"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            data-card
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative group flex-none overflow-hidden bg-black/5 dark:bg-white/5 rounded"
            style={{
              width: 'clamp(280px, 35vw, 480px)',
              aspectRatio: '4/5',
              scrollSnapAlign: 'start',
            }}
          >
            <Link href={`/work/${project.slug}`} className="block w-full h-full relative">
              {project.mainImage && (
                <Image
                  src={urlForImage(project.mainImage).width(1200).quality(85).url()}
                  alt={project.mainImage.alt || project.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 35vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ willChange: 'transform' }}
                  priority={index < 4}
                />
              )}

              {/* Overlay — pure CSS, no JS state, no backdrop-blur (Firefox compat) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover content — pure CSS */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-white/70 mb-2">
                    {project.category.replace('-', ' ')}
                  </p>
                  <h3 className="text-3xl font-bold tracking-tight leading-none">
                    {project.title}
                  </h3>
                </div>

                <div className="flex justify-between items-end border-t border-white/20 pt-4">
                  <span className="font-mono text-sm">{project.year}</span>
                  <span className="text-sm font-medium">View Project →</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
