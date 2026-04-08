"use client"

import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PronounceButtonProps {
  text: string
}

export function PronounceButton({ text }: PronounceButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ko-KR"
    window.speechSynthesis.speak(utter)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={`Pronounce: ${text}`}
      className="text-muted-foreground hover:text-foreground shrink-0"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  )
}
