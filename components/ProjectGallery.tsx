'use client'

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react'
import { urlForImage } from '@/sanity/lib/image'

type GalleryItem = {
  _type: string
  url?: string
  alt?: string
  caption?: string
  asset?: { _ref: string }
  poster?: { asset?: { _ref: string }; hotspot?: unknown }
  previewPosition?: string
}

// Animated bars — indicates "this is a video" without being a play button
function MotionIndicator({ active }: { active: boolean }) {
  const heights = [55, 85, 40, 70, 60]
  return (
    <div className="flex items-end gap-[2.5px] h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] bg-white rounded-full origin-bottom"
          style={{
            height: `${h}%`,
            animation: active
              ? `equalize ${0.5 + i * 0.1}s ease-in-out ${i * 0.08}s infinite alternate`
              : 'none',
            opacity: active ? 1 : 0.7,
            transform: active ? undefined : `scaleY(${0.3 + (h / 100) * 0.4})`,
          }}
        />
      ))}
    </div>
  )
}

function VideoItem({ item, style }: { item: GalleryItem; style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const posterUrl = item.poster?.asset
    ? urlForImage(item.poster).width(1200).quality(85).url()
    : undefined

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = false
      videoRef.current.play()
    }
    setPlaying(true)
  }
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.muted = true
    }
    setPlaying(false)
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black/10 dark:bg-white/5 cursor-pointer w-full"
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={item.url}
        poster={posterUrl}
        muted
        playsInline
        loop
        className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
        style={{ objectPosition: item.previewPosition || 'center' }}
      />

      <div
        className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: playing ? 0 : 1 }}
      />

      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1.5 pointer-events-none">
        <MotionIndicator active={playing} />
      </div>

      {item.caption && (
        <div
          className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 pointer-events-none"
          style={{ opacity: playing ? 1 : 0 }}
        >
          <p className="text-white text-xs font-mono">{item.caption}</p>
        </div>
      )}
    </div>
  )
}

function ImageItem({ item, index, style }: { item: GalleryItem; index: number; style?: React.CSSProperties }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 group w-full"
      style={style}
    >
      <img
        src={urlForImage(item).width(1400).quality(90).url()}
        alt={item.alt || `Gallery image ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-white text-xs font-mono">{item.caption}</p>
        </div>
      )}
    </div>
  )
}

type MobileRow =
  | { kind: 'video'; item: GalleryItem; index: number }
  | { kind: 'single'; item: GalleryItem; index: number }
  | { kind: 'pair'; a: GalleryItem; aIndex: number; b: GalleryItem; bIndex: number }

function buildMobileRows(items: GalleryItem[]): MobileRow[] {
  const rows: MobileRow[] = []
  let i = 0
  while (i < items.length) {
    if (items[i]._type === 'video') {
      rows.push({ kind: 'video', item: items[i], index: i })
      i++
    } else if (items[i + 1] && items[i + 1]._type !== 'video') {
      rows.push({ kind: 'pair', a: items[i], aIndex: i, b: items[i + 1], bIndex: i + 1 })
      i += 2
    } else {
      rows.push({ kind: 'single', item: items[i], index: i })
      i++
    }
  }
  return rows
}

// Desktop bento: process consecutive image runs so every item matches its neighbour's height.
// Pattern tiles: 1 item → full-width; 2 items → narrow-left + wide-right (same rows);
// 3+ items → wide-left (3 rows) | small-top-right | tall-bottom-right (repeating).
function computeDesktopSpans(items: GalleryItem[]): string[] {
  const spans: string[] = new Array(items.length)
  let i = 0

  while (i < items.length) {
    if (items[i]._type === 'video') {
      spans[i] = 'col-span-3 row-span-3'
      i++
      continue
    }

    // Find the end of this run of non-video images
    let runEnd = i
    while (runEnd < items.length && items[runEnd]._type !== 'video') runEnd++

    // Tile the run
    let j = i
    while (j < runEnd) {
      const rem = runEnd - j
      if (rem === 1) {
        spans[j] = 'col-span-3 row-span-2'
        j += 1
      } else if (rem === 2) {
        // Narrow left + wide right — same row-span so heights match
        spans[j]     = 'col-span-1 row-span-2'
        spans[j + 1] = 'col-span-2 row-span-2'
        j += 2
      } else {
        // 3-item bento block — tiles perfectly with no gaps
        spans[j]     = 'col-span-2 row-span-3'  // big left
        spans[j + 1] = 'col-span-1 row-span-1'  // small top-right
        spans[j + 2] = 'col-span-1 row-span-2'  // medium bottom-right
        j += 3
      }
    }
    i = runEnd
  }

  return spans
}

export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  if (!items || items.length === 0) return null

  const mobileRows = buildMobileRows(items)
  const desktopSpans = computeDesktopSpans(items)

  return (
    <>
      {/* ── Mobile layout: flex rows with natural aspect ratios ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {mobileRows.map((row, rowIdx) => {
          if (row.kind === 'video') {
            return (
              <div key={rowIdx} style={{ aspectRatio: '16/9' }}>
                <VideoItem item={row.item} style={{ height: '100%' }} />
              </div>
            )
          }
          if (row.kind === 'single') {
            return (
              <div key={rowIdx} style={{ aspectRatio: '4/3' }}>
                <ImageItem item={row.item} index={row.index} style={{ height: '100%' }} />
              </div>
            )
          }
          // pair
          return (
            <div key={rowIdx} className="flex gap-3" style={{ aspectRatio: '2/1' }}>
              <div className="flex-1">
                <ImageItem item={row.a} index={row.aIndex} style={{ height: '100%' }} />
              </div>
              <div className="flex-1">
                <ImageItem item={row.b} index={row.bIndex} style={{ height: '100%' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop layout: bento grid ── */}
      <div
        className="hidden md:grid md:grid-cols-3 gap-3"
        style={{ gridAutoRows: 'clamp(120px, 18vw, 180px)' }}
      >
        {items.map((item, index) => {
          const spanClass = desktopSpans[index]
          if (item._type === 'video') {
            return (
              <div key={index} className={spanClass}>
                <VideoItem item={item} style={{ height: '100%' }} />
              </div>
            )
          }
          return (
            <div key={index} className={spanClass}>
              <ImageItem item={item} index={index} style={{ height: '100%' }} />
            </div>
          )
        })}
      </div>
    </>
  )
}
