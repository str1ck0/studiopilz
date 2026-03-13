'use client'

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion'
import { GuestbookEntry } from '@/types'

export default function GuestbookGallery({ entries }: { entries: GuestbookEntry[] }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="py-12 text-center text-foreground/50 font-mono text-sm">
        No notes yet. Be the first to draw something!
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
  }

  // Generate slightly random rotations for the sticky notes to make it look organic
  const getRandomRotation = (id: string) => {
    // deterministic based on ID so it doesn't jump on re-renders
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return (hash % 6) - 3 // returns -3 to +2 degrees
  }

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: '-100px' }}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mt-12 w-full max-w-[1600px] mx-auto pb-24 px-6"
    >
      {entries.map((entry) => (
        <motion.div
          key={entry._id}
          variants={item}
          className="break-inside-avoid relative"
        >
          <div 
            className="w-full p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center relative overflow-hidden group"
            style={{ 
              backgroundColor: entry.paperColor || '#ffffff',
              transform: `rotate(${getRandomRotation(entry._id)}deg)`,
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            {/* The Drawing */}
            {entry.drawingData && (
              <div className="w-full relative min-h-[150px] mb-4">
                <img
                  src={entry.drawingData}
                  alt={`Drawing by ${entry.authorName || 'Anonymous'}`}
                  className="w-full h-auto object-contain pointer-events-none filter drop-shadow-sm"
                />
              </div>
            )}

            {/* The Message */}
            {entry.message && (
              <p className="text-black/80 font-sans text-lg mb-6 w-full leading-relaxed whitespace-pre-wrap">
                {entry.message}
              </p>
            )}

            {/* Metadata (Author & Date) */}
            <div className="w-full flex justify-between items-end border-t border-black/10 pt-4 mt-auto">
              <span className="font-bold text-black/90 tracking-tighter">
                {entry.authorName || 'Anonymous'}
              </span>
              <span className="font-mono text-xs text-black/40 uppercase tracking-widest">
                {`${new Date(entry._createdAt).getUTCDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date(entry._createdAt).getUTCMonth()]}`}
              </span>
            </div>
            
            {/* Subtle subtle fold effect top corner */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="w-full h-full bg-gradient-to-bl from-black/10 to-transparent" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
