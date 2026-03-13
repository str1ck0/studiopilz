'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import AsciiText to prevent SSR issues with Three.js
const ASCIIText = dynamic(() => import('./AsciiText'), { ssr: false })

interface HomeHeroProps {
  subtitle: string
  videoUrl?: string
}

const TYPEWRITER_STRINGS = [
  'welcome to\nstudio pilz',
  'bring\ncuriosity',
  'let us bend\nyour\nperception',
  'leave with\nnewborn\nwonder'
]

function RotatingAsciiText() {
  const [index, setIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TYPEWRITER_STRINGS.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  if (!isMounted) return null

  return (
    <div className="w-full h-[60vh] max-h-[400px]">
       <ASCIIText 
         text={TYPEWRITER_STRINGS[index]}
         asciiFontSize={12}
         textFontSize={200}
         textColor="#ffffff"
         planeBaseHeight={14}
         enableWaves={true}
       />
    </div>
  )
}

export default function HomeHero({ videoUrl }: HomeHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Video (Less filtering) */}
      {videoUrl && (
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            src={videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-90 transition-opacity duration-1000 ease-in-out"
          />
          {/* Subtle Shadow Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
        </div>
      )}
      
      <div className="w-full h-full absolute inset-0 z-20 flex items-center justify-center">
        {/* Only the rotating Ascii text is on screen now */}
        <RotatingAsciiText />
      </div>
    </section>
  )
}
