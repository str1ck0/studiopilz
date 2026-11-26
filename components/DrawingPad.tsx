'use client'

import { useRef, useState, useEffect } from 'react'
import { submitGuestbookEntry } from '@/app/actions/guestbook'
import { useRouter } from 'next/navigation'

// soft, earthy papers that sit well on the page's cream and charcoal
const PAPER_COLORS = [
  { name: 'Paper', hex: '#fbf6ec' },
  { name: 'Sand', hex: '#efe2c8' },
  { name: 'Clay', hex: '#ecd0bd' },
  { name: 'Moss', hex: '#d6dcc4' },
  { name: 'Mist', hex: '#d3dbe0' },
  { name: 'Night', hex: '#1f1d1b' },
]

const PEN_COLORS = [
  { name: 'Ink', hex: '#1a1a1a' },
  { name: 'Ember', hex: '#d2551f' },
  { name: 'Ochre', hex: '#c99a2e' },
  { name: 'Moss', hex: '#5d7a3a' },
  { name: 'Deep blue', hex: '#2f4a7a' },
  { name: 'Plum', hex: '#6e3a5e' },
  { name: 'Chalk', hex: '#f2e7d5' },
]

// small mono text buttons, like the email link in the header
const toolButton = 'inline-flex min-h-11 items-center px-2 font-mono text-xs uppercase tracking-widest transition-colors'

export default function DrawingPad() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // State
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(PEN_COLORS[0].hex)
  const [lineWidth, setLineWidth] = useState(3)
  const [isEraser, setIsEraser] = useState(false)
  const [paperColor, setPaperColor] = useState(PAPER_COLORS[0].hex)
  
  const [authorName, setAuthorName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Scale for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    // Set initial styles
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Clear initial
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { x, y } = getCoordinates(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // Set current styles
    ctx.strokeStyle = isEraser ? paperColor : color
    ctx.lineWidth = lineWidth
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Prevent scrolling when drawing on touch devices
    if ('touches' in e) e.preventDefault()
    
    const { x, y } = getCoordinates(e, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.closePath()
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && isCanvasBlank()) {
      setErrorMessage('Please leave a message or draw something.')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      // Get base64 string only if there is a drawing
      const drawingData = isCanvasBlank() ? undefined : canvasRef.current?.toDataURL('image/png')
      
      const result = await submitGuestbookEntry({
        authorName,
        message,
        drawingData,
        paperColor
      })
      
      if (result.success) {
        setSubmitStatus('success')
        // Reset form
        setAuthorName('')
        setMessage('')
        clearCanvas()
        router.refresh()
        
        // Reset status message after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit.')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // helper to check if canvas actually has pixels (not strictly perfect but good enough for simple clear)
  const isCanvasBlank = () => {
    const canvas = canvasRef.current
    if (!canvas) return true
    const ctx = canvas.getContext('2d')
    if (!ctx) return true
    
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    )
    return !pixelBuffer.some(color => color !== 0)
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="font-mono text-sm uppercase tracking-widest opacity-60">Draw or write something for the studio.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* the paper, with its tools along the top edge */}
        <div
          className="w-full overflow-hidden rounded-xl border border-foreground/10 transition-colors duration-300"
          style={{ backgroundColor: paperColor }}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-black/10 bg-background/80 px-2 backdrop-blur-sm">
            <div className="flex flex-wrap items-center">
              {PEN_COLORS.map((c) => {
                const active = color === c.hex && !isEraser
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => { setColor(c.hex); setIsEraser(false) }}
                    className="flex h-11 w-9 items-center justify-center"
                    aria-label={`Pen colour ${c.name}`}
                    aria-pressed={active}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full border border-foreground/20 transition-transform ${active ? 'scale-125 ring-2 ring-glow ring-offset-2 ring-offset-background' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-2">
              <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                aria-pressed={isEraser}
                className={`${toolButton} ${isEraser ? 'text-glow underline underline-offset-4' : 'opacity-60 hover:opacity-100'}`}
              >
                Eraser
              </button>
              <button type="button" onClick={clearCanvas} className={`${toolButton} opacity-60 hover:text-glow hover:opacity-100`}>
                Clear
              </button>
              <label className={`${toolButton} gap-2 opacity-60`}>
                Size
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="w-20 accent-glow"
                />
              </label>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block h-[320px] w-full cursor-crosshair touch-none md:h-[400px]"
          />
        </div>

        {/* words, paper and sending */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border-b border-foreground/20 bg-transparent py-2 font-mono text-base transition-colors focus:border-glow focus:outline-none"
            />
            <textarea
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-foreground/20 bg-transparent p-4 text-base transition-colors focus:border-glow focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-widest opacity-60">Paper</span>
              <div className="flex flex-wrap">
                {PAPER_COLORS.map((pc) => {
                  const active = paperColor === pc.hex
                  return (
                    <button
                      key={pc.hex}
                      type="button"
                      onClick={() => setPaperColor(pc.hex)}
                      className="flex h-11 w-11 items-center justify-center"
                      aria-label={`Paper colour ${pc.name}`}
                      aria-pressed={active}
                      title={pc.name}
                    >
                      <span
                        className={`block h-7 w-7 rounded-full border border-foreground/20 transition-transform ${active ? 'ring-2 ring-glow ring-offset-2 ring-offset-background' : 'hover:scale-105'}`}
                        style={{ backgroundColor: pc.hex }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {submitStatus === 'error' && <p className="font-mono text-sm text-glow">{errorMessage}</p>}
              {submitStatus === 'success' && <p className="font-mono text-sm text-glow">Your note has joined the network ✦</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-foreground/20 px-6 font-mono text-sm uppercase tracking-widest transition-colors hover:border-glow hover:text-glow disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Post to the gallery ↗'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}
