"use client"

import { useState } from "react"
import { Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// In-memory cache so the same text isn't re-fetched
const audioCache = new Map<string, string>()

async function getAudioUrl(text: string): Promise<string> {
  if (audioCache.has(text)) return audioCache.get(text)!
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error("TTS failed")
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  audioCache.set(text, url)
  return url
}

interface PronounceButtonProps {
  text: string
}

export function PronounceButton({ text }: PronounceButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const url = await getAudioUrl(text)
      new Audio(url).play()
    } catch {
      // Fallback to browser TTS
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = "ko-KR"
        window.speechSynthesis.speak(utter)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={`Pronounce: ${text}`}
      className="text-muted-foreground hover:text-foreground shrink-0"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  )
}
