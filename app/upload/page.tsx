"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save, Plus, X, Pencil } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { UploadBox } from "@/components/UploadBox"
import { CardTable } from "@/components/CardTable"
import { ExportButton } from "@/components/ExportButton"
import { getAllCards, upsertCard, upsertSession } from "@/lib/storage"
import { initialSRS } from "@/lib/srs"
import type { DraftCard, VocabCard } from "@/lib/types"

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase()
}

function flagDuplicates(incoming: DraftCard[], existingKorean: Set<string>): DraftCard[] {
  return incoming.map((c) => ({
    ...c,
    duplicate: existingKorean.has(normalize(c.korean)),
  }))
}

export default function UploadPage() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [cards, setCards] = useState<DraftCard[]>([])
  const [sessionName, setSessionName] = useState("")
  const [showRename, setShowRename] = useState(false)

  const effectiveSessionName = sessionName.trim() ||
    (cards[0]?.korean ? `${cards[0].korean} · ${new Date().toLocaleDateString()}` : `Session ${new Date().toLocaleDateString()}`)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Type-a-word state
  const [wordInput, setWordInput] = useState("")
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  const handleImage = async (dataUrl: string) => {
    setImage(dataUrl)
    setError(null)
    setParsing(true)
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      })
      if (!res.ok) throw new Error("Parsing failed")
      const data = await res.json()
      const existing = new Set((await getAllCards()).map((c) => normalize(c.korean)))
      setCards((prev) => [...prev, ...flagDuplicates(data.cards ?? [], existing)])
    } catch (e) {
      setError("Could not parse image. Check your API key and try again.")
      console.error(e)
    } finally {
      setParsing(false)
    }
  }

  const handleTranslate = async () => {
    const word = wordInput.trim()
    if (!word) return
    setTranslating(true)
    setTranslateError(null)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english: word }),
      })
      if (!res.ok) throw new Error("Translation failed")
      const parsed = await res.json()
      const existing = new Set((await getAllCards()).map((c) => normalize(c.korean)))
      const [card] = flagDuplicates([parsed], existing)
      setCards((prev) => [...prev, card])
      setWordInput("")
    } catch (e) {
      setTranslateError("Could not translate. Try again.")
      console.error(e)
    } finally {
      setTranslating(false)
    }
  }

  const saveSession = async () => {
    const sessionId = generateId()
    const now = Date.now()
    const vocabCards: VocabCard[] = cards.map((c) => ({
      id: generateId(),
      ...c,
      sessionId,
      createdAt: now,
      srs: initialSRS(),
    }))
    await Promise.all(vocabCards.map(upsertCard))
    await upsertSession({
      id: sessionId,
      name: effectiveSessionName,
      createdAt: now,
      cardIds: vocabCards.map((c) => c.id),
      imagePreview: image ?? undefined,
    })
    router.push("/")
  }

  const exportableCards = cards.map(({ duplicate: _d, ...c }) => ({
    ...c,
    id: "",
    sessionId: "",
    createdAt: 0,
    srs: initialSRS(),
  })) as VocabCard[]

  return (
    <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Add Vocabulary</h1>
        {cards.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{cards.length} card{cards.length !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      <Tabs defaultValue="screenshot">
        <TabsList className="w-full">
          <TabsTrigger value="screenshot" className="flex-1">Upload Screenshot</TabsTrigger>
          <TabsTrigger value="type" className="flex-1">Type a Word</TabsTrigger>
        </TabsList>

        {/* Screenshot tab */}
        <TabsContent value="screenshot" className="space-y-4 mt-4">
          {!image ? (
            <UploadBox onImage={handleImage} disabled={parsing} />
          ) : (
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Uploaded screenshot"
                className="w-40 rounded-lg border object-contain"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImage(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Change image
              </Button>
            </div>
          )}

          {parsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting vocabulary with AI…
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Type a word tab */}
        <TabsContent value="type" className="space-y-4 mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type an English word or phrase — Claude will translate it to Korean and generate an example sentence.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); handleTranslate() }}
              className="flex gap-2"
            >
              <Input
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="e.g. to go for a walk, I'm hungry, grocery store…"
                disabled={translating}
                className="flex-1"
              />
              <Button type="submit" disabled={translating || !wordInput.trim()}>
                {translating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </form>
          </div>

          {translateError && (
            <Alert variant="destructive">
              <AlertDescription>{translateError}</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Shared card table + save — visible on both tabs once cards exist */}
      {cards.length > 0 && (
        <>
          <CardTable cards={cards} onChange={setCards} />

          <div className="space-y-2">
            {showRename ? (
              <div className="flex items-center gap-2">
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={effectiveSessionName}
                  className="max-w-xs"
                  autoFocus
                />
                <Button variant="ghost" size="sm" onClick={() => setShowRename(false)}>Done</Button>
              </div>
            ) : (
              <button
                onClick={() => setShowRename(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                {effectiveSessionName}
              </button>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={saveSession}>
                <Save className="h-4 w-4 mr-2" />
                Save {cards.length} card{cards.length !== 1 ? "s" : ""}
              </Button>
              <ExportButton cards={exportableCards} />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
