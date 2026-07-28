"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NEW_WORDS_GOAL } from "@/lib/srs"

interface NewWordsProgressProps {
  addedToday: number
}

export function NewWordsProgress({ addedToday }: NewWordsProgressProps) {
  const pct = Math.min(100, Math.round((addedToday / NEW_WORDS_GOAL) * 100))
  const met = addedToday >= NEW_WORDS_GOAL
  const nudge = met
    ? "Goal hit for today — nice work."
    : `Add ${NEW_WORDS_GOAL - addedToday} more to hit today's goal.`

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
                Added today: {addedToday}/{NEW_WORDS_GOAL}
              </p>
              <p className="text-xs text-muted-foreground">{nudge}</p>
            </div>
          </div>
          {!met && (
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
