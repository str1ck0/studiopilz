'use client'

import { motion } from 'framer-motion'
import { Project } from '@/types'
import ProjectListCard from './ProjectListCard'

export default function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects?.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono text-sm tracking-widest uppercase opacity-50">No projects found</p>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 w-full"
    >
      {projects.map((project) => (
        <ProjectListCard key={project._id} project={project} />
      ))}
    </motion.div>
  )
}
