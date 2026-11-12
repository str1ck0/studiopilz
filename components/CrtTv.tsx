'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'

export type Channel = { kind: 'image'; url: string; alt: string } | { kind: 'video'; url: string } | { kind: 'ident'; name: string; role: string }

/**
 * A small CRT television. It switches on when it scrolls into view, and a tap on
 * the screen (or the channel buttons) changes the channel through a burst of static.
 */
export default function CrtTv({ channels, label }: { channels: Channel[]; label: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const noiseRef = useRef<HTMLCanvasElement>(null)
  const burstRef = useRef(false)
  const [on, setOn] = useState(false)
  const [channel, setChannel] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [osd, setOsd] = useState(false)
  const timers = useRef<number[]>([])

  // switch on the first time the set comes into view
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // the faint, ever-moving grain of a tube; it swells into full static between channels
  useEffect(() => {
    const canvas = noiseRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !on) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const w = (canvas.width = 160)
    const h = (canvas.height = 120)
    const image = ctx.createImageData(w, h)
    const pixels = new Uint32Array(image.data.buffer)
    let frame = 0
    let last = 0
    let visible = true
    const view = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    view.observe(canvas)

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      // static runs at full speed; idle grain only needs about 15 frames a second
      if (!visible || (!burstRef.current && now - last < 66)) return
      last = now
      for (let i = 0; i < pixels.length; i++) {
        const v = (Math.random() * 255) | 0
        pixels[i] = 0xff000000 | (v << 16) | (v << 8) | v
      }
      ctx.putImageData(image, 0, 0)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      view.disconnect()
    }
  }, [on])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const changeChannel = (step = 1) => {
    if (!on || burstRef.current) return
    const next = (channel + step + channels.length) % channels.length
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setChannel(next)
      return
    }
    burstRef.current = true
    setRolling(true)
    setOsd(true)
    later(() => setChannel(next), 140)
    later(() => {
      burstRef.current = false
      setRolling(false)
    }, 420)
    later(() => setOsd(false), 2200)
  }

  const current = channels[channel]

  return (
    <div ref={rootRef} className="w-full">
      {/* the set: dark plastic, the tube sunk into it */}
      <div className="rounded-[22px] bg-[linear-gradient(160deg,#2a2724,#161412)] p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4">
        <button
          type="button"
          onClick={() => changeChannel(1)}
          aria-label={`${label}: change channel (${channel + 1} of ${channels.length})`}
          className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[18px/22px] bg-[#0b0b0a] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.8)] focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {/* the picture */}
          <div
            className="absolute inset-0"
            style={{
              opacity: on ? 1 : 0,
              animation: on
                ? `crt-on 900ms cubic-bezier(0.2,0.8,0.2,1) both${rolling ? ', crt-roll 420ms ease-out' : ''}`
                : undefined,
            }}
          >
            <div className="absolute inset-0 motion-safe:animate-[crt-flicker_0.12s_steps(2)_infinite]">
              {current.kind === 'image' && (
                <img
                  src={current.url}
                  alt={current.alt}
                  className="h-full w-full scale-[1.04] object-cover [filter:contrast(1.12)_saturate(0.8)_sepia(0.12)_blur(0.35px)]"
                />
              )}
              {current.kind === 'video' && (
                <video
                  key={current.url}
                  src={current.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full scale-[1.04] object-cover [filter:contrast(1.12)_saturate(0.8)_sepia(0.12)_blur(0.35px)]"
                />
              )}
              {current.kind === 'ident' && (
                <div className="flex h-full w-full flex-col items-start justify-end gap-1 bg-[#101418] p-[8%] text-left font-mono text-[#eae6da] [text-shadow:-1px_0_rgba(255,60,60,0.45),1px_0_rgba(60,140,255,0.45),0_0_8px_rgba(255,255,255,0.35)]">
                  <span className="text-[clamp(1rem,4vw,2rem)] uppercase leading-none tracking-wider">{current.name}</span>
                  <span className="text-[clamp(0.6rem,1.6vw,0.8rem)] uppercase tracking-[0.25em] opacity-70">{current.role}</span>
                </div>
              )}
            </div>

            {/* scanlines and a soft bright band drifting down the tube */}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.035),transparent)] motion-safe:animate-[crt-band_7s_linear_infinite]" />
          </div>

          {/* grain at rest, full static between channels */}
          <canvas
            ref={noiseRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen transition-opacity duration-150 [image-rendering:pixelated]"
            style={{ opacity: !on ? 0 : rolling ? 0.9 : 0.07 }}
          />

          {/* channel number, the way old sets flashed it in the corner */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-[6%] top-[7%] font-mono text-[clamp(0.9rem,2.4vw,1.4rem)] tracking-wider text-[#f2efe6] transition-opacity duration-300 [text-shadow:-1px_0_rgba(255,60,60,0.5),1px_0_rgba(60,140,255,0.5),0_0_6px_rgba(255,255,255,0.5)]"
            style={{ opacity: osd ? 1 : 0 }}
          >
            CH {String(channel + 1).padStart(2, '0')}
          </span>

          {/* the curve of the glass: dark corners and a glare from the room */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_70px_18px_rgba(0,0,0,0.85),inset_0_0_14px_rgba(0,0,0,0.9)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(120%_80%_at_28%_12%,rgba(255,255,255,0.10),transparent_45%)]" />
        </button>

        {/* the control panel under the screen: speaker slots, pilot lamp, channel keys */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[6px] bg-[linear-gradient(to_bottom,#9b968c,#7d786f_45%,#8e897f)] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            {/* speaker grille */}
            <span aria-hidden className="flex gap-[3px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="block h-4 w-[3px] rounded-full bg-[#2b2925] shadow-[0_1px_0_rgba(255,255,255,0.3)]" />
              ))}
            </span>
            {/* pilot lamp behind red glass */}
            <span
              aria-hidden
              className="block h-2.5 w-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.3)] transition-all duration-700"
              style={{
                background: on
                  ? 'radial-gradient(circle at 40% 35%, #ffd2b8, #ff5a2a 45%, #9c1e08)'
                  : 'radial-gradient(circle at 40% 35%, #8a4a3a, #4a1c12 60%)',
                boxShadow: on ? '0 0 8px 1px rgba(255,90,42,0.55), inset 0 1px 1px rgba(0,0,0,0.4)' : undefined,
              }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span aria-hidden className="mr-1 font-serif text-[9px] uppercase tracking-[0.2em] text-[#2e2b27] [text-shadow:0_1px_0_rgba(255,255,255,0.35)]">
              Channel
            </span>
            {/* two ivory push keys, like the ones on sets from the seventies */}
            {([-1, 1] as const).map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => changeChannel(step)}
                aria-label={`${label}: ${step < 0 ? 'previous' : 'next'} channel`}
                className="group grid h-11 w-10 place-items-center"
              >
                <span className="grid h-7 w-8 place-items-center rounded-[3px] bg-[linear-gradient(to_bottom,#f3ead6,#ddd0b4)] font-serif text-sm font-bold leading-none text-[#5a5246] shadow-[0_3px_0_#a99c80,0_4px_3px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-75 group-active:translate-y-[3px] group-active:shadow-[0_0_0_#a99c80,0_1px_1px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.15)]">
                  {step < 0 ? '−' : '+'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
