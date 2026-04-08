import { signIn, auth } from "@/auth"
import { redirect } from "next/navigation"
import { SpeakableDemo } from "@/components/SpeakableDemo"
import {
  BookOpen, Camera, BrainCircuit, Volume2,
  MessageSquare, BarChart2, Flame,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  const signInAction = async () => {
    "use server"
    await signIn("google", { redirectTo: "/dashboard" })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          Gongbu Buddy
        </div>
        <SignInButton action={signInAction} compact />
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center text-center gap-6 py-24 px-6 max-w-3xl mx-auto w-full">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.269_0_0)_0%,transparent_70%)] pointer-events-none" />
          <Badge variant="outline" className="text-xs">Free during beta</Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Your Korean,<br />from your real life.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Screenshot it. Gongbu Buddy extracts the vocab, builds your cards, and
            brings them back at exactly the right moment to make them stick.
          </p>
          <SignInButton action={signInAction} large />
          <p className="text-xs text-muted-foreground">Free to start · No credit card</p>
        </section>

        <Separator />

        {/* How it works */}
        <section className="py-16 px-6 max-w-5xl mx-auto w-full space-y-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-center">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard step={1} emoji="📸" title="Screenshot it" description="Snap anything with Korean — dramas, menus, texts, signs" />
            <StepCard step={2} emoji="✨" title="AI extracts vocab" description="Every word pulled out, translated, with a natural example sentence" />
            <StepCard step={3} emoji="🃏" title="Cards saved to your deck" description="Automatically organised — no manual entry ever" />
            <StepCard step={4} emoji="🔁" title="SRS brings them back" description="Shown at exactly the right interval so you actually remember" />
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="py-16 px-6 max-w-5xl mx-auto w-full space-y-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-center">
            Everything you need
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<Camera className="h-5 w-5" />} title="Screenshot Parsing" description="AI reads real-world Korean — subtitles, menus, chat screenshots, signs, textbook pages." />
            <FeatureCard icon={<BrainCircuit className="h-5 w-5" />} title="Spaced Repetition" description="SM-2 algorithm schedules every card at the optimal moment for your memory." />
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <div className="rounded-lg bg-primary/10 p-2 w-fit text-primary mb-1"><Volume2 className="h-5 w-5" /></div>
                <CardTitle className="text-sm">Word-by-word Pronunciation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>Hear any sentence spoken aloud with each word highlighted as it plays.</CardDescription>
                <SpeakableDemo />
              </CardContent>
            </Card>
            <FeatureCard icon={<MessageSquare className="h-5 w-5" />} title="Context Sentences" description="Each word comes with natural example sentences generated for that exact word." />
            <FeatureCard icon={<BarChart2 className="h-5 w-5" />} title="TOPIK Progress" description="See how your vocab maps against TOPIK levels as your deck grows." />
            <FeatureCard icon={<Flame className="h-5 w-5" />} title="Daily Streaks" description="A heatmap of your review activity so you can see your habit building over time." />
          </div>
        </section>

        <Separator />

        {/* Positioning */}
        <section className="py-16 px-6 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <blockquote className="border-l-2 border-primary pl-6 space-y-3">
              <p className="text-2xl font-semibold leading-snug">
                &ldquo;The fastest path from &lsquo;I saw that word&rsquo; to &lsquo;I own that word.&rsquo;&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">Built for people already living in Korean</p>
            </blockquote>
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Perfect for</p>
              <ul className="space-y-2 text-sm">
                <li>🎬 Watching K-dramas and picking up every new word</li>
                <li>🇰🇷 Living in Korea and meeting new vocab every day</li>
                <li>📚 Studying Korean and want words from your own materials</li>
              </ul>
              <div className="pt-2 space-y-2">
                <p className="text-xs text-muted-foreground">Not a replacement for</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Grammar lessons</Badge>
                  <Badge variant="secondary">Structured curriculum</Badge>
                  <Badge variant="secondary">Conversation practice</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Final CTA */}
        <section className="py-20 px-6 max-w-lg mx-auto w-full">
          <Card>
            <CardContent className="py-10 px-8 flex flex-col items-center text-center gap-5">
              <p className="text-6xl font-bold text-primary/20 select-none" aria-hidden>공부</p>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Start building your real-life vocabulary</h2>
                <p className="text-muted-foreground text-sm">Free to try. Your first screenshot is one tap away.</p>
              </div>
              <SignInButton action={signInAction} large />
              <p className="text-xs text-muted-foreground">No credit card required · Sign in with Google</p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground px-4">
        Gongbu Buddy · Built for Korean learners · 공부하자
      </footer>
    </div>
  )
}

// ── Private components ────────────────────────────────────────────────────────

function SignInButton({
  action,
  large,
  compact,
}: {
  action: () => Promise<void>
  large?: boolean
  compact?: boolean
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={
          compact
            ? "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            : large
            ? "flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto"
            : "flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        }
      >
        <GoogleIcon />
        {compact ? "Sign in" : "Continue with Google"}
      </button>
    </form>
  )
}

function StepCard({
  step,
  emoji,
  title,
  description,
}: {
  step: number
  emoji: string
  title: string
  description: string
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <span className="text-3xl">{emoji}</span>
          <Badge variant="secondary" className="text-[10px] tabular-nums">{step}</Badge>
        </div>
        <CardTitle className="text-sm mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="rounded-lg bg-primary/10 p-2 w-fit text-primary mb-1">{icon}</div>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
