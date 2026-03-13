'use client'

import { usePathname } from 'next/navigation'
import { SiteSettings } from '@/types'

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname()
  if (pathname.startsWith('/studio')) return null

  const socials = settings?.socialLinks ?? []

  return (
    <footer className="border-t border-foreground/10 mt-24 px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-mono text-xs tracking-widest uppercase opacity-60">
      <span>© Studio Pilz 2026</span>
      <div className="flex gap-8">
        {socials.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            {link.platform} ↗
          </a>
        ))}
      </div>
    </footer>
  )
}
