'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
            Creative
            <br />
            Technology
            <br />
            & Design
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl max-w-2xl text-zinc-600 dark:text-zinc-400"
          >
            Studio Pilz crafts digital experiences, immersive installations,
            and visual narratives that push the boundaries of technology and design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-6 pt-4"
          >
            <Link
              href="/work"
              className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black font-medium tracking-wide hover:opacity-80 transition-opacity"
            >
              View Work
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border border-black dark:border-white font-medium tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              About Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
