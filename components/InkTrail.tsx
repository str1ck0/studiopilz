'use client'

import { useEffect, useRef } from 'react'

type Tip = { x: number; y: number; angle: number; life: number; width: number }
type Star = { x: number; y: number; size: number; age: number; life: number; phase: number; speed: number; sparkle: boolean }

const MAX_TIPS = 220
const MAX_STARS = 90
// stars closer than this get a faint constellation line between them
const LINK_DIST = 70

/**
 * Mycelium threads that grow out from the cursor (or finger) and slowly fade.
 * Fills its parent; listens for movement anywhere over that parent.
 * When nobody is moving, a few threads still wander in on their own.
 */
export default function InkTrail({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const starCanvas = starCanvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    const sctx = starCanvas?.getContext('2d')
    if (!canvas || !starCanvas || !host || !ctx || !sctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tips: Tip[] = []
    const stars: Star[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let lastPointer = 0
    let lastSpawn = { x: -1, y: -1 }
    // the warm glow from the original nodes, as "r, g, b" so it can take any alpha
    let starRgb = '154, 59, 27'
    // the hot centre of each thread and star
    let coreRgb = '154, 59, 27'
    let dark = false

    const readColors = () => {
      dark = document.documentElement.classList.contains('dark')
      starRgb = dark ? '255, 138, 61' : '154, 59, 27'
      coreRgb = dark ? '255, 226, 196' : '180, 83, 42'
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      for (const c of [canvas, starCanvas]) {
        c.width = Math.round(width * dpr)
        c.height = Math.round(height * dpr)
        c.style.width = `${width}px`
        c.style.height = `${height}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addStar = (x: number, y: number) => {
      if (stars.length >= MAX_STARS) stars.shift()
      stars.push({
        x,
        y,
        size: 0.6 + Math.random() * 1.1,
        age: 0,
        life: 240 + Math.random() * 260,
        phase: Math.random() * Math.PI * 2,
        speed: 0.04 + Math.random() * 0.06,
        sparkle: Math.random() < 0.18,
      })
    }

    const drawStars = () => {
      sctx.clearRect(0, 0, width, height)
      sctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'

      // a star's brightness: fades in, twinkles, then fades out
      const brightness = (s: Star) => {
        const fadeIn = Math.min(s.age / 30, 1)
        const fadeOut = Math.min((s.life - s.age) / 90, 1)
        const twinkle = 0.65 + 0.35 * Math.sin(s.phase + s.age * s.speed)
        return Math.max(fadeIn * fadeOut * twinkle, 0)
      }

      // faint constellation lines between neighbouring stars
      sctx.lineWidth = 0.5
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i]
          const b = stars[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > LINK_DIST) continue
          const alpha = (1 - d / LINK_DIST) * Math.min(brightness(a), brightness(b)) * 0.28
          if (alpha < 0.01) continue
          sctx.strokeStyle = `rgba(${starRgb}, ${alpha})`
          sctx.beginPath()
          sctx.moveTo(a.x, a.y)
          sctx.lineTo(b.x, b.y)
          sctx.stroke()
        }
      }

      for (const s of stars) {
        const b = brightness(s)
        if (b <= 0) continue
        // soft halo
        const r = s.size * 6
        const halo = sctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r)
        halo.addColorStop(0, `rgba(${starRgb}, ${0.35 * b})`)
        halo.addColorStop(1, `rgba(${starRgb}, 0)`)
        sctx.fillStyle = halo
        sctx.beginPath()
        sctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        sctx.fill()
        // bright core
        sctx.fillStyle = `rgba(${coreRgb}, ${0.95 * b})`
        sctx.beginPath()
        sctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2)
        sctx.fill()
        // the odd one catches the light with a four-point glint
        if (s.sparkle) {
          const len = s.size * 7 * b
          sctx.strokeStyle = `rgba(${starRgb}, ${0.6 * b})`
          sctx.lineWidth = 0.6
          sctx.beginPath()
          sctx.moveTo(s.x - len, s.y)
          sctx.lineTo(s.x + len, s.y)
          sctx.moveTo(s.x, s.y - len)
          sctx.lineTo(s.x, s.y + len)
          sctx.stroke()
        }
      }
      sctx.globalCompositeOperation = 'source-over'

      for (let i = stars.length - 1; i >= 0; i--) {
        if (++stars[i].age >= stars[i].life) stars.splice(i, 1)
      }
    }

    const spawn = (x: number, y: number, count: number) => {
      for (let i = 0; i < count && tips.length < MAX_TIPS; i++) {
        tips.push({
          x,
          y,
          angle: Math.random() * Math.PI * 2,
          life: 60 + Math.random() * 90,
          width: 0.6 + Math.random() * 0.8,
        })
      }
    }

    const onMove = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
      lastPointer = performance.now()
      // only sprout new threads once the pointer has travelled a little
      if (Math.hypot(x - lastSpawn.x, y - lastSpawn.y) < 14) return
      lastSpawn = { x, y }
      spawn(x, y, 2)
    }
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY)
    // touch scrolling cancels pointer events, so follow the finger directly too
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) onMove(t.clientX, t.clientY)
    }

    const step = () => {
      frame = requestAnimationFrame(step)
      if (!visible) return

      // fade everything a touch each frame, so old threads melt away
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.012)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'

      // an idle page still grows a little on its own
      if (performance.now() - lastPointer > 2500 && Math.random() < 0.04) {
        spawn(Math.random() * width, Math.random() * height, 1)
      }

      for (let i = tips.length - 1; i >= 0; i--) {
        const tip = tips[i]
        const fromX = tip.x
        const fromY = tip.y
        tip.angle += (Math.random() - 0.5) * 0.5
        tip.x += Math.cos(tip.angle) * 1.6
        tip.y += Math.sin(tip.angle) * 1.6
        tip.life -= 1

        // each thread is a soft wide halo with a fine bright filament inside
        const fade = Math.min(tip.life / 60, 1)
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(tip.x, tip.y)
        ctx.strokeStyle = `rgba(${starRgb}, ${fade * (dark ? 0.07 : 0.05)})`
        ctx.lineWidth = tip.width * 6
        ctx.stroke()
        ctx.strokeStyle = `rgba(${coreRgb}, ${fade * (dark ? 0.35 : 0.3)})`
        ctx.lineWidth = tip.width * 0.6
        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'

        // now and then a thread leaves a little star behind
        if (Math.random() < 0.012) addStar(tip.x, tip.y)
        // threads branch now and then
        if (Math.random() < 0.012 && tips.length < MAX_TIPS) {
          tips.push({ ...tip, angle: tip.angle + (Math.random() < 0.5 ? -0.7 : 0.7), life: tip.life * 0.7 })
        }

        if (tip.life <= 0 || tip.x < -20 || tip.y < -20 || tip.x > width + 20 || tip.y > height + 20) {
          tips.splice(i, 1)
        }
      }
      ctx.globalAlpha = 1
      drawStars()
    }

    readColors()
    resize()
    frame = requestAnimationFrame(step)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    // the theme toggle flips a class on <html>
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    // stop drawing while the hero is scrolled away
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    viewObserver.observe(host)
    host.addEventListener('pointermove', onPointer, { passive: true })
    host.addEventListener('touchmove', onTouch, { passive: true })
    host.addEventListener('touchstart', onTouch, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      viewObserver.disconnect()
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('touchmove', onTouch)
      host.removeEventListener('touchstart', onTouch)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />
      <canvas ref={starCanvasRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />
    </>
  )
}
