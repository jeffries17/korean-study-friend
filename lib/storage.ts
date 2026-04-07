import type { VocabCard, StudySession } from "./types"

const CARDS_KEY = "ksf-cards"
const SESSIONS_KEY = "ksf-sessions"

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export function getAllCards(): VocabCard[] {
  return getItem<VocabCard[]>(CARDS_KEY, [])
}

export function saveCards(cards: VocabCard[]): void {
  setItem(CARDS_KEY, cards)
}

export function upsertCard(card: VocabCard): void {
  const cards = getAllCards()
  const idx = cards.findIndex((c) => c.id === card.id)
  if (idx >= 0) {
    cards[idx] = card
  } else {
    cards.push(card)
  }
  saveCards(cards)
}

export function deleteCard(id: string): void {
  saveCards(getAllCards().filter((c) => c.id !== id))
}

export function getCardsBySession(sessionId: string): VocabCard[] {
  return getAllCards().filter((c) => c.sessionId === sessionId)
}

// ── Review log ────────────────────────────────────────────────────────────────

const REVIEW_LOG_KEY = "ksf-review-log"

// Record of YYYY-MM-DD → review count
export type ReviewLog = Record<string, number>

export function getReviewLog(): ReviewLog {
  return getItem<ReviewLog>(REVIEW_LOG_KEY, {})
}

export function logReviews(count: number): void {
  if (count <= 0) return
  const log = getReviewLog()
  const today = new Date().toISOString().slice(0, 10)
  log[today] = (log[today] ?? 0) + count
  setItem(REVIEW_LOG_KEY, log)
}

// ── New card daily counter ────────────────────────────────────────────────────

const NEW_CARDS_KEY = "ksf-new-cards-today"

interface NewCardsEntry { date: string; count: number }

export function getNewCardsSeenToday(): number {
  const entry = getItem<NewCardsEntry | null>(NEW_CARDS_KEY, null)
  const today = new Date().toISOString().slice(0, 10)
  return entry?.date === today ? entry.count : 0
}

export function incrementNewCardsSeen(): void {
  const today = new Date().toISOString().slice(0, 10)
  const current = getNewCardsSeenToday()
  setItem<NewCardsEntry>(NEW_CARDS_KEY, { date: today, count: current + 1 })
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function getAllSessions(): StudySession[] {
  return getItem<StudySession[]>(SESSIONS_KEY, [])
}

export function saveSessions(sessions: StudySession[]): void {
  setItem(SESSIONS_KEY, sessions)
}

export function upsertSession(session: StudySession): void {
  const sessions = getAllSessions()
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    sessions[idx] = session
  } else {
    sessions.push(session)
  }
  saveSessions(sessions)
}

export function deleteSession(id: string): void {
  // Delete the session and its cards
  saveSessions(getAllSessions().filter((s) => s.id !== id))
  saveCards(getAllCards().filter((c) => c.sessionId !== id))
}
