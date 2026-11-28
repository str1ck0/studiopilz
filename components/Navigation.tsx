'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useAnimate, useReducedMotion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MENU_SHAPES, getSporeOverride, setSporeOverride } from '@/lib/spores'

// once a word is picked, the spores are on their way into it: nothing else may call them away
let picking = false

/** only while the menu has the spores: a word blurring as the menu closes mustn't take them back */
const steer = (next: Parameters<typeof setSporeOverride>[0]) => {
  if (getSporeOverride() && !picking) setSporeOverride(next)
}

/** the spores gather into this word's shape behind it */
const gather = (index: number) => steer({ form: MENU_SHAPES[index], anchor: `[data-spore-word="${index}"]` })

// how long the spores take to be drawn into a picked word
const ABSORB_MS = 750

/**
 * Picking a word draws every spore into it; then it goes. Returns false when the click
 * should just happen as usual (a new tab, reduced motion).
 */
function absorb(e: React.MouseEvent, index: number, go: () => void, reduceMotion: boolean) {
  if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return false
  e.preventDefault()
  setSporeOverride({ form: 'word', anchor: `[data-spore-word="${index}"]` })
  picking = true
  window.setTimeout(() => {
    go()
    picking = false
  }, ABSORB_MS)
  return true
}
import { MENU_CLOSED, OPEN_MENU } from '@/lib/menu'
import { WOBBLE, WOBBLE_TIMING } from '@/lib/wobble'
import type { SiteSettings } from '@/types'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'Studio' },
  { href: '/shop', label: 'Shop' },
]

// the words, plus the contact that sprouts last
const SPROUTS = LINKS.length + 1

// the words sprout at different spots, like mushrooms after rain
const SPOTS = ['ml-[2%] md:ml-[6%]', 'ml-[24%] md:ml-[40%]', 'ml-[6%] md:ml-[18%]', 'ml-[20%] md:ml-[52%]', 'ml-[4%] md:ml-[28%]']
const SIZES = [1, 0.88, 1.02, 0.8, 0.62]
const wordSize = (k: number) => `calc(clamp(2.75rem, min(15vw, 11dvh), 8.5rem) * ${k})`

/** the spring a word sprouts up with, one after another */
const sprout = (index: number, reduceMotion: boolean) => ({
  closed: reduceMotion
    ? { opacity: 0 }
    : { scaleY: 0, scaleX: 0.4, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' as const } },
  open: reduceMotion
    ? { opacity: 1 }
    : {
        scaleY: 1,
        scaleX: 1,
        opacity: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 320,
          damping: 11,
          mass: 0.8,
          delay: 0.1 + STAGGER_S * ((index + 1) / SPROUTS) * 0.9,
        },
      },
})

// how long it takes for every word to have sprouted
const STAGGER_S = 0.7

const logoMask = {
  WebkitMaskImage: 'url(/studiopilz_logo.svg)',
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'left center',
  maskImage: 'url(/studiopilz_logo.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'left center',
} as const

// the mark's lens: light and dark swap so it always reads, but the hues are turned back
// around, so it takes on the colours of whatever is behind it
const LENS = 'invert(1) hue-rotate(180deg) saturate(1.7) contrast(1.1)'

const isActive = (href: string, pathname: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

/** A word that sprouts up from its base, and wobbles
 *  like the mushroom on the home page when you reach for it. */
function MenuLink({
  link,
  index,
  active,
  reduceMotion,
  close,
}: {
  link: (typeof LINKS)[number]
  index: number
  active: boolean
  reduceMotion: boolean
  close: () => void
}) {
  const { href, label } = link
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const router = useRouter()
  const [picked, setPicked] = useState(false)

  const enter = useCallback(() => {
    gather(index)
    if (reduceMotion || !scope.current) return
    animate(scope.current, WOBBLE, WOBBLE_TIMING)
  }, [animate, index, reduceMotion, scope])

  const leave = useCallback(() => steer({ form: 'drift' }), [])

  return (
    <li className={`w-fit ${SPOTS[index]}`}>
      <motion.div style={{ transformOrigin: '0% 100%' }} variants={sprout(index, reduceMotion)}>
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          onPointerEnter={(e) => e.pointerType === 'mouse' && enter()}
          onPointerLeave={(e) => e.pointerType === 'mouse' && leave()}
          onFocus={enter}
          onBlur={leave}
          onClick={(e) => {
            // the same page: nothing to load, the menu just closes once they're in
            if (absorb(e, index, () => (active && href === window.location.pathname ? close() : router.push(href)), reduceMotion))
              setPicked(true)
          }}
          className={`group block py-1 outline-none ${active || picked ? 'text-glow' : ''}`}
        >
          <span
            ref={scope}
            data-spore-word={index}
            className="block origin-bottom font-semibold lowercase leading-[0.9] tracking-[-0.05em] transition-colors duration-500 group-hover:text-glow group-focus-visible:text-glow"
            style={{ fontSize: wordSize(SIZES[index]) }}
          >
            {label}
          </span>
        </Link>
      </motion.div>
    </li>
  )
}

/** The last sprout: who to write to, and where else to find us. */
function ContactSprout({ settings, reduceMotion }: { settings: SiteSettings | null; reduceMotion: boolean }) {
  const index = LINKS.length
  const email = settings?.contactEmail || 'hello@studiopilz.com'
  const socials = settings?.socialLinks ?? []
  const hover = () => gather(index)
  const rest = () => steer({ form: 'drift' })
  const [picked, setPicked] = useState(false)
  const linkClass =
    'flex min-h-11 items-center gap-2 underline-offset-4 transition-colors hover:text-glow hover:underline focus-visible:text-glow focus-visible:underline outline-none sm:min-h-0'

  return (
    <li className={`w-fit max-w-full ${SPOTS[index]}`}>
      <motion.div
        style={{ transformOrigin: '0% 100%' }}
        variants={sprout(index, reduceMotion)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-8"
      >
        <a
          href={`mailto:${email}`}
          data-spore-word={index}
          onPointerEnter={(e) => e.pointerType === 'mouse' && hover()}
          onPointerLeave={(e) => e.pointerType === 'mouse' && rest()}
          onFocus={hover}
          onBlur={rest}
          onClick={(e) => {
            const go = () => {
              window.location.href = `mailto:${email}`
              // the mail app takes over; the spores wander out of the word again
              window.setTimeout(() => {
                setPicked(false)
                steer({ form: 'drift' })
              }, 600)
            }
            if (absorb(e, index, go, reduceMotion)) setPicked(true)
          }}
          className={`block font-semibold lowercase leading-[0.9] tracking-[-0.05em] outline-none transition-colors duration-500 hover:text-glow focus-visible:text-glow ${picked ? 'text-glow' : ''}`}
          style={{ fontSize: wordSize(SIZES[index]) }}
        >
          contact
        </a>
        <div className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1 pb-1 font-mono text-xs lowercase tracking-wide">
          <div>
            <p className="mb-1 opacity-50">say hello</p>
            <a href={`mailto:${email}`} className={linkClass}>
              {email}
            </a>
          </div>
          {socials.length > 0 && (
            <div>
              <p className="mb-1 opacity-50">find us</p>
              <ul>
                {socials.map((s) => (
                  <li key={s.platform}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {s.platform} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </li>
  )
}

export default function Navigation({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const reduceMotion = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // the end of the home journey is a door into the menu
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_MENU, onOpen)
    return () => window.removeEventListener(OPEN_MENU, onOpen)
  }, [])

  // close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  // while open: the spores float over the menu, no page scroll behind it,
  // Escape closes, Tab stays inside
  useEffect(() => {
    if (!open) return
    setSporeOverride({ form: 'drift' })
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    const toggle = toggleRef.current

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = [toggle, ...panelRef.current.querySelectorAll<HTMLElement>('a, button')].filter(Boolean) as HTMLElement[]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      picking = false
      setSporeOverride(null)
      window.dispatchEvent(new Event(MENU_CLOSED))
      html.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      toggle?.focus({ preventScroll: true })
    }
  }, [open])

  const [logoScope, animateLogo] = useAnimate<HTMLSpanElement>()
  const wobbleLogo = useCallback(() => {
    if (!reduceMotion && logoScope.current) animateLogo(logoScope.current, WOBBLE, WOBBLE_TIMING)
  }, [animateLogo, logoScope, reduceMotion])

  const isDark = resolvedTheme === 'dark'
  const gutter = {
    paddingLeft: 'max(1rem, env(safe-area-inset-left))',
    paddingRight: 'max(1rem, env(safe-area-inset-right))',
  }

  return (
    <nav aria-label="Main">
      {/* the mark is a lens onto whatever is behind it (see LENS). the spores rest here.
          careful: dimming it or any wrapper (opacity, filters) blanks the lens */}
      <Link
        href="/"
        aria-label="Studio Pilz, home"
        tabIndex={open ? -1 : undefined}
        onPointerEnter={wobbleLogo}
        onFocus={wobbleLogo}
        className={`fixed left-0 top-0 z-50 flex min-h-11 items-center px-4 py-3 sm:px-6 md:px-8 ${
          open ? 'pointer-events-none invisible' : ''
        }`}
        style={{ paddingLeft: gutter.paddingLeft, paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <span
          ref={logoScope}
          data-spore-logo
          className="block h-9 w-28 bg-foreground sm:h-10 sm:w-36 supports-[backdrop-filter:invert(1)]:bg-transparent"
          style={{ ...logoMask, backdropFilter: LENS, WebkitBackdropFilter: LENS }}
        />
      </Link>

      {/* the buttons invert whatever passes beneath them */}
      <div
        className="fixed right-0 top-0 z-50 flex items-center px-4 py-3 text-white mix-blend-difference sm:px-6 md:px-8"
        style={{ paddingRight: gutter.paddingRight, paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex min-h-11 items-center px-2 font-mono text-xs lowercase tracking-[0.15em] opacity-70 transition-opacity hover:opacity-100"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? 'day' : 'night'}
            </button>
          )}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="group flex min-h-11 items-center gap-2 px-2 font-mono text-xs lowercase tracking-[0.15em]"
          >
            {/* a spore: it swells when you reach for it, and splits open with the menu */}
            <span aria-hidden className="relative block size-2.5">
              <span
                className={`absolute inset-0 rounded-full bg-current transition-transform duration-300 ${
                  open ? '-translate-x-1 scale-75' : 'group-hover:scale-125'
                }`}
              />
              <span
                className={`absolute inset-0 rounded-full bg-current transition-transform duration-300 ${open ? 'translate-x-1 scale-75' : 'scale-0'}`}
              />
            </span>
            {open ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {/* the menu comes in two layers with the spores between them: they drift over
            this backdrop, gather into a shape behind the word you reach for, and are drawn into the one you pick */}
        {open && (
          <motion.div
            key="menu-backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: reduceMotion ? 0 : 0.15 } }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md"
          />
        )}
        {open && (
          <motion.div
            id="site-menu"
            ref={panelRef}
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              closed: { opacity: 0, transition: { duration: 0.3, delay: reduceMotion ? 0 : 0.15 } },
              open: { opacity: 1, transition: { duration: 0.3 } },
            }}
            className="fixed inset-0 z-[46] flex h-dvh flex-col overflow-y-auto text-foreground"
          >
            <div
              className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-4 sm:px-6 md:px-8"
              style={{
                ...gutter,
                paddingTop: 'calc(5rem + env(safe-area-inset-top))',
                paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
              }}
            >
              <ul className="flex w-full flex-col gap-[min(3dvh,1.5rem)]">
                {LINKS.map((link, i) => (
                  <MenuLink
                    key={link.href}
                    link={link}
                    index={i}
                    active={isActive(link.href, pathname)}
                    reduceMotion={reduceMotion}
                    close={() => setOpen(false)}
                  />
                ))}
                <ContactSprout settings={settings} reduceMotion={reduceMotion} />
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
