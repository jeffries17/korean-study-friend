"use client"

import { useState } from "react"
import { Volume2, Square } from "lucide-react"

interface SpeakableTextProps {
  text: string
  className?: string
}

export function SpeakableText({ text, className }: SpeakableTextProps) {
  const [highlight, setHighlight] = useState<{ start: number; end: number } | null>(null)
  const [speaking, setSpeaking] = useState(false)

  const toggle = () => {
    if (!("speechSynthesis" in window)) return

    if (speaking) {
      window.speechSynthesis.cancel()
      return
    }

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ko-KR"

    utter.onboundary = (e) => {
      setHighlight({ start: e.charIndex, end: e.charIndex + (e.charLength ?? 1) })
    }
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => { setSpeaking(false); setHighlight(null) }
    utter.onerror = () => { setSpeaking(false); setHighlight(null) }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const renderText = () => {
    if (!highlight) return <span>{text}</span>
    const { start, end } = highlight
    return (
      <>
        {text.slice(0, start)}
        <mark className="bg-primary/30 text-inherit rounded px-0.5 not-italic">
          {text.slice(start, end)}
        </mark>
        {text.slice(end)}
      </>
    )
  }

  return (
    <span className={`inline-flex items-start gap-1 group ${className ?? ""}`}>
      <span>{renderText()}</span>
      <button
        onClick={toggle}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
        title={speaking ? "Stop" : "Speak"}
      >
        {speaking
          ? <Square className="h-3 w-3" />
          : <Volume2 className="h-3 w-3" />
        }
      </button>
    </span>
  )
}
