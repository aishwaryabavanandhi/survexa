/**
 * formatters.js — reusable display helpers
 */

/** Format a number with K/M suffix */
export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/** Format a Date or ISO string to "May 3, 2026" */
export function formatDate(value) {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format seconds to "Xm Ys" */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** Clamp a number between min and max */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

/** Capitalise first letter */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
