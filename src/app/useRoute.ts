import { useSyncExternalStore } from 'react'

function getPathname() {
  return window.location.pathname
}

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

/**
 * Reactive pathname that re-renders on browser back/forward navigation
 * and on programmatic `navigate()` calls.
 */
export function useRoute() {
  return useSyncExternalStore(subscribe, getPathname, getPathname)
}

/**
 * Push a new entry into the browser history and notify all `useRoute()`
 * subscribers so the app re-renders without a full page reload.
 */
export function navigate(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
