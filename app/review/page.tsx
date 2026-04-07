"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlashCard } from "@/components/FlashCard"
import { SRSControls } from "@/components/SRSControls"
import {
  getAllCards,
  upsertCard,
  logReviews,
  getNewCardsSeenToday,
  incrementNewCardsSeen,
} from "@/lib/storage"
import { buildQueue, scheduleCard, NEW_CARDS_PER_DAY } from "@/lib/srs"
import type { SRSGrade, VocabCard } from "@/lib/types"

export default function ReviewPage() {
  const [queue, setQueue] = useState<VocabCard[]>([])
  const [allCards, setAllCards] = useState<VocabCard[]>([])
  const [reviewed, setReviewed] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const total = useRef(0)
  const newCardsSeen = useRef(0)

  useEffect(() => {
    async function load() {
      const [cards, seenToday] = await Promise.all([getAllCards(), getNewCardsSeenToday()])
      newCardsSeen.current = seenToday
      const { queue: q } = buildQueue(cards, seenToday)
      total.current = q.length
      setQueue(q)
      setAllCards(cards)
      setLoading(false)
    }
    load()
  }, [])

  const current = queue[0]

  const grade = useCallback(
    async (g: SRSGrade) => {
      if (!current) return
      if (current.srs.repetitions === 0) {
        await incrementNewCardsSeen()
        newCardsSeen.current += 1
      }
      const updated = scheduleCard(current, g)
      await upsertCard(updated)
      await logReviews(1)
      setReviewed((n) => n + 1)
      setFlipped(false)
      setQueue((q) => q.slice(1))
    },
    [current]
  )

  // Keyboard: Space = flip, 1-4 = grade
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f) }
      if (e.key === "1") grade(0)
      if (e.key === "2") grade(3)
      if (e.key === "3") grade(4)
      if (e.key === "4") grade(5)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [grade])

  const pendingNew = allCards.filter((c) => c.srs.repetitions === 0).length
  const newCardsInQueue = queue.filter((c) => c.srs.repetitions === 0).length
  const remainingNewAfter = Math.max(0, pendingNew - newCardsInQueue - newCardsSeen.current)

  if (loading) {
    return (
      <main className="flex-1 container max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    )
  }

  if (total.current === 0) {
    return (
      <main className="flex-1 container max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold">Nothing due</h1>
        <p className="text-muted-foreground text-sm">All cards are up to date. Come back later!</p>
        {remainingNewAfter > 0 && (
          <p className="text-xs text-muted-foreground">
            {remainingNewAfter} new card{remainingNewAfter !== 1 ? "s" : ""} queued for tomorrow
            <span className="ml-1 opacity-60">(limit: {NEW_CARDS_PER_DAY}/day)</span>
          </p>
        )}
        <Button nativeButton={false} render={<Link href="/" />} variant="outline">← Back to Dashboard</Button>
      </main>
    )
  }

  if (queue.length === 0) {
    return (
      <main className="flex-1 container max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold">Session complete!</h1>
        <p className="text-muted-foreground text-sm">
          Reviewed {reviewed} card{reviewed !== 1 ? "s" : ""}. Great work!
        </p>
        {remainingNewAfter > 0 && (
          <p className="text-xs text-muted-foreground">
            {remainingNewAfter} new card{remainingNewAfter !== 1 ? "s" : ""} queued for tomorrow
          </p>
        )}
        <Button nativeButton={false} render={<Link href="/" />}>← Back to Dashboard</Button>
      </main>
    )
  }

  const progressPct = Math.round((reviewed / total.current) * 100)
  const isNewCard = current.srs.repetitions === 0

  return (
    <main className="flex-1 container max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              Progress
              {isNewCard && (
                <Badge variant="secondary" className="text-[10px] py-0 h-4">New</Badge>
              )}
            </span>
            <span>{reviewed} / {total.current}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <FlashCard card={current} index={reviewed} total={total.current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <SRSControls onGrade={grade} />

      <p className="text-center text-[11px] text-muted-foreground">
        Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy
      </p>
    </main>
  )
}
