"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PronounceButton } from "@/components/PronounceButton"
import type { VocabCard } from "@/lib/types"

function highlightWord(sentence: string, word: string): ReactNode {
  const idx = sentence.indexOf(word)
  if (idx === -1) return sentence
  return (
    <>
      {sentence.slice(0, idx)}
      <span className="text-foreground font-medium not-italic">{sentence.slice(idx, idx + word.length)}</span>
      {sentence.slice(idx + word.length)}
    </>
  )
}

interface FlashCardProps {
  card: VocabCard
  index: number
  total: number
  flipped: boolean
  onFlip: () => void
  onDelete?: () => void
}

export function FlashCard({ card, index, total, flipped, onFlip, onDelete }: FlashCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
        <span>{index + 1} / {total}</span>
        <Badge variant="outline">
          {card.srs.repetitions === 0 ? "New" : `×${card.srs.repetitions}`}
        </Badge>
      </div>

      <Card
        className="relative cursor-pointer select-none min-h-[220px] flex items-center justify-center transition-all hover:border-primary/40"
        onClick={onFlip}
      >
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete "${card.korean}" from your collection?`)) onDelete()
            }}
            className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <CardContent className="p-8 text-center w-full">
          {!flipped ? (
            <div className="space-y-4">
              <p className="text-5xl font-bold tracking-wide">{card.korean}</p>
              <div className="flex justify-center">
                <PronounceButton text={card.korean} />
              </div>
              <p className="text-xs text-muted-foreground mt-4">tap to reveal</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-primary">{card.english}</p>
              <p className="text-base text-muted-foreground italic">{highlightWord(card.example, card.korean)}</p>
              <div className="flex justify-center">
                <PronounceButton text={card.example} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
