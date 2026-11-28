/**
 * The spores that live in the studio mark. They rest as the logo and come out for
 * a few moments: drifting through the home intro (then swooshing into the logo),
 * falling slowly on the shop, and in the menu, drifting over it, gathering into a
 * shape behind the word you reach for, and drawn into the word you pick.
 */

export type SporeForm = 'drift' | 'word' | 'logo' | 'fall' | MenuShape

/** the shapes the spores gather into behind each menu word */
export type MenuShape = 'pyramid' | 'mushroom' | 'star' | 'spiral' | 'dove'
export const MENU_SHAPES: MenuShape[] = ['pyramid', 'star', 'spiral', 'mushroom', 'dove']

/** a borrowed form, and optionally the element (a CSS selector) it should gather around */
export type SporeOverride = { form: SporeForm; anchor?: string } | null

let override: SporeOverride = null
let homeHero = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export function setSporeOverride(next: SporeOverride) {
  if (next?.form === override?.form && next?.anchor === override?.anchor) return
  override = next
  notify()
}

export function getSporeOverride() {
  return override
}

/** the home page's opening scene is on screen: the spores drift until it ends */
export function setHomeHero(on: boolean) {
  if (on === homeHero) return
  homeHero = on
  notify()
}

export function isHomeHero() {
  return homeHero
}

export function subscribeSpores(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
