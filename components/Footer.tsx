'use client'

import { usePathname } from 'next/navigation'
import { SiteSettings } from '@/types'

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname()
  if (pathname.startsWith('/studio')) return null

  const socials = settings?.socialLinks ?? []
  // the shop is a single screen, so its footer sits pinned to the bottom edge
  const pinned = pathname === '/shop'

  return (
    <footer
      className={`border-t border-foreground/10 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between font-mono text-xs tracking-widest uppercase opacity-60 ${
        pinned
          ? 'fixed inset-x-0 bottom-0 z-10 gap-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-6'
          : 'mt-24 gap-6 py-10'
      }`}
    >
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
