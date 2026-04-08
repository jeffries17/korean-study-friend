"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SpeakableText } from "@/components/SpeakableText"

interface ContextPanelProps {
  korean: string
  english: string
  cardId?: string
}

export function ContextPanel({ korean, english, cardId }: ContextPanelProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cardId) return
    fetch(`/api/context?cardId=${encodeURIComponent(cardId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.context) setContent(data.context) })
      .catch(() => {})
  }, [cardId])

  const generate = async () => {
    setLoading(true)
    setContent("")
    try {
      const res = await fetch("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ korean, english, cardId }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setContent((prev) => prev + decoder.decode(value))
      }
    } finally {
      setLoading(false)
    }
  }

  const lines = content.split("\n")

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Context &amp; Examples
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generate}
            disabled={loading}
            className="text-xs"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {content ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </CardHeader>

      {content && (
        <CardContent>
          <ScrollArea className="max-h-72">
            <div className="space-y-1 text-sm">
              {lines.map((line, i) => {
                const hasKorean = /[\uAC00-\uD7A3]/.test(line)
                const clean = line.replace(/\*\*/g, "").replace(/^\d+\.\s*/, "")
                const isBold = line.startsWith("**")
                return (
                  <div key={i} className={isBold ? "font-semibold text-foreground" : "text-muted-foreground"}>
                    {hasKorean
                      ? <SpeakableText text={clean} />
                      : <span>{line.replace(/\*\*/g, "")}</span>
                    }
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
