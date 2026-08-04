"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Concept, ConceptDrill } from "@/lib/types"

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface ConceptCardProps {
  concept: Concept
  drill: ConceptDrill
  index: number
  total: number
  onAnswered: (correct: boolean) => void
}

export function ConceptCard({ concept, drill, index, total, onAnswered }: ConceptCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const choices = useMemo(
    () => shuffle([drill.answer, ...drill.distractors]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drill.prompt]
  )

  function choose(choice: string) {
    if (selected) return
    setSelected(choice)
    onAnswered(choice === drill.answer)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
        <span>{index + 1} / {total}</span>
        <Badge variant="outline">
          {concept.srs.repetitions === 0 ? "New" : `×${concept.srs.repetitions}`}
        </Badge>
      </div>

      <Card className="min-h-[220px]">
        <CardContent className="p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {concept.title}
            </p>
            <p className="text-2xl font-semibold tracking-wide">{drill.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {choices.map((choice) => {
              const isSelected = selected === choice
              const isAnswer = choice === drill.answer
              const showState = selected !== null
              return (
                <Button
                  key={choice}
                  variant="outline"
                  onClick={() => choose(choice)}
                  disabled={selected !== null}
                  className={
                    showState && isAnswer
                      ? "border-green-500/60 text-green-400 bg-green-500/10"
                      : showState && isSelected
                        ? "border-red-500/60 text-red-400 bg-red-500/10"
                        : ""
                  }
                >
                  {showState && isAnswer && <Check className="h-3.5 w-3.5 mr-1" />}
                  {showState && isSelected && !isAnswer && <X className="h-3.5 w-3.5 mr-1" />}
                  {choice}
                </Button>
              )
            })}
          </div>

          {selected !== null && (
            <p className="text-sm text-muted-foreground italic">{drill.gloss}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
