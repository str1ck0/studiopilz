/** lets anything on the page open the site menu (the home journey ends by gliding into it) */
export const OPEN_MENU = 'studiopilz:openmenu'
/** fired when the menu closes without leaving the page */
export const MENU_CLOSED = 'studiopilz:menuclosed'

export function openMenu() {
  window.dispatchEvent(new Event(OPEN_MENU))
}
