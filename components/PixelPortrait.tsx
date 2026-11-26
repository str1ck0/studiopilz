'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'

// block sizes in css px, from the resting pixelated state down to the sharp photo
const STEPS = [28, 20, 14, 10, 7, 5, 3, 2, 1]
const STEP_MS = 160

/**
 * A portrait that rests as chunky pixels and resolves into the photo while a cursor is
 * over it, or once a finger touches it, then breaks back into pixels afterwards
 * (on touch, once it has left the screen). Keyboard focus reveals it too.
 * With reduced motion, or before scripts run, it is just the plain photo.
 */
export default function PixelPortrait({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!host || !canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let w = 0
    let h = 0
    let dpr = 1
    let loaded = false
    let disposed = false
    let raf = 0
    let step = 0 // index into STEPS currently shown
    let target = 0 // 0 = pixelated, STEPS.length - 1 = sharp
    let lastStep = 0
    const cache = new Map<number, HTMLCanvasElement>()
    const img = new Image()

    // the part of the image that fills the frame, like object-fit: cover
    const coverRect = () => {
      const ia = img.naturalWidth / img.naturalHeight
      const fa = w / h
      if (ia > fa) {
        const sw = img.naturalHeight * fa
        return [(img.naturalWidth - sw) / 2, 0, sw, img.naturalHeight] as const
      }
      const sh = img.naturalWidth / fa
      return [0, (img.naturalHeight - sh) / 2, img.naturalWidth, sh] as const
    }

    // the photo shrunk so each pixel stands for one block
    const smallFor = (block: number) => {
      let small = cache.get(block)
      if (!small) {
        small = document.createElement('canvas')
        small.width = Math.max(1, Math.ceil(w / block))
        small.height = Math.max(1, Math.ceil(h / block))
        const sctx = small.getContext('2d')!
        sctx.imageSmoothingQuality = 'high'
        const [sx, sy, sw, sh] = coverRect()
        sctx.drawImage(img, sx, sy, sw, sh, 0, 0, w / block, h / block)
        cache.set(block, small)
      }
      return small
    }

    const draw = () => {
      const block = STEPS[step]
      if (block === 1) {
        const [sx, sy, sw, sh] = coverRect()
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        return
      }
      const small = smallFor(block)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, small.width * block * dpr, small.height * block * dpr)
    }

    // hard cuts from one block size to the next, so it stays chunky and 8-bit
    const tick = (now: number) => {
      raf = 0
      if (disposed || !loaded) return
      if (now - lastStep >= STEP_MS) {
        lastStep = now
        step += Math.sign(target - step)
        draw()
      }
      if (step !== target) raf = requestAnimationFrame(tick)
    }
    const goTo = (next: number) => {
      target = next
      if (!raf && step !== target) raf = requestAnimationFrame(tick)
    }
    const reveal = () => goTo(STEPS.length - 1)
    const hide = () => goTo(0)

    const resize = () => {
      const rect = host.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      cache.clear()
      if (loaded) draw()
    }
    const sizer = new ResizeObserver(resize)
    sizer.observe(host)

    img.onload = () => {
      if (disposed) return
      loaded = true
      resize()
      setReady(true)
    }
    img.src = src

    // a touch reveals it until it scrolls off screen; a mouse only while it hovers
    let touched = false
    const view = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && touched) {
        touched = false
        hide()
      }
    })
    view.observe(host)

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') reveal()
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && document.activeElement !== host) hide()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      touched = true
      reveal()
    }
    const onFocus = () => reveal()
    const onBlur = () => {
      if (!host.matches(':hover') && !touched) hide()
    }
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('focus', onFocus)
    host.addEventListener('blur', onBlur)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      sizer.disconnect()
      view.disconnect()
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('focus', onFocus)
      host.removeEventListener('blur', onBlur)
    }
  }, [src])

  return (
    <div
      ref={hostRef}
      tabIndex={ready ? 0 : undefined}
      className={`relative overflow-hidden bg-black/5 outline-offset-4 focus-visible:outline-2 focus-visible:outline-current dark:bg-white/5 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${ready ? 'opacity-0' : ''}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
