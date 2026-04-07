"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const LEVELS = [
  { label: "TOPIK I – 1", min: 0,     max: 800,   desc: "Survival Korean" },
  { label: "TOPIK I – 2", min: 800,   max: 1500,  desc: "Basic daily life" },
  { label: "TOPIK II – 3", min: 1500, max: 3000,  desc: "Intermediate" },
  { label: "TOPIK II – 4", min: 3000, max: 5000,  desc: "Upper intermediate" },
  { label: "TOPIK II – 5", min: 5000, max: 7000,  desc: "Advanced" },
  { label: "TOPIK II – 6", min: 7000, max: 10000, desc: "Near-native" },
]

function getCurrentLevel(count: number) {
  return LEVELS.findLast((l) => count >= l.min) ?? LEVELS[0]
}

function getNextLevel(count: number) {
  return LEVELS.find((l) => count < l.max) ?? null
}

interface TopikProgressProps {
  learnedCount: number
  totalCount: number
}

export function TopikProgress({ learnedCount, totalCount }: TopikProgressProps) {
  const cardCount = learnedCount
  const current = getCurrentLevel(cardCount)
  const next = getNextLevel(cardCount)

  const pct = next
    ? Math.min(100, Math.round(((cardCount - current.min) / (next.max - current.min)) * 100))
    : 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">TOPIK Progress</CardTitle>
          <Badge variant="secondary" className="text-xs">{current.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{current.desc}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar toward next level */}
        {next ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {learnedCount} learned
                {totalCount > learnedCount && (
                  <span className="opacity-60"> / {totalCount} total</span>
                )}
              </span>
              <span>{next.max} → {next.label}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {next.max - cardCount} more cards to reach {next.label} ({next.desc})
            </p>
          </div>
        ) : (
          <p className="text-xs text-primary font-medium">
            🎉 You've reached TOPIK II – Level 6 vocabulary range!
          </p>
        )}

        {/* All levels overview */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          {LEVELS.map((l, i) => {
            const done = cardCount >= l.max
            const active = l.label === current.label
            return (
              <div key={l.label} className="space-y-1 text-center">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    done ? "bg-primary" : active ? "bg-primary/40" : "bg-muted"
                  }`}
                />
                <p className={`text-[9px] leading-tight ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {i === 0 ? "I–1" : i === 1 ? "I–2" : `II–${i + 1}`}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
