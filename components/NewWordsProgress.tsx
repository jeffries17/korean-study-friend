"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NEW_WORDS_GOAL } from "@/lib/srs"

interface NewWordsProgressProps {
  seenToday: number
  unseenAvailable: number
}

export function NewWordsProgress({ seenToday, unseenAvailable }: NewWordsProgressProps) {
  const target = Math.min(NEW_WORDS_GOAL, seenToday + unseenAvailable)
  const pct = target > 0 ? Math.min(100, Math.round((seenToday / NEW_WORDS_GOAL) * 100)) : 0
  const met = seenToday >= NEW_WORDS_GOAL

  let nudge: string
  if (met) {
    nudge = "Goal hit for today — nice work."
  } else if (unseenAvailable === 0) {
    nudge = "No new cards left to learn — upload more vocab to keep pace."
  } else {
    nudge = `${Math.min(unseenAvailable, NEW_WORDS_GOAL - seenToday)} more available today.`
  }

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                New words today: {seenToday}/{NEW_WORDS_GOAL}
              </p>
              <p className="text-xs text-muted-foreground">{nudge}</p>
            </div>
          </div>
          {!met && unseenAvailable === 0 && (
            <Button nativeButton={false} render={<Link href="/upload" />} variant="outline" size="sm">
              Upload
            </Button>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
