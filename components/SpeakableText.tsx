"use client"

import { useRef, useState } from "react"
import { Volume2, Square } from "lucide-react"
import { speak } from "@/lib/tts"

interface SpeakableTextProps {
  text: string
  className?: string
}

export function SpeakableText({ text, className }: SpeakableTextProps) {
  const [speaking, setSpeaking] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const toggle = () => {
    if (speaking) {
      stopRef.current?.()
      setSpeaking(false)
      return
    }

    stopRef.current = speak(text, "ko-KR", {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    })
  }

  return (
    <span className={`inline-flex items-start gap-1 group ${className ?? ""}`}>
      <span>{text}</span>
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
