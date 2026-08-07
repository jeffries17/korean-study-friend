"use client"

import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { speak } from "@/lib/tts"

interface PronounceButtonProps {
  text: string
}

export function PronounceButton({ text }: PronounceButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(text)
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
