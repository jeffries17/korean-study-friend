"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Upload, List, Flame, Plus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatsBar } from "@/components/StatsBar"
import { ActivityHeatmap } from "@/components/ActivityHeatmap"
import { TopikProgress } from "@/components/TopikProgress"
import { MigrateButton } from "@/components/MigrateButton"
import { getAllCards, getAllSessions, getReviewLog, type ReviewLog } from "@/lib/storage"
import { dueCount, getLearnedCount } from "@/lib/srs"
import { getStreak, getLongestStreak, getReviewsThisWeek } from "@/lib/stats"
import type { StudySession, VocabCard } from "@/lib/types"

export default function DashboardPage() {
  const [cards, setCards] = useState<VocabCard[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [log, setLog] = useState<ReviewLog>({})
  const [sendingReminder, setSendingReminder] = useState(false)
  const [reminderMsg, setReminderMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [c, s, l] = await Promise.all([getAllCards(), getAllSessions(), getReviewLog()])
      setCards(c)
      setSessions(s)
      setLog(l)
    }
    load()
  }, [])

  const due = dueCount(cards)
  const recentSessions = [...sessions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const testReminder = async () => {
    setSendingReminder(true)
    setReminderMsg(null)
    try {
      const pool = cards.length > 0 ? cards : []
      const word = pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)].korean
        : undefined
      const res = await fetch("/api/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streak, word }),
      })
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
          Korean Study Friend
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

      {cards.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground text-sm">No vocabulary yet.</p>
          <Button nativeButton={false} render={<Link href="/upload" />}>
            <Plus className="h-4 w-4 mr-2" />
            Upload your first screenshot
          </Button>
        </div>
      )}
    </main>
  )
}
