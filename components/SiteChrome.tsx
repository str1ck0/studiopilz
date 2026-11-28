'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import GrainientBackground from './GrainientBackground'
import Spores from './Spores'
import type { SiteSettings } from '@/types'

export default function SiteChrome({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname()
  if (pathname.startsWith('/studio')) return null
  return (
    <>
      <GrainientBackground />
      <Spores />
      <div className="site-nav">
        <Navigation settings={settings} />
      </div>
    </>
  )
}
