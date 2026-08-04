export interface SRSData {
  interval: number // days until next review
  repetitions: number // successful review count
  easeFactor: number // kept for DB compatibility, not used in scheduling
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

export type SRSGrade = 3 | 4 | 5 // 3=Forgot, 4=Good, 5=Easy

export interface ParsedCard {
  korean: string
  english: string
  example: string
}

/** ParsedCard with optional UI state for the upload preview table */
export interface DraftCard extends ParsedCard {
  duplicate?: boolean
}

export interface ConceptDrill {
  prompt: string // Korean sentence with a blank, e.g. "어머니__ 만나요"
  answer: string // correct fill, e.g. "를"
  distractors: string[] // wrong choices shown alongside answer
  gloss: string // English translation of the completed sentence
}

export interface Concept {
  id: string
  title: string // e.g. "Object marker 을/를"
  explanation: string // short rule explanation shown before practice
  pattern: string // e.g. "[noun]+을/를 + verb"
  sourceLabel: string // e.g. "Lesson 2026-03-23"
  drills: ConceptDrill[]
  createdAt: number
  srs: SRSData
}
