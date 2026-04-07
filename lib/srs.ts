import type { VocabCard, SRSData, SRSGrade } from "./types"

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
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
    // Failed — reset
    srs.repetitions = 0
    srs.interval = 1
  } else {
    // Passed — advance
    const easeDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
    srs.easeFactor = Math.max(MIN_EASE_FACTOR, srs.easeFactor + easeDelta)

    if (srs.repetitions === 0) {
      srs.interval = 1
    } else if (srs.repetitions === 1) {
      srs.interval = 6
    } else {
      srs.interval = Math.round(srs.interval * srs.easeFactor)
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

/** Cards with interval >= LEARNED_INTERVAL that haven't lapsed more than 30 days */
export function getLearnedCount(cards: VocabCard[]): number {
  const now = Date.now()
  return cards.filter(
    (c) => c.srs.interval >= LEARNED_INTERVAL && c.srs.dueDate > now - 30 * DAY_MS
  ).length
}
