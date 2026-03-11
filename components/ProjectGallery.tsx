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

function VideoItem({ item, className }: { item: GalleryItem; className: string }) {
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
      className={`relative overflow-hidden rounded-2xl bg-black/10 dark:bg-white/5 cursor-pointer ${className}`}
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
      />

      {/* Subtle dark overlay when paused */}
      <div
        className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: playing ? 0 : 1 }}
      />

      {/* Motion indicator badge */}
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

function ImageItem({ item, index, className }: { item: GalleryItem; index: number; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 group ${className}`}>
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

// Videos always span the full row
function getDesktopSpan(index: number, total: number, isVideo: boolean): string {
  if (isVideo) return 'md:col-span-3 md:row-span-2'
  if (total === 1) return 'md:col-span-3 md:row-span-2'
  const posInGroup = index % 5
  if (posInGroup === 0) return 'md:col-span-2 md:row-span-2'
  if (posInGroup === 2 && total - index > 2) return 'md:col-span-1 md:row-span-2'
  return 'md:col-span-1 md:row-span-1'
}

function getMobileSpan(index: number, total: number, isVideo: boolean): string {
  if (isVideo) return 'col-span-2 row-span-2'
  if (total === 1) return 'col-span-2 row-span-2'
  const posInGroup = index % 3
  // Wide items get row-span-2 on mobile for more height
  if (posInGroup === 0) return 'col-span-2 row-span-2'
  return 'col-span-1 row-span-1'
}

export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
      style={{ gridAutoRows: 'clamp(140px, 22vw, 200px)' }}
    >
      {items.map((item, index) => {
        const isVideo = item._type === 'video'
        const spanClass = `${getMobileSpan(index, items.length, isVideo)} ${getDesktopSpan(index, items.length, isVideo)}`

        if (isVideo) {
          return <VideoItem key={index} item={item} className={spanClass} />
        }

        return <ImageItem key={index} item={item} index={index} className={spanClass} />
      })}
    </div>
  )
}
