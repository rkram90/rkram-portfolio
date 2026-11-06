// Pure helpers for the career timeline's scroll marker (no DOM, unit-tested).

export function clampOffset(value: number, max: number): number {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

/** "2021-07" → 2021.5; `null` → `now` as a decimal year. */
export function ymToDecimal(ym: string | null, now = new Date()): number {
  if (ym === null) return now.getFullYear() + now.getMonth() / 12;
  const [y, m] = ym.split('-').map(Number);
  return y + (m - 1) / 12;
}

/**
 * Scroll progress through the timeline, 0 → 1. Starts when its top reaches `anchor` (px from the
 * viewport top) and ends when the page can scroll no further (`remaining` = px of scroll left), so the
 * marker always reaches the last row even when it can never pass the anchor.
 */
export function scrollProgress(top: number, anchor: number, remaining: number): number {
  const span = anchor - (top - remaining); // anchor minus the top position at max scroll
  return span <= 0 ? 1 : clampOffset((anchor - top) / span, 1);
}

/** Inclusive month count, e.g. "2024-05" → "2025-04" = 12. */
export function monthsBetween(start: string, end: string | null, now = new Date()): number {
  return Math.round((ymToDecimal(end, now) - ymToDecimal(start, now)) * 12) + 1;
}
