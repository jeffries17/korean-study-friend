"use client"

import { Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MILESTONES } from "@/lib/srs"

interface MilestonesProps {
  learnedCount: number
}

export function Milestones({ learnedCount }: MilestonesProps) {
  const next = MILESTONES.find((m) => learnedCount < m)
  const prev = [...MILESTONES].reverse().find((m) => learnedCount >= m) ?? 0

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Milestones</p>
          {next && (
            <p className="text-xs text-muted-foreground">
              {next - learnedCount} to {next} learned
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {MILESTONES.map((m) => {
            const achieved = learnedCount >= m
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border ${
                    achieved
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-muted border-transparent text-muted-foreground/50"
                  }`}
                >
                  <Award className="h-4 w-4" />
                </div>
                <p className={`text-[10px] ${achieved ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {m}
                </p>
              </div>
            )
          })}
        </div>
        {next && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(((learnedCount - prev) / (next - prev)) * 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
