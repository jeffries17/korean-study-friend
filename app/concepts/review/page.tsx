"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConceptCard } from "@/components/ConceptCard"
import { SRSControls } from "@/components/SRSControls"
import { getAllConcepts, upsertConcept } from "@/lib/storage"
import { buildConceptQueue, scheduleCard } from "@/lib/srs"
import type { Concept, ConceptDrill, SRSGrade } from "@/lib/types"

function randomDrill(concept: Concept): ConceptDrill {
  return concept.drills[Math.floor(Math.random() * concept.drills.length)]
}

export default function ConceptReviewPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [conceptsById, setConceptsById] = useState<Record<string, Concept>>({})
  const [reviewed, setReviewed] = useState(0)
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const total = useRef(0)

  useEffect(() => {
    async function load() {
      const concepts = await getAllConcepts()
      const q = buildConceptQueue(concepts)
      total.current = q.length
      setQueue(q)
      setConceptsById(Object.fromEntries(concepts.map((c) => [c.id, c])))
      setLoading(false)
    }
    load()
  }, [])

  const current = conceptsById[queue[0]]
  const drill = useMemo(() => (current ? randomDrill(current) : null), [current])

  const grade = useCallback(
    async (g: SRSGrade) => {
      if (!current) return
      const updated = scheduleCard(current, g)
      await upsertConcept(updated)
      setConceptsById((m) => ({ ...m, [updated.id]: updated }))
      setReviewed((n) => n + 1)
      setAnsweredCorrect(null)
      setQueue((q) => q.slice(1))
    },
    [current]
  )

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
        <p className="text-muted-foreground text-sm">All concepts are up to date. Come back later!</p>
        <Button nativeButton={false} render={<Link href="/dashboard" />} variant="outline">← Back to Dashboard</Button>
      </main>
    )
  }

  if (queue.length === 0) {
    return (
      <main className="flex-1 container max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold">Session complete!</h1>
        <p className="text-muted-foreground text-sm">
          Reviewed {reviewed} concept{reviewed !== 1 ? "s" : ""}. Great work!
        </p>
        <Button nativeButton={false} render={<Link href="/dashboard" />}>← Back to Dashboard</Button>
      </main>
    )
  }

  const progressPct = Math.round((reviewed / total.current) * 100)
  const isNew = current.srs.repetitions === 0

  return (
    <main className="flex-1 container max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              Progress
              {isNew && <Badge variant="secondary" className="text-[10px] py-0 h-4">New</Badge>}
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

      {drill && (
        <ConceptCard
          key={`${current.id}-${reviewed}`}
          concept={current}
          drill={drill}
          index={reviewed}
          total={total.current}
          onAnswered={setAnsweredCorrect}
        />
      )}

      {answeredCorrect !== null ? (
        <SRSControls onGrade={grade} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">Pick the correct answer to continue</p>
      )}
    </main>
  )
}
