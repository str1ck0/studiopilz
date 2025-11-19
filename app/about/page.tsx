'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-12"
        >
          About Studio Pilz
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-lg md:text-xl leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          <p>
            Studio Pilz is a creative technology and design studio that exists
            at the intersection of digital innovation and artistic expression.
          </p>

          <p>
            We specialize in crafting immersive web experiences, developing
            cutting-edge digital products, creating festival installations that
            captivate audiences, and capturing moments through contemporary
            photography.
          </p>

          <p>
            Our approach combines technical expertise with a playful, futuristic
            aesthetic—embracing minimalism while pushing the boundaries of what's
            possible with modern web technologies like Three.js, React, and Next.js.
          </p>

          <p>
            Each project is an opportunity to explore new creative territories,
            experiment with emerging technologies, and deliver work that resonates
            with Gen Z sensibilities while maintaining timeless design principles.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
            What We Do
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2 uppercase tracking-wider text-sm">
                Web Design & Development
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Creating beautiful, performant websites and digital experiences
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 uppercase tracking-wider text-sm">
                Festival Installations
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Immersive interactive experiences for events and festivals
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 uppercase tracking-wider text-sm">
                Photography
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Contemporary visual storytelling and documentation
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 uppercase tracking-wider text-sm">
                Creative Technology
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Exploring the intersection of art, design, and technology
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
