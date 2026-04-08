"use client"

import { useEffect, useState } from "react"
import { Volume2 } from "lucide-react"

const SENTENCES = [
  "드라마에서 이 단어를 들었어요",
  "오늘 날씨가 정말 좋네요",
  "저는 매일 한국어를 공부해요",
]

// ms per word — roughly natural speech pace
const WORD_MS = 550
const PAUSE_MS = 1200

export function SpeakableDemo() {
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)

  const sentence = SENTENCES[sentenceIdx]
  const words = sentence.split(" ")

  useEffect(() => {
    let cancelled = false

    async function run() {
      for (let w = 0; w < words.length; w++) {
        if (cancelled) return
        setWordIdx(w)
        await sleep(WORD_MS)
      }
      // pause at end, then move to next sentence
      await sleep(PAUSE_MS)
      if (!cancelled) {
        setWordIdx(0)
        setSentenceIdx((i) => (i + 1) % SENTENCES.length)
      }
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceIdx])

  // Build rendered words
  const rendered = words.map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      {i === wordIdx ? (
        <mark className="bg-primary/30 text-inherit rounded px-0.5 not-italic transition-all duration-150">
          {word}
        </mark>
      ) : (
        word
      )}
    </span>
  ))

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3 text-sm shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
        Playing pronunciation…
      </div>
      <p className="text-base font-medium leading-relaxed">{rendered}</p>
      <p className="text-xs text-muted-foreground">
        {sentenceIdx === 0 && "I heard this word in a drama"}
        {sentenceIdx === 1 && "The weather is really nice today"}
        {sentenceIdx === 2 && "I study Korean every day"}
      </p>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
