"use client"

import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PronounceButton } from "@/components/PronounceButton"
import type { DraftCard } from "@/lib/types"

interface CardTableProps {
  cards: DraftCard[]
  onChange: (cards: DraftCard[]) => void
}

export function CardTable({ cards, onChange }: CardTableProps) {
  const update = (idx: number, field: keyof DraftCard, value: string) => {
    const next = cards.map((c, i) =>
      i === idx ? { ...c, [field]: value, duplicate: false } : c
    )
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(cards.filter((_, i) => i !== idx))
  }

  const dupeCount = cards.filter((c) => c.duplicate).length

  return (
    <div className="space-y-2">
      {dupeCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-yellow-500 px-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {dupeCount} card{dupeCount !== 1 ? "s" : ""} already in your vocab — edit or delete to resolve
        </div>
      )}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Korean</TableHead>
              <TableHead className="w-[180px]">English</TableHead>
              <TableHead>Example sentence</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No cards yet
                </TableCell>
              </TableRow>
            )}
            {cards.map((card, idx) => (
              <TableRow
                key={idx}
                className={card.duplicate ? "bg-yellow-500/5 border-l-2 border-l-yellow-500/60" : ""}
              >
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      value={card.korean}
                      onChange={(e) => update(idx, "korean", e.target.value)}
                      className={`h-8 text-sm font-medium ${card.duplicate ? "border-yellow-500/40" : ""}`}
                    />
                    {card.duplicate && (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Already in your vocab
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <PronounceButton text={card.korean} />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={card.english}
                    onChange={(e) => update(idx, "english", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      value={card.example}
                      onChange={(e) => update(idx, "example", e.target.value)}
                      className="h-8 text-sm"
                    />
                    <PronounceButton text={card.example} />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
