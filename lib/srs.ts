import type { VocabCard, SRSData, SRSGrade } from "./types"

const GOOD_MULTIPLIER = 2.5
const EASY_MULTIPLIER = 3.5
const MAX_INTERVAL = 90
export const DAY_MS = 86_400_000

/** Interval (days) at which a card is considered "learned" for TOPIK purposes */
export const LEARNED_INTERVAL = 21

/** Max new (unseen) cards introduced per day */
export const NEW_CARDS_PER_DAY = 40

/** Target new words per day to learn at a steady pace */
export const NEW_WORDS_GOAL = 12

/** Milestones (learned-word counts) worth celebrating */
export const MILESTONES = [25, 50, 100, 250, 500, 1000]

export function initialSRS(): SRSData {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5, // DB column preserved; not used in scheduling
    dueDate: Date.now(),
    lastReview: 0,
  }
}

export function scheduleCard<T extends { srs: SRSData }>(card: T, grade: SRSGrade): T {
  const now = Date.now()
  const srs = { ...card.srs }

  if (grade === 3) {
    // Forgot — had to flip it. Full reset.
    srs.repetitions = 0
    srs.interval = 1
  } else {
    if (srs.repetitions === 0) {
      // Learning phase: see it again tomorrow (Good) or in 4 days (Easy).
      srs.interval = grade === 5 ? 4 : 1
    } else {
      const multiplier = grade === 5 ? EASY_MULTIPLIER : GOOD_MULTIPLIER
      srs.interval = Math.min(MAX_INTERVAL, Math.round(srs.interval * multiplier))
    }
    srs.repetitions += 1
  }

  srs.dueDate = now + srs.interval * DAY_MS
  srs.lastReview = now

  return { ...card, srs }
}

export function isDue(card: { srs: SRSData }): boolean {
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
export function buildQueue<T extends { srs: SRSData }>(
  cards: T[],
  newCardsSeenToday: number
): { queue: T[]; newSlots: number } {
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

/** Max drill reps per concept per session, for concepts due for review */
export const MAX_DRILLS_PER_CONCEPT = 2

/** Max total items in a concept review session */
export const CONCEPT_QUEUE_CAP = 25

/**
 * Build a concept review queue: no daily new-item cap (small, curated pool),
 * but concepts due for review can appear up to MAX_DRILLS_PER_CONCEPT times
 * (one per drill) so multi-drill concepts get exercised, round-robined so
 * the same concept doesn't repeat back-to-back. Never-seen concepts appear
 * once each. The whole queue is capped at CONCEPT_QUEUE_CAP items.
 */
export function buildConceptQueue<T extends { id: string; srs: SRSData; drills: unknown[] }>(
  items: T[]
): string[] {
  const now = Date.now()
  const reviews = items
    .filter((c) => c.srs.repetitions > 0 && c.srs.dueDate <= now)
    .sort((a, b) => a.srs.dueDate - b.srs.dueDate)
  const newItems = items.filter((c) => c.srs.repetitions === 0)

  const repsFor = (c: T) => Math.min(MAX_DRILLS_PER_CONCEPT, Math.max(1, c.drills.length))
  const maxReps = reviews.reduce((max, c) => Math.max(max, repsFor(c)), 0)

  const ids: string[] = []
  for (let round = 0; round < maxReps; round++) {
    for (const c of reviews) {
      if (round < repsFor(c)) ids.push(c.id)
    }
  }
  for (const c of newItems) ids.push(c.id)

  return ids.slice(0, CONCEPT_QUEUE_CAP)
}

/**
 * Cards that are struggling: seen at least once, in the deck for 7+ days,
 * but still stuck at a short interval — meaning they've been forgotten repeatedly.
 * Sorted by interval ascending (shortest = most stuck).
 */
export function getStruggleCards(cards: VocabCard[]): VocabCard[] {
  const now = Date.now()
  return cards
    .filter((c) => {
      if (c.srs.repetitions === 0) return false
      const ageDays = (now - c.createdAt) / DAY_MS
      return ageDays > 7 && c.srs.interval <= 3
    })
    .sort((a, b) => a.srs.interval - b.srs.interval)
}

/** Cards with interval >= LEARNED_INTERVAL that haven't lapsed more than 30 days */
export function getLearnedCount(cards: VocabCard[]): number {
  const now = Date.now()
  return cards.filter(
    (c) => c.srs.interval >= LEARNED_INTERVAL && c.srs.dueDate > now - 30 * DAY_MS
  ).length
}
