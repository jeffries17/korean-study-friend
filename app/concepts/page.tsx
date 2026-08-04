"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAllConcepts, deleteConcept } from "@/lib/storage"
import { isDue } from "@/lib/srs"
import type { Concept } from "@/lib/types"

export default function ConceptsPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])

  useEffect(() => {
    getAllConcepts().then(setConcepts)
  }, [])

  const remove = async (id: string) => {
    await deleteConcept(id)
    setConcepts((c) => c.filter((x) => x.id !== id))
  }

  const dueCount = concepts.filter(isDue).length

  return (
    <main className="flex-1 container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Concepts</h1>
        <Badge variant="secondary" className="ml-auto">{concepts.length} concepts</Badge>
      </div>

      <Card className={dueCount > 0 ? "border-primary/40" : ""}>
        <CardContent className="flex items-center justify-between py-5">
          <p className="text-sm font-medium">
            {dueCount > 0 ? `${dueCount} concept${dueCount !== 1 ? "s" : ""} due today` : "All caught up!"}
          </p>
          <Button nativeButton={false} render={<Link href="/concepts/review" />} disabled={dueCount === 0}>
            <Play className="h-4 w-4 mr-1.5" />
            Practice
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {concepts.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-10">No concepts yet.</p>
        )}
        {concepts.map((concept) => (
          <Card key={concept.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">{concept.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {concept.pattern} · {concept.drills.length} drills · {concept.sourceLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isDue(concept) ? (
                  <Badge variant="destructive" className="text-[10px]">Due</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {new Date(concept.srs.dueDate).toLocaleDateString()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(concept.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
