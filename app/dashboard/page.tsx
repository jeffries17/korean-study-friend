"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Upload, List, Flame, Plus, Mail, Dumbbell, GraduationCap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { StatsBar } from "@/components/StatsBar"
import { ActivityHeatmap } from "@/components/ActivityHeatmap"
import { TopikProgress } from "@/components/TopikProgress"
import { Milestones } from "@/components/Milestones"
import { NewWordsProgress } from "@/components/NewWordsProgress"
import { MigrateButton } from "@/components/MigrateButton"
import { getAllCards, getAllSessions, getAllConcepts, getReviewLog, type ReviewLog } from "@/lib/storage"
import { dueCount, getLearnedCount, getStruggleCards } from "@/lib/srs"
import { getStreak, getLongestStreak, getReviewsThisWeek } from "@/lib/stats"
import type { StudySession, VocabCard, Concept } from "@/lib/types"

type Mode = "vocab" | "concepts"

export default function DashboardPage() {
  const [cards, setCards] = useState<VocabCard[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [log, setLog] = useState<ReviewLog>({})
  const [sendingReminder, setSendingReminder] = useState(false)
  const [reminderMsg, setReminderMsg] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode | null>(null)

  useEffect(() => {
    async function load() {
      const [c, s, con, l] = await Promise.all([
        getAllCards(),
        getAllSessions(),
        getAllConcepts(),
        getReviewLog(),
      ])
      setCards(c)
      setSessions(s)
      setConcepts(con)
      setLog(l)
    }
    load()
  }, [])

  const due = dueCount(cards)
  const conceptsDue = concepts.filter((c) => c.srs.dueDate <= Date.now()).length
  const struggleCount = getStruggleCards(cards).length

  // Default to whichever has due work; falls back to vocab.
  const activeMode: Mode = mode ?? (due === 0 && conceptsDue > 0 ? "concepts" : "vocab")
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const addedToday = cards.filter((c) => c.createdAt >= todayStart).length
  const recentSessions = [...sessions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const testReminder = async () => {
    setSendingReminder(true)
    setReminderMsg(null)
    try {
      const res = await fetch("/api/remind", { method: "POST" })
      const data = await res.json()
      setReminderMsg(data.ok ? `Sent to ${data.sentTo}` : data.error)
    } catch {
      setReminderMsg("Failed to send")
    } finally {
      setSendingReminder(false)
    }
  }

  const streak = getStreak(log)
  const longestStreak = getLongestStreak(log)
  const reviewsThisWeek = getReviewsThisWeek(log)

  return (
    <main className="flex-1 container max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Gongbu Buddy
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload screenshots, extract vocab, review with spaced repetition
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar
        streak={streak}
        longestStreak={longestStreak}
        reviewsThisWeek={reviewsThisWeek}
        totalCards={cards.length}
      />

      {/* Mode switcher — combined due tracker for vocab + concepts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("vocab")}
          className={cn(
            "text-left rounded-xl border p-4 transition-colors",
            activeMode === "vocab"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-primary/10 p-2">
              <Flame className={cn("h-4 w-4", due > 0 ? "text-primary" : "text-muted-foreground")} />
            </div>
            {due > 0 && <Badge className="text-[11px]">{due} due</Badge>}
          </div>
          <p className="font-semibold text-sm mt-3">Vocab</p>
          <p className="text-xs text-muted-foreground">{cards.length} cards</p>
        </button>

        <button
          onClick={() => setMode("concepts")}
          className={cn(
            "text-left rounded-xl border p-4 transition-colors",
            activeMode === "concepts"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-primary/10 p-2">
              <GraduationCap className={cn("h-4 w-4", conceptsDue > 0 ? "text-primary" : "text-muted-foreground")} />
            </div>
            {conceptsDue > 0 && <Badge className="text-[11px]">{conceptsDue} due</Badge>}
          </div>
          <p className="font-semibold text-sm mt-3">Concepts</p>
          <p className="text-xs text-muted-foreground">{concepts.length} grammar concepts</p>
        </button>
      </div>

      {activeMode === "vocab" ? (
        <div className="space-y-8">
          {/* Due today banner */}
          <Card className={due > 0 ? "border-primary/40" : ""}>
            <CardContent className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Flame className={`h-5 w-5 ${due > 0 ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {due > 0 ? `${due} card${due !== 1 ? "s" : ""} due today` : "All caught up!"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cards.length} total cards
                  </p>
                </div>
              </div>
              <Button nativeButton={false} render={<Link href="/review" />} disabled={due === 0}>
                Start Review
              </Button>
            </CardContent>
          </Card>

          {/* New words progress */}
          <NewWordsProgress addedToday={addedToday} />

          {/* Struggle practice */}
          {struggleCount > 0 && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Struggle Practice</p>
                    <p className="text-xs text-muted-foreground">
                      {struggleCount} card{struggleCount !== 1 ? "s" : ""} · won&apos;t affect your schedule
                    </p>
                  </div>
                </div>
                <Button nativeButton={false} render={<Link href="/practice" />} variant="outline" size="sm">
                  Practice
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Activity heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Review Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap log={log} />
            </CardContent>
          </Card>

          {/* TOPIK progress */}
          <TopikProgress learnedCount={getLearnedCount(cards)} totalCount={cards.length} />

          {/* Milestones */}
          <Milestones learnedCount={getLearnedCount(cards)} />

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button nativeButton={false} render={<Link href="/upload" />} variant="outline" className="h-auto py-4 flex-col gap-1">
              <Upload className="h-5 w-5" />
              <span className="text-sm font-medium">Upload Screenshot</span>
              <span className="text-[11px] text-muted-foreground">Extract new vocab</span>
            </Button>
            <Button nativeButton={false} render={<Link href="/vocab" />} variant="outline" className="h-auto py-4 flex-col gap-1">
              <List className="h-5 w-5" />
              <span className="text-sm font-medium">All Vocabulary</span>
              <span className="text-[11px] text-muted-foreground">{cards.length} cards saved</span>
            </Button>
          </div>

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recent Sessions
              </h2>
              <Card>
                <CardContent className="p-0">
                  {recentSessions.map((session, i) => (
                    <div key={session.id}>
                      {i > 0 && <Separator />}
                      <div className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{session.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()} ·{" "}
                            {session.cardIds.length} cards
                          </p>
                        </div>
                        <Badge variant="secondary">{session.cardIds.length}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {cards.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground text-sm">No vocabulary yet.</p>
              <Button nativeButton={false} render={<Link href="/upload" />}>
                <Plus className="h-4 w-4 mr-2" />
                Upload your first screenshot
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Concepts due */}
          <Card className={conceptsDue > 0 ? "border-primary/40" : ""}>
            <CardContent className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <GraduationCap className={`h-5 w-5 ${conceptsDue > 0 ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {conceptsDue > 0 ? `${conceptsDue} concept${conceptsDue !== 1 ? "s" : ""} due` : "Concepts up to date"}
                  </p>
                  <p className="text-xs text-muted-foreground">{concepts.length} grammar concepts saved</p>
                </div>
              </div>
              <Button
                nativeButton={false}
                render={<Link href="/concepts/review" />}
                disabled={conceptsDue === 0}
              >
                Practice
              </Button>
            </CardContent>
          </Card>

          <Button
            nativeButton={false}
            render={<Link href="/concepts" />}
            variant="outline"
            className="w-full h-auto py-4 justify-between px-4"
          >
            <span className="flex flex-col items-start gap-1">
              <span className="text-sm font-medium">Browse all concepts</span>
              <span className="text-[11px] text-muted-foreground">
                Grammar rules, patterns, and drills
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {concepts.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground text-sm">No concepts yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Email reminder test */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={testReminder}
          disabled={sendingReminder}
          className="text-muted-foreground text-xs"
        >
          {sendingReminder ? (
            <Flame className="h-3 w-3 animate-pulse mr-1" />
          ) : (
            <Mail className="h-3 w-3 mr-1" />
          )}
          Test reminder email
        </Button>
        {reminderMsg && (
          <span className="text-xs text-muted-foreground">{reminderMsg}</span>
        )}
      </div>

      {/* localStorage migration */}
      <MigrateButton onMigrated={() => {
        getAllCards().then(setCards)
        getAllSessions().then(setSessions)
      }} />
    </main>
  )
}
