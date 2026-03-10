'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HomeHero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-32">
      
      {/* Decorative large background text or shapes could go here if we wanted, 
          but we are keeping it minimal and relying on the GrainientBackground */}
      
      <div className="max-w-[1200px] w-full mx-auto relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-block"
        >
          <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] opacity-60">
            Creative Technology & Design
          </span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          We build
          <br />
          <span className="italic font-light opacity-80">digital</span> spaces.
        </motion.h1>

        <motion.p 
          className="text-lg md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          Studio Pilz is a contemporary full-service creative agency operating in the spaces between technology, art, design, and physical installations. We are a mycelial network of artists, musicians, scientists, and explorers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link 
            href="#work" 
            className="group relative px-8 py-4 bg-foreground text-background font-mono text-sm tracking-widest uppercase overflow-hidden"
          >
            <span className="relative z-10 transition-colors group-hover:text-foreground">Explore Work</span>
            <div className="absolute inset-0 bg-background border border-foreground translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>

          <Link 
            href="/about" 
            className="px-8 py-4 font-mono text-sm tracking-widest uppercase border border-foreground/20 hover:border-foreground/60 transition-colors"
          >
            About the Network
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
