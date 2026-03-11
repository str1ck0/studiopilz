'use client'

import { useRef, useState, useEffect } from 'react'
import { submitGuestbookEntry } from '@/app/actions/guestbook'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const PAPER_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Cream', hex: '#fdfbf0' },
  { name: 'Pale Yellow', hex: '#fff9c4' },
  { name: 'Soft Pink', hex: '#f8bbd0' },
  { name: 'Mint', hex: '#c8e6c9' },
  { name: 'Ice Blue', hex: '#b3e5fc' }
]

const PEN_COLORS = ['#000000', '#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#ffffff']

export default function DrawingPad() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // State
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
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
    } catch (err) {
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
    <div className="w-full max-w-4xl mx-auto border border-foreground/20 p-6 md:p-8 bg-background relative overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter mb-2">Leave a Note</h2>
        <p className="text-foreground/70 font-mono text-sm">Draw or write something for the studio.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Paper & Canvas Area */}
        <div 
          className="w-full rounded-sm shadow-inner transition-colors duration-300 relative border border-foreground/10"
          style={{ backgroundColor: paperColor }}
        >
          {/* Controls Bar inside the pad container */}
          <div className="absolute top-0 left-0 right-0 p-3 flex flex-wrap gap-4 justify-between items-center bg-black/5 dark:bg-white/5 backdrop-blur-sm z-10 border-b border-foreground/5">
            
            {/* Tools */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-background/50 rounded-full p-1 border border-foreground/10">
                {PEN_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setColor(c); setIsEraser(false) }}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c && !isEraser ? 'scale-125 ring-2 ring-foreground/20 ring-offset-1' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              
              <div className="h-6 w-px bg-foreground/20 mx-1" />
              
              <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full transition-colors ${isEraser ? 'bg-foreground text-background' : 'bg-background/50 text-foreground border border-foreground/20'}`}
              >
                Eraser
              </button>
              
              <button
                type="button"
                onClick={clearCanvas}
                className="px-3 py-1 text-xs font-mono uppercase tracking-widest bg-background/50 text-foreground border border-foreground/20 rounded-full hover:bg-red-500/10 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-black">Size:</span>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-24 accent-foreground"
              />
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
            className="w-full h-[400px] cursor-crosshair touch-none mt-12"
          />
        </div>

        {/* Text Input & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/20 py-2 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            <textarea
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-transparent border border-foreground/20 p-4 font-sans focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-6 justify-between">
            <div>
              <span className="text-sm font-mono opacity-60 uppercase tracking-widest block mb-3">Paper Color</span>
              <div className="flex flex-wrap gap-2">
                {PAPER_COLORS.map(pc => (
                  <button
                    key={pc.hex}
                    type="button"
                    onClick={() => setPaperColor(pc.hex)}
                    className={`w-10 h-10 rounded-full transition-transform ${paperColor === pc.hex ? 'scale-110 ring-2 ring-foreground/40 ring-offset-2 ring-offset-background' : 'hover:scale-105'}`}
                    style={{ backgroundColor: pc.hex, border: '1px solid rgba(150,150,150,0.2)' }}
                    title={pc.name}
                  />
                ))}
              </div>
            </div>

            <div>
              {submitStatus === 'error' && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
              {submitStatus === 'success' && <p className="text-green-500 font-mono text-sm mb-2">Note added to gallery!</p>}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative px-8 py-4 bg-foreground text-background font-mono text-sm tracking-widest uppercase overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10 transition-colors group-hover:text-foreground">
                  {isSubmitting ? 'Submitting...' : 'Post to Gallery'}
                </span>
                <div className="absolute inset-0 bg-background border border-foreground translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}
