'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import { useState } from 'react'

interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!projects?.length) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500 font-mono tracking-wider uppercase">Loading projects from the Mycelial Network...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {projects.map((project, index) => (
        <motion.div
          key={project._id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setHoveredId(project._id)}
          onMouseLeave={() => setHoveredId(null)}
          className="relative group aspect-[4/5] overflow-hidden bg-black/5 dark:bg-white/5 rounded"
        >
          <Link href={`/work/${project.slug}`} className="block w-full h-full cursor-pointer relative">
            {/* Background Image using Next.js Image for optimization */}
            {project.mainImage && (
              <Image
                src={urlForImage(project.mainImage).width(1200).quality(85).url()}
                alt={project.mainImage.alt || project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority={index < 4}
              />
            )}
            
            {/* Shaded Overlay on Hover */}
            <motion.div
              initial={false}
              animate={{
                opacity: hoveredId === project._id ? 1 : 0,
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            />
            
            {/* Hover Content */}
            <motion.div
              initial={false}
              animate={{
                opacity: hoveredId === project._id ? 1 : 0,
                y: hoveredId === project._id ? 0 : 20,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-8 flex flex-col justify-between text-white"
            >
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
                <span className="text-sm font-medium hover:underline underline-offset-4">
                  View Project →
                </span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
