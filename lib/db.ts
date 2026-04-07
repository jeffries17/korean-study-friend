import { neon } from "@neondatabase/serverless"
import type { VocabCard, StudySession } from "./types"

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
  return neon(process.env.DATABASE_URL)
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export async function dbGetAllCards(): Promise<VocabCard[]> {
  const db = sql()
  const rows = await db`SELECT * FROM cards ORDER BY created_at ASC`
  return rows.map(rowToCard)
}

export async function dbUpsertCard(card: VocabCard): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO cards (id, korean, english, example, session_id, created_at,
      srs_interval, srs_repetitions, srs_ease_factor, srs_due_date, srs_last_review)
    VALUES (
      ${card.id}, ${card.korean}, ${card.english}, ${card.example},
      ${card.sessionId ?? null}, ${card.createdAt},
      ${card.srs.interval}, ${card.srs.repetitions}, ${card.srs.easeFactor},
      ${card.srs.dueDate}, ${card.srs.lastReview}
    )
    ON CONFLICT (id) DO UPDATE SET
      korean = EXCLUDED.korean,
      english = EXCLUDED.english,
      example = EXCLUDED.example,
      session_id = EXCLUDED.session_id,
      srs_interval = EXCLUDED.srs_interval,
      srs_repetitions = EXCLUDED.srs_repetitions,
      srs_ease_factor = EXCLUDED.srs_ease_factor,
      srs_due_date = EXCLUDED.srs_due_date,
      srs_last_review = EXCLUDED.srs_last_review
  `
}

export async function dbDeleteCard(id: string): Promise<void> {
  const db = sql()
  await db`DELETE FROM cards WHERE id = ${id}`
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function dbGetAllSessions(): Promise<StudySession[]> {
  const db = sql()
  const rows = await db`SELECT * FROM sessions ORDER BY created_at DESC`
  return rows.map(rowToSession)
}

export async function dbUpsertSession(session: StudySession): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO sessions (id, name, created_at, card_ids, image_preview)
    VALUES (
      ${session.id}, ${session.name}, ${session.createdAt},
      ${session.cardIds}, ${session.imagePreview ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      card_ids = EXCLUDED.card_ids,
      image_preview = EXCLUDED.image_preview
  `
}

export async function dbDeleteSession(id: string): Promise<void> {
  const db = sql()
  await db`DELETE FROM sessions WHERE id = ${id}`
  await db`DELETE FROM cards WHERE session_id = ${id}`
}

// ── Review log ────────────────────────────────────────────────────────────────

export async function dbGetReviewLog(): Promise<Record<string, number>> {
  const db = sql()
  const rows = await db`SELECT date, count FROM review_log`
  return Object.fromEntries(rows.map((r) => [r.date, r.count]))
}

export async function dbLogReviews(count: number): Promise<void> {
  if (count <= 0) return
  const db = sql()
  const today = new Date().toISOString().slice(0, 10)
  await db`
    INSERT INTO review_log (date, count) VALUES (${today}, ${count})
    ON CONFLICT (date) DO UPDATE SET count = review_log.count + EXCLUDED.count
  `
}

// ── New cards daily counter ───────────────────────────────────────────────────

export async function dbGetNewCardsSeenToday(): Promise<number> {
  const db = sql()
  const today = new Date().toISOString().slice(0, 10)
  const rows = await db`SELECT count FROM new_cards_log WHERE date = ${today}`
  return rows[0]?.count ?? 0
}

export async function dbIncrementNewCardsSeen(): Promise<void> {
  const db = sql()
  const today = new Date().toISOString().slice(0, 10)
  await db`
    INSERT INTO new_cards_log (date, count) VALUES (${today}, 1)
    ON CONFLICT (date) DO UPDATE SET count = new_cards_log.count + 1
  `
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToCard(row: Record<string, unknown>): VocabCard {
  return {
    id: row.id as string,
    korean: row.korean as string,
    english: row.english as string,
    example: row.example as string,
    sessionId: (row.session_id as string) ?? "",
    createdAt: Number(row.created_at),
    srs: {
      interval: Number(row.srs_interval),
      repetitions: Number(row.srs_repetitions),
      easeFactor: Number(row.srs_ease_factor),
      dueDate: Number(row.srs_due_date),
      lastReview: Number(row.srs_last_review),
    },
  }
}

function rowToSession(row: Record<string, unknown>): StudySession {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: Number(row.created_at),
    cardIds: (row.card_ids as string[]) ?? [],
    imagePreview: (row.image_preview as string) ?? undefined,
  }
}
