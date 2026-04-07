"use client"

import { Flame, Trophy, CalendarDays, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Stat {
  icon: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}

interface StatsBarProps {
  streak: number
  longestStreak: number
  reviewsThisWeek: number
  totalCards: number
}

export function StatsBar({ streak, longestStreak, reviewsThisWeek, totalCards }: StatsBarProps) {
  const stats: Stat[] = [
    {
      icon: <Flame className="h-4 w-4" />,
      label: "Streak",
      value: streak > 0 ? `${streak}d` : "—",
      highlight: streak >= 3,
    },
    {
      icon: <Trophy className="h-4 w-4" />,
      label: "Best streak",
      value: longestStreak > 0 ? `${longestStreak}d` : "—",
    },
    {
      icon: <CalendarDays className="h-4 w-4" />,
      label: "This week",
      value: reviewsThisWeek,
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: "Total cards",
      value: totalCards,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <Card key={s.label} className={s.highlight ? "border-primary/40" : ""}>
          <CardContent className="p-3 flex flex-col gap-1">
            <div className={`flex items-center gap-1 text-xs ${s.highlight ? "text-primary" : "text-muted-foreground"}`}>
              {s.icon}
              <span>{s.label}</span>
            </div>
            <p className={`text-xl font-bold tabular-nums ${s.highlight ? "text-primary" : ""}`}>
              {s.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
