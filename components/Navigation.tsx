'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useRef, useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  // Use useState + ref trick: initialise from a ref so effect is not needed
  const [mounted, setMounted] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true)
    }
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/work', label: 'Work' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/50 backdrop-blur-2xl border-b border-foreground/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center z-10 hover:opacity-80 transition-opacity">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-48 h-12 flex items-center"
            >
               {/* Use CSS Mask to color the SVG perfectly to our foreground color */}
               <div 
                 className="w-full h-full bg-foreground transition-colors duration-300"
                 style={{ 
                   WebkitMaskImage: 'url(/studiopilz_logo.svg)', 
                   WebkitMaskSize: 'contain', 
                   WebkitMaskRepeat: 'no-repeat', 
                   WebkitMaskPosition: 'left center',
                   maskImage: 'url(/studiopilz_logo.svg)',
                   maskSize: 'contain',
                   maskRepeat: 'no-repeat',
                   maskPosition: 'left center'
                 }} 
               />
            </motion.div>
          </Link>
        </div>

        {/* Right Side: Links & Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wider uppercase font-medium transition-all hover:opacity-100 ${
                (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)) ? 'opacity-100 border-b border-current pb-1' : 'opacity-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
        </motion.div>

      </div>
    </nav>
  )
}
