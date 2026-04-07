"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadCSV } from "@/lib/csv"
import type { VocabCard } from "@/lib/types"

interface ExportButtonProps {
  cards: VocabCard[]
  filename?: string
}

export function ExportButton({ cards, filename }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => downloadCSV(cards, filename)}
      disabled={cards.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
