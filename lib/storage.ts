import type { VocabCard, StudySession } from "./types"

// ── Cards ─────────────────────────────────────────────────────────────────────

export async function getAllCards(): Promise<VocabCard[]> {
  const res = await fetch("/api/cards")
  return res.json()
}

export async function upsertCard(card: VocabCard): Promise<void> {
  await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  })
}

export async function deleteCard(id: string): Promise<void> {
  await fetch(`/api/cards/${id}`, { method: "DELETE" })
}

export async function saveCards(cards: VocabCard[]): Promise<void> {
  await Promise.all(cards.map(upsertCard))
}

export function getCardsBySession(sessionId: string, cards: VocabCard[]): VocabCard[] {
  return cards.filter((c) => c.sessionId === sessionId)
}

// ── Review log ────────────────────────────────────────────────────────────────

export type ReviewLog = Record<string, number>

export async function getReviewLog(): Promise<ReviewLog> {
  const res = await fetch("/api/review-log")
  return res.json()
}

export async function logReviews(count: number): Promise<void> {
  if (count <= 0) return
  await fetch("/api/review-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  })
}

// ── New card daily counter ────────────────────────────────────────────────────

export async function getNewCardsSeenToday(): Promise<number> {
  const res = await fetch("/api/new-cards-today")
  const data = await res.json()
  return data.count
}

export async function incrementNewCardsSeen(): Promise<void> {
  await fetch("/api/new-cards-today", { method: "POST" })
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getAllSessions(): Promise<StudySession[]> {
  const res = await fetch("/api/sessions")
  return res.json()
}

export async function upsertSession(session: StudySession): Promise<void> {
  await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  })
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`/api/sessions/${id}`, { method: "DELETE" })
}

// ── localStorage migration helper ─────────────────────────────────────────────

export async function migrateFromLocalStorage(): Promise<{ cards: number; sessions: number }> {
  if (typeof window === "undefined") return { cards: 0, sessions: 0 }

  let cardCount = 0
  let sessionCount = 0

  try {
    const rawCards = localStorage.getItem("ksf-cards")
    if (rawCards) {
      const cards: VocabCard[] = JSON.parse(rawCards)
      await Promise.all(cards.map(upsertCard))
      cardCount = cards.length
    }
  } catch {}

  try {
    const rawSessions = localStorage.getItem("ksf-sessions")
    if (rawSessions) {
      const sessions: StudySession[] = JSON.parse(rawSessions)
      await Promise.all(sessions.map(upsertSession))
      sessionCount = sessions.length
    }
  } catch {}

  try {
    const rawLog = localStorage.getItem("ksf-review-log")
    if (rawLog) {
      const log: ReviewLog = JSON.parse(rawLog)
      for (const [date, count] of Object.entries(log)) {
        await fetch("/api/review-log/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, count }),
        })
      }
    }
  } catch {}

  return { cards: cardCount, sessions: sessionCount }
}
