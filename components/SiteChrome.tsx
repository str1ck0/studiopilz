'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import GrainientBackground from './GrainientBackground'

export default function SiteChrome() {
  const pathname = usePathname()
  if (pathname.startsWith('/studio')) return null
  return (
    <>
      <GrainientBackground />
      <Navigation />
    </>
  )
}
