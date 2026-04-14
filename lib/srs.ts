import type { VocabCard, SRSData, SRSGrade } from "./types"

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
const HARD_MULTIPLIER = 1.2
const EASY_BONUS = 1.3
export const DAY_MS = 86_400_000

/** Interval (days) at which a card is considered "learned" for TOPIK purposes */
export const LEARNED_INTERVAL = 21

/** Max new (unseen) cards introduced per day */
export const NEW_CARDS_PER_DAY = 20

export function initialSRS(): SRSData {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    dueDate: Date.now(),
    lastReview: 0,
  }
}

/** SM-2 algorithm. Returns a new card with updated SRS fields. */
export function scheduleCard(card: VocabCard, grade: SRSGrade): VocabCard {
  const now = Date.now()
  const srs = { ...card.srs }

  if (grade < 3) {
    // Again — full reset, ease penalty (Anki: -0.20)
    srs.repetitions = 0
    srs.interval = 1
    srs.easeFactor = Math.max(MIN_EASE_FACTOR, srs.easeFactor - 0.2)
  } else {
    // Hard (3): ease -0.15, Good (4): ease unchanged, Easy (5): ease +0.10
    const easeDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
    srs.easeFactor = Math.max(MIN_EASE_FACTOR, srs.easeFactor + easeDelta)

    if (srs.repetitions === 0) {
      // First pass of a new card
      srs.interval = grade === 5 ? 4 : 1
    } else if (srs.repetitions === 1) {
      // Second pass — differentiate early intervals
      srs.interval = grade === 3 ? 3 : grade === 5 ? 8 : 6
    } else {
      // Review phase — Anki-style multipliers per grade
      if (grade === 3) {
        srs.interval = Math.max(srs.interval + 1, Math.round(srs.interval * HARD_MULTIPLIER))
      } else if (grade === 5) {
        srs.interval = Math.round(srs.interval * srs.easeFactor * EASY_BONUS)
      } else {
        srs.interval = Math.round(srs.interval * srs.easeFactor)
      }
    }
    srs.repetitions += 1
  }

  srs.dueDate = now + srs.interval * DAY_MS
  srs.lastReview = now

  return { ...card, srs }
}

export function isDue(card: VocabCard): boolean {
  return card.srs.dueDate <= Date.now()
}

export function dueCount(cards: VocabCard[]): number {
  // Due = overdue reviews + new cards capped by daily limit
  // (just a rough count for the dashboard banner)
  const now = Date.now()
  const reviews = cards.filter(
    (c) => c.srs.repetitions > 0 && c.srs.dueDate <= now
  ).length
  const newCards = Math.min(
    cards.filter((c) => c.srs.repetitions === 0).length,
    NEW_CARDS_PER_DAY
  )
  return reviews + newCards
}

export function getDueCards(cards: VocabCard[]): VocabCard[] {
  const now = Date.now()
  return cards
    .filter((c) => c.srs.dueDate <= now)
    .sort((a, b) => a.srs.dueDate - b.srs.dueDate)
}

/**
 * Build today's review queue:
 * - All overdue reviews (repetitions > 0, dueDate <= now)
 * - Up to (NEW_CARDS_PER_DAY - newCardsSeenToday) new cards
 */
export function buildQueue(
  cards: VocabCard[],
  newCardsSeenToday: number
): { queue: VocabCard[]; newSlots: number } {
  const now = Date.now()
  const reviews = cards
    .filter((c) => c.srs.repetitions > 0 && c.srs.dueDate <= now)
    .sort((a, b) => a.srs.dueDate - b.srs.dueDate)

  const newSlots = Math.max(0, NEW_CARDS_PER_DAY - newCardsSeenToday)
  const newCards = cards
    .filter((c) => c.srs.repetitions === 0)
    .slice(0, newSlots)

  return { queue: [...reviews, ...newCards], newSlots }
}

/** Ease factor below which a card is considered a struggle card */
export const STRUGGLE_EASE_THRESHOLD = 2.0

/**
 * Cards that are struggling:
 * - Low ease factor (repeatedly graded Hard/Again over time), OR
 * - Seen 2+ times but stuck at a short interval (repeated resets)
 * Excludes unseen cards. Sorted hardest-first (lowest ease factor).
 */
export function getStruggleCards(cards: VocabCard[]): VocabCard[] {
  return cards
    .filter(
      (c) =>
        c.srs.repetitions > 0 &&
        (c.srs.easeFactor < STRUGGLE_EASE_THRESHOLD ||
          (c.srs.repetitions >= 2 && c.srs.interval < 7))
    )
    .sort((a, b) => a.srs.easeFactor - b.srs.easeFactor)
}

/** Cards with interval >= LEARNED_INTERVAL that haven't lapsed more than 30 days */
export function getLearnedCount(cards: VocabCard[]): number {
  const now = Date.now()
  return cards.filter(
    (c) => c.srs.interval >= LEARNED_INTERVAL && c.srs.dueDate > now - 30 * DAY_MS
  ).length
}
