'use client'

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion'
import { GuestbookEntry } from '@/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const stamp = (iso: string) => {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
}

// a gentle tilt per note, the same on every visit
const tilt = (id: string) => {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return ((hash % 5) - 2) * 0.8 // -1.6 to 1.6 degrees
}

// dark papers get light writing
const isDarkPaper = (hex: string) => {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return false
  const [r, g, b] = m.map((h) => parseInt(h, 16))
  return 0.299 * r + 0.587 * g + 0.114 * b < 110
}

/**
 * Every note visitors have left, as a wall of post-its: all the same square size,
 * each on the paper it was made on, slightly askew, with a small mono stamp.
 */
export default function GuestbookGallery({ entries }: { entries: GuestbookEntry[] }) {
  const count = entries?.length ?? 0

  return (
    <section className="flex flex-col gap-6" aria-label="Notes from visitors">
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-4">
        <h2 className="text-lg font-bold tracking-tight md:text-xl">Notes from visitors</h2>
        <span className="font-mono text-sm opacity-50">{String(count).padStart(3, '0')}</span>
      </div>

      {count === 0 ? (
        <p className="py-12 text-center font-mono text-sm opacity-50">No notes yet. Be the first to draw something.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 px-2 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => {
            const paper = entry.paperColor || '#fbf6ec'
            const dark = isDarkPaper(paper)
            const angle = tilt(entry._id)
            return (
              <motion.article
                key={entry._id}
                initial={{ opacity: 0, y: 16, rotate: angle }}
                whileInView={{ opacity: 1, y: 0, rotate: angle }}
                whileHover={{ rotate: 0, y: -4 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex aspect-square flex-col overflow-hidden rounded-sm p-5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] ${dark ? 'text-[#f2e7d5]' : 'text-[#1a1a1a]'}`}
                style={{ backgroundColor: paper }}
              >
                {/* the sticky strip along the top of a post-it */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/[0.06] to-transparent" />

                {entry.drawingData && (
                  <div className="relative min-h-0 flex-1">
                    <img
                      src={entry.drawingData}
                      alt={`Drawing by ${entry.authorName || 'Anonymous'}`}
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    />
                  </div>
                )}

                {entry.message && (
                  <p
                    className={`whitespace-pre-wrap break-words text-base leading-relaxed opacity-80 ${
                      entry.drawingData ? 'mt-3 line-clamp-2' : 'flex-1 line-clamp-[8] text-lg'
                    }`}
                  >
                    {entry.message}
                  </p>
                )}
                {!entry.drawingData && !entry.message && <div className="flex-1" />}

                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-current/15 pt-3 font-mono text-xs uppercase tracking-widest">
                  <span className="truncate">
                    <span className="mr-3 opacity-50">{String(count - i).padStart(3, '0')}</span>
                    {entry.authorName || 'Anonymous'}
                  </span>
                  <span className="shrink-0 opacity-50">{stamp(entry._createdAt)}</span>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}
