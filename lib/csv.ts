import type { VocabCard } from "./types"

export function cardsToCSV(cards: VocabCard[]): string {
  const header = "Korean;English;Example"
  const rows = cards.map(
    (c) =>
      `${escapeCsv(c.korean)};${escapeCsv(c.english)};${escapeCsv(c.example)}`
  )
  return [header, ...rows].join("\n")
}

function escapeCsv(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCSV(cards: VocabCard[], filename = "korean-vocab.csv"): void {
  const csv = cardsToCSV(cards)
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
