"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlashCard } from "@/components/FlashCard"
import { SRSControls } from "@/components/SRSControls"
import { getAllCards } from "@/lib/storage"
import { getStruggleCards } from "@/lib/srs"
import type { SRSGrade, VocabCard } from "@/lib/types"

export default function PracticePage() {
  const [queue, setQueue] = useState<VocabCard[]>([])
  const [reviewed, setReviewed] = useState(0)
  const [passed, setPassed] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const total = useRef(0)

  useEffect(() => {
    getAllCards().then((cards) => {
      const struggle = getStruggleCards(cards)
      total.current = struggle.length
      setQueue(struggle)
      setLoading(false)
    })
  }, [])

  const current = queue[0]

  const grade = useCallback(
    (g: SRSGrade) => {
      if (!current) return
      if (g >= 4) setPassed((n) => n + 1)
      setReviewed((n) => n + 1)
      setFlipped(false)
      setQueue((q) => q.slice(1))
    },
    [current]
  )

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
        <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold">No struggle cards</h1>
        <p className="text-muted-foreground text-sm">
          Cards show up here once they&apos;ve been graded Hard or Again enough times to lower their ease factor.
        </p>
        <Button nativeButton={false} render={<Link href="/dashboard" />} variant="outline">
          ← Back to Dashboard
        </Button>
      </main>
    )
  }

  if (queue.length === 0) {
    const pct = Math.round((passed / reviewed) * 100)
    return (
      <main className="flex-1 container max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Dumbbell className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-xl font-bold">Practice complete!</h1>
        <p className="text-muted-foreground text-sm">
          {passed} / {reviewed} felt Good or Easy
          <span className="ml-1.5 text-muted-foreground/60">({pct}%)</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Your SRS progress was not affected.
        </p>
        <Button nativeButton={false} render={<Link href="/dashboard" />}>← Back to Dashboard</Button>
      </main>
    )
  }

  const progressPct = Math.round((reviewed / total.current) * 100)

  return (
    <main className="flex-1 container max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              Struggle Practice
              <Badge variant="secondary" className="text-[10px] py-0 h-4">No SRS effect</Badge>
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
        Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy · grades don&apos;t affect your schedule
      </p>
    </main>
  )
}
