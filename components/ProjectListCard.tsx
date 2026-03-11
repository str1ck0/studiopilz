'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'
import { Project } from '@/types'

export default function ProjectListCard({ project }: { project: Project }) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  }

  return (
    <motion.div variants={item}>
      <Link href={`/work/${project.slug}`} className="block group">
        <div className="relative w-full border border-foreground/20 hover:border-foreground transition-colors duration-500 bg-background overflow-hidden sharp-corners flex flex-col md:flex-row items-center p-4 gap-6 h-auto md:h-40">
          
          {/* Main Image */}
          <div className="relative w-full md:w-48 h-48 md:h-full shrink-0 overflow-hidden bg-foreground/5">
            {project.mainImage && (
              <motion.div 
                className="w-full h-full relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <Image
                  src={urlForImage(project.mainImage).width(600).url()}
                  alt={project.mainImage.alt || project.title}
                  fill
                  className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </motion.div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 px-2">
            <div className="flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tighter group-hover:translate-x-2 transition-transform duration-500 ease-out">{project.title}</h3>
              <span className="text-sm font-mono opacity-60 uppercase tracking-widest mt-2">{project.category}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-lg md:text-xl font-light opacity-80 group-hover:-translate-x-2 transition-transform duration-500 ease-out">{project.year}</span>
              
              <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center rounded-full group-hover:bg-foreground group-hover:text-background transition-all duration-500 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hover highlight background subtle effect */}
          <div className="absolute inset-0 bg-foreground/[0.02] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}
