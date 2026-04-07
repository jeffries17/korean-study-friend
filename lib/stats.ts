import type { ReviewLog } from "./storage"

export function getStreak(log: ReviewLog): number {
  let streak = 0
  const d = new Date()
  // If nothing reviewed today, start checking from yesterday
  const todayStr = d.toISOString().slice(0, 10)
  if (!log[todayStr]) d.setDate(d.getDate() - 1)
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (!log[key]) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getLongestStreak(log: ReviewLog): number {
  const dates = Object.keys(log).sort()
  if (dates.length === 0) return 0
  let best = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / 86_400_000
    if (diff === 1) {
      current++
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }
  return best
}

export function getReviewsThisWeek(log: ReviewLog): number {
  let total = 0
  const d = new Date()
  for (let i = 0; i < 7; i++) {
    total += log[d.toISOString().slice(0, 10)] ?? 0
    d.setDate(d.getDate() - 1)
  }
  return total
}

/** Returns last `weeks` weeks of heatmap data, newest last */
export function getHeatmapData(log: ReviewLog, weeks = 16) {
  const days: { date: string; count: number }[] = []
  const today = new Date()
  // Start from the Sunday `weeks` ago
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7)

  const d = new Date(start)
  while (d <= today) {
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: log[key] ?? 0 })
    d.setDate(d.getDate() + 1)
  }
  return days
}
