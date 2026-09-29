import Link from "next/link";
import { verifySession } from "@/lib/session";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user.model";
import { getDecks } from "@/lib/actions/flashcard.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { getTodos } from "@/lib/actions/todo.actions";
import { getComprehensiveAnalytics } from "@/lib/actions/analytics.actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Timer,
  Notebook,
  CheckSquare,
  BrainCircuit,
  BarChart3,
  Flame,
  ArrowRight,
  Plus,
  Play,
  Clock,
  Sparkles,
  Waves,
  CloudRain,
  Trophy,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default async function StudyZonePage() {
  const { userId } = await verifySession();
  await dbConnect();
  const user = await User.findById(userId).select("name email").lean();

  const [decks, notes, todos, analytics] = await Promise.all([
    getDecks().catch(() => []),
    getNotes().catch(() => []),
    getTodos().catch(() => []),
    getComprehensiveAnalytics().catch(() => null),
  ]);

  const firstName = user?.name ? (user.name as string).split(" ")[0] : "Student";

  // Dynamic greeting based on user's current time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const totalDueCards = decks.reduce((acc: number, d: any) => acc + (d.dueCount || 0), 0);
  const totalCards = decks.reduce((acc: number, d: any) => acc + (d.totalCards || 0), 0);
  const topDueDeck = decks.find((d: any) => d.dueCount > 0) || decks[0];

  const pendingTodos = todos.filter((t: any) => !t.completed).slice(0, 3);
  const recentNotes = notes.slice(0, 2);

  const currentStreak = analytics?.streaks?.currentStreak || 0;
  const totalFocusHours =
    Math.round(((analytics?.userTotals?.totalFocusMinutes || 0) / 60) * 10) / 10;

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                StudyForge Workspace
              </Badge>
              {currentStreak > 0 && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs gap-1">
                  <Flame className="h-3 w-3 fill-amber-500 animate-pulse" />
                  {currentStreak} Day Streak
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {greeting}, {firstName}!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl">
              {totalDueCards > 0
                ? `You have ${totalDueCards} active recall flashcard${totalDueCards === 1 ? "" : "s"} scheduled for review today.`
                : "You're all caught up on flashcards! Ready for a deep focus session?"}
            </p>
          </div>

          {/* Quick Action Badges / Shortcut CTA */}
          <div className="flex items-center flex-wrap gap-3">
            <Button asChild className="gap-2 shadow-md">
              <Link href="/study-zone/pomodoro">
                <Play className="h-4 w-4 fill-current" />
                Quick Focus (25m)
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/study-zone/flashcards">
                <Brain className="h-4 w-4 text-indigo-500" />
                Review Flashcards
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Quick Counters Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{currentStreak} days</p>
              <p className="text-[11px]">Current streak</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {totalFocusHours > 0 ? `${totalFocusHours} hrs` : "0 mins"}
              </p>
              <p className="text-[11px]">Total focus time</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{totalDueCards} due</p>
              <p className="text-[11px]">{totalCards} total flashcards</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{pendingTodos.length} pending</p>
              <p className="text-[11px]">Tasks on daily list</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bento 1: Spaced Repetition Flashcards (Double-wide on large screens) */}
        <Card className="lg:col-span-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Spaced Repetition Flashcards</CardTitle>
                  <CardDescription className="text-xs">
                    SuperMemo SM-2 memory retention engine
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-xs">
                Active Recall
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-card/80 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Review Schedule
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-foreground">{totalDueCards}</span>
                  <span className="text-sm text-muted-foreground">cards due today across {decks.length} deck(s)</span>
                </div>
              </div>

              {topDueDeck ? (
                <Button asChild className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href={`/study-zone/flashcards/${topDueDeck._id}/study`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Review "{topDueDeck.title.slice(0, 18)}..."
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="gap-2 shrink-0">
                  <Link href="/study-zone/flashcards">
                    <Plus className="h-3.5 w-3.5" />
                    Create Deck
                  </Link>
                </Button>
              )}
            </div>

            {/* Quick Decks preview tags */}
            {decks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground font-medium">Decks:</span>
                {decks.slice(0, 4).map((d: any) => (
                  <Link
                    key={d._id}
                    href={`/study-zone/flashcards/${d._id}`}
                    className="px-2.5 py-1 rounded-lg border bg-muted/40 hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <span>{d.title}</span>
                    {d.dueCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </Link>
                ))}
                {decks.length > 4 && (
                  <span className="text-muted-foreground">+{decks.length - 4} more</span>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>Adaptive intervals based on your recall accuracy</span>
            <Link
              href="/study-zone/flashcards"
              className="text-indigo-500 hover:underline flex items-center gap-1 font-semibold"
            >
              All Decks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Bento 2: Pomodoro & Web Audio Ambient Soundscapes */}
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Focus & Soundscapes</CardTitle>
                  <CardDescription className="text-xs">
                    Procedural audio synthesizer
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs">
                Web Audio
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-card/80 border border-rose-500/20 text-center space-y-2">
              <div className="text-4xl font-black font-mono text-primary tracking-tight">
                25:00
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Focus Session Preset
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground flex items-center gap-1">
                <Waves className="h-3.5 w-3.5 text-primary" /> Ambient soundscapes:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-muted/60 border text-[11px] inline-flex items-center gap-1">
                  <CloudRain className="h-3 w-3 text-primary" /> Soft Rain
                </span>
                <span className="px-2 py-0.5 rounded bg-muted/60 border text-[11px] inline-flex items-center gap-1">
                  <Waves className="h-3 w-3 text-primary" /> Waves
                </span>
                <span className="px-2 py-0.5 rounded bg-muted/60 border text-[11px] inline-flex items-center gap-1">
                  <Brain className="h-3 w-3 text-primary" /> 40Hz Tone
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-3 border-t">
            <Button asChild className="w-full gap-2" variant="outline">
              <Link href="/study-zone/pomodoro">
                Launch Zen Mode <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Bento 3: Smart Knowledge Base (Notes) */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <Notebook className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Study Notes</CardTitle>
                  <CardDescription className="text-xs">
                    {notes.length} note document{notes.length === 1 ? "" : "s"}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {recentNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 border rounded-xl bg-muted/40">
                No notes created yet. Capture your first study concepts!
              </p>
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note: any) => (
                  <Link
                    key={note._id}
                    href={`/study-zone/notes/editor/${note._id}`}
                    className="block p-2.5 rounded-xl border bg-card/80 hover:border-primary/40 transition-all text-xs"
                  >
                    <p className="font-semibold text-foreground truncate">{note.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 border-t flex items-center justify-between text-xs">
            <Link href="/study-zone/notes" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Browse Notes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Bento 4: Daily Action Plan (To-Do) */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Daily Tasks</CardTitle>
                  <CardDescription className="text-xs">
                    Keep your goals in focus
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {pendingTodos.length === 0 ? (
              <div className="p-3 rounded-xl border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>No pending tasks for today. You're all caught up!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {pendingTodos.map((todo: any) => (
                  <div
                    key={todo._id}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card/80 text-xs"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate text-foreground font-medium">{todo.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 border-t">
            <Link
              href="/study-zone/todo"
              className="text-xs text-emerald-500 hover:underline font-semibold flex items-center gap-1"
            >
              Open Daily & Weekly Planner <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Bento 5: AI Summarizer & Synthesis Hub */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">AI Summarizer</CardTitle>
                  <CardDescription className="text-xs">
                    Powered by Gemini 3.8 Flash
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
                Free Tier
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              Upload documents or paste lecture notes to extract concise summaries and convert them directly into active recall flashcards.
            </p>
            <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
              <span>Instant concept breakdown & key takeaways</span>
            </div>
          </CardContent>

          <CardFooter className="pt-3 border-t">
            <Button asChild variant="outline" className="w-full text-xs gap-1.5">
              <Link href="/study-zone/summarizer">
                Summarize Content <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Bento 6: 365-Day Study Analytics & Streak Strip (Full width) */}
        <Card className="lg:col-span-3 border-primary/20 bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Study Intelligence & 365-Day Heatmap</CardTitle>
                  <CardDescription className="text-xs">
                    Track daily focus velocity, active learning streaks, and long-term retention curves.
                  </CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs text-primary">
                <Link href="/study-zone/analytics">
                  Open Full Analytics <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs">
                <p className="text-muted-foreground font-medium">Current Streak</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span className="text-xl font-black text-foreground">{currentStreak} days</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-xs">
                <p className="text-muted-foreground font-medium">Longest Streak</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <span className="text-xl font-black text-foreground">{analytics?.streaks?.longestStreak || 0} days</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-xs">
                <p className="text-muted-foreground font-medium">Active Study Days</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-xl font-black text-foreground">{analytics?.streaks?.totalActiveDays || 0} days</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-xs">
                <p className="text-muted-foreground font-medium">Total Focus Hours</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xl font-black text-foreground">{totalFocusHours} hrs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
