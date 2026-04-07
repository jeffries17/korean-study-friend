"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { PronounceButton } from "@/components/PronounceButton"
import { ContextPanel } from "@/components/ContextPanel"
import { ExportButton } from "@/components/ExportButton"
import { getAllCards, deleteCard } from "@/lib/storage"
import { isDue } from "@/lib/srs"
import type { VocabCard } from "@/lib/types"

type SortField = "dueDate" | "korean" | "createdAt"

export default function VocabPage() {
  const [cards, setCards] = useState<VocabCard[]>([])
  const [query, setQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortAsc, setSortAsc] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { setCards(getAllCards()) }, [])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((a) => !a)
    else { setSortField(field); setSortAsc(true) }
  }

  const filtered = cards
    .filter(
      (c) =>
        c.korean.includes(query) ||
        c.english.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortField === "korean") return a.korean.localeCompare(b.korean) * dir
      if (sortField === "dueDate") return (a.srs.dueDate - b.srs.dueDate) * dir
      return (a.createdAt - b.createdAt) * dir
    })

  const remove = (id: string) => {
    deleteCard(id)
    setCards((c) => c.filter((x) => x.id !== id))
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortAsc ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
    ) : null

  return (
    <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">All Vocabulary</h1>
        <Badge variant="secondary" className="ml-auto">{cards.length} cards</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Korean or English…"
            className="pl-8"
          />
        </div>
        <ExportButton cards={filtered} filename="korean-vocab-export.csv" />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none w-[160px]"
                onClick={() => toggleSort("korean")}
              >
                Korean <SortIcon field="korean" />
              </TableHead>
              <TableHead className="w-[160px]">English</TableHead>
              <TableHead>Example</TableHead>
              <TableHead
                className="cursor-pointer select-none w-[120px]"
                onClick={() => toggleSort("dueDate")}
              >
                Due <SortIcon field="dueDate" />
              </TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  {query ? "No matches" : "No vocabulary saved yet"}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((card) => (
              <>
                <TableRow
                  key={card.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpanded((e) => (e === card.id ? null : card.id))}
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{card.korean}</span>
                      <PronounceButton text={card.korean} />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{card.english}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[240px]">
                    {card.example}
                  </TableCell>
                  <TableCell>
                    {isDue(card) ? (
                      <Badge variant="destructive" className="text-[10px]">Due</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {new Date(card.srs.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); remove(card.id) }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                {expanded === card.id && (
                  <TableRow key={`${card.id}-ctx`}>
                    <TableCell colSpan={5} className="p-4 bg-muted/20">
                      <ContextPanel korean={card.korean} english={card.english} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
