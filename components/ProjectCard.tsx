'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { urlForImage } from '@/lib/sanity.image'

interface ProjectCardProps {
  title: string
  slug: string
  category: string
  year: number
  mainImage: any
  index: number
}

export default function ProjectCard({
  title,
  slug,
  category,
  year,
  mainImage,
  index,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/work/${slug}`}>
        <div className="group relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {mainImage && (
            <Image
              src={urlForImage(mainImage).width(800).height(600).url()}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium tracking-tight">{title}</h3>
            <span className="text-sm text-zinc-500">{year}</span>
          </div>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wider">
            {category}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
