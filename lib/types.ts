export interface SRSData {
  interval: number // days until next review
  repetitions: number // successful review count
  easeFactor: number // SM-2 ease factor, default 2.5
  dueDate: number // ms timestamp
  lastReview: number // ms timestamp
}

export interface VocabCard {
  id: string
  korean: string
  english: string
  example: string // Korean example sentence
  sessionId: string
  createdAt: number
  srs: SRSData
}

export interface StudySession {
  id: string
  name: string
  createdAt: number
  cardIds: string[]
  imagePreview?: string // base64 thumbnail
}

export type SRSGrade = 0 | 3 | 4 | 5 // 0=Again, 3=Hard, 4=Good, 5=Easy

export interface ParsedCard {
  korean: string
  english: string
  example: string
}

/** ParsedCard with optional UI state for the upload preview table */
export interface DraftCard extends ParsedCard {
  duplicate?: boolean
}
