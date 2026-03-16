'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'

interface ProjectGridProps {
  projects: Project[]
}

// Find the best column count so the last row never has exactly 1 card
function getColCount(count: number): number {
  if (count <= 2) return count
  if (count === 3) return 3
  if (count === 4) return 2
  const candidates = [3, 4, 2]
  for (const cols of candidates) {
    const remainder = count % cols
    if (remainder === 0 || remainder >= 2) return cols
  }
  return 3
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (!projects?.length) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500 font-mono tracking-wider uppercase">Loading projects from the Mycelial Network...</p>
      </div>
    )
  }

  const cols = getColCount(projects.length)

  // Split into rows
  const rows: Project[][] = []
  for (let i = 0; i < projects.length; i += cols) {
    rows.push(projects.slice(i, i + cols))
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .project-row { flex-direction: column !important; }
          .project-card { width: 100% !important; }
        }
      `}</style>
      <div className="flex flex-col gap-4 px-6 pb-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`project-row flex gap-4${row.length < cols ? ' justify-center' : ''}`}
          >
            {row.map((project, colIndex) => {
              const globalIndex = rowIndex * cols + colIndex
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: colIndex * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="project-card relative group overflow-hidden bg-black/5 dark:bg-white/5 rounded"
                  style={{
                    width: `calc(${100 / cols}% - ${((cols - 1) / cols) * 16}px)`,
                    aspectRatio: '4/3',
                    flexShrink: 0,
                  }}
                >
                  <Link href={`/work/${project.slug}`} className="block w-full h-full relative">
                    {project.mainImage && (
                      <Image
                        src={urlForImage(project.mainImage).width(1200).quality(85).url()}
                        alt={project.mainImage.alt || project.title}
                        fill
                        sizes={`(max-width: 767px) 100vw, calc(${100 / cols}vw - 48px)`}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        style={{ willChange: 'transform' }}
                        priority={globalIndex < 4}
                      />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
