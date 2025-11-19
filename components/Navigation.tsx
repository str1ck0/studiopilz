'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/work', label: 'Work' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tighter"
          >
            STUDIO PILZ
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wider transition-all hover:opacity-100 ${
                pathname === link.href ? 'opacity-100' : 'opacity-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </nav>
  )
}
