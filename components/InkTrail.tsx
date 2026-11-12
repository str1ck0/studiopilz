'use client'

import { useEffect, useRef } from 'react'

type Tip = { x: number; y: number; angle: number; life: number; width: number }

const MAX_TIPS = 220

/**
 * Mycelium threads that grow out from the cursor (or finger) and slowly fade.
 * Fills its parent; listens for movement anywhere over that parent.
 * When nobody is moving, a few threads still wander in on their own.
 */
export default function InkTrail({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tips: Tip[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let lastPointer = 0
    let lastSpawn = { x: -1, y: -1 }
    let ink = '#1A1A1A'
    let glow = '#b4532a'

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement)
      ink = styles.getPropertyValue('--foreground').trim() || ink
      glow = document.documentElement.classList.contains('dark') ? '#ff8a3d' : '#9a3b1b'
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
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

        ctx.strokeStyle = ink
        ctx.globalAlpha = Math.min(tip.life / 60, 1) * 0.55
        ctx.lineWidth = tip.width
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(tip.x, tip.y)
        ctx.stroke()

        // the occasional node, like the beads on the home page threads
        if (Math.random() < 0.025) {
          ctx.fillStyle = glow
          ctx.globalAlpha = 0.8
          ctx.beginPath()
          ctx.arc(tip.x, tip.y, 1.4, 0, Math.PI * 2)
          ctx.fill()
        }
        // threads branch now and then
        if (Math.random() < 0.012 && tips.length < MAX_TIPS) {
          tips.push({ ...tip, angle: tip.angle + (Math.random() < 0.5 ? -0.7 : 0.7), life: tip.life * 0.7 })
        }

        if (tip.life <= 0 || tip.x < -20 || tip.y < -20 || tip.x > width + 20 || tip.y > height + 20) {
          tips.splice(i, 1)
        }
      }
      ctx.globalAlpha = 1
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

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />
}
