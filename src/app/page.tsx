"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calculator,
  Crown,
  MoveRight,
  Palette,
  Shield,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { LearnerWorkspaceShell } from "@/components/learner-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { SafeHydrated } from "@/components/SafeHydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ChildOption = { id: string; name: string };
type RecentSession = {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  pointsEarned: number;
  completedAt: string;
};

type ProgressSubject = {
  subject: string;
  progress: number;
};

type ProgressResponse = {
  data?: {
    child?: {
      id: string;
      totalPoints?: number;
      currentStreak?: number;
    };
    totals?: {
      averageAccuracy?: number;
    };
    subjects?: ProgressSubject[];
  };
};

type ChildrenResponse = {
  children?: Array<{ id: string; name: string }>;
};

type SessionsResponse = {
  sessions?: RecentSession[];
};

const shellCardClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(162,83,255,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | undefined>(undefined);
  const [totals, setTotals] = useState({ points: 0, streak: 0, accuracy: 0 });
  const [subjectProgress, setSubjectProgress] = useState({ math: 0, english: 0 });
  const [recent, setRecent] = useState<RecentSession[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/progress", { cache: "no-store" });
      const json = (await response.json()) as ProgressResponse;
      const data = json?.data;
      if (data?.child) {
        setActiveChildId(data.child.id);
        setTotals({
          points: data.child.totalPoints ?? 0,
          streak: data.child.currentStreak ?? 0,
          accuracy: data.totals?.averageAccuracy ?? 0,
        });

        const math = (data.subjects || []).find((subject) => subject.subject === "Math")?.progress ?? 0;
        const english = (data.subjects || []).find((subject) => subject.subject === "English")?.progress ?? 0;
        setSubjectProgress({ math, english });
      }

      const sessionsResponse = await fetch("/api/sessions", { cache: "no-store" });
      const sessionsJson = (await sessionsResponse.json()) as SessionsResponse;
      setRecent((sessionsJson?.sessions || []).slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/children", { cache: "no-store" });
      const json = (await response.json()) as ChildrenResponse;
      setChildren((json?.children || []).map((child) => ({ id: child.id, name: child.name })));
    } catch {
      setChildren([]);
    }
  };

  useEffect(() => {
    void fetchProgress();
    void fetchChildren();
  }, []);

  const topSubject = subjectProgress.math >= subjectProgress.english ? "Math" : "English";
  const topSubjectRoute = topSubject === "Math" ? "/math" : "/english";
  const focusMomentum = Math.min(100, Math.max(subjectProgress.math, subjectProgress.english) + 20);
  const sessionCadence = recent.length > 0 ? "Warm" : "Starting";

  const onSelectChild = async (childId: string) => {
    try {
      setActiveChildId(childId);
      await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      await fetchProgress();
      toast({ title: "Switched child", description: "The play studio is ready for the new learner." });
    } catch {
      toast({ title: "Failed to switch", description: "Please try again.", variant: "destructive" as const });
    }
  };

  return (
    <LearnerWorkspaceShell
      currentSection="home"
      title="Learn & Earn"
      description="Bounce between math quests, English challenges, rewards, and avatar upgrades from one playful home base."
      icon={<Sparkles className="h-6 w-6" />}
      accent="violet"
      actions={
        <>
          <div className="min-w-[190px]">
            <Select value={activeChildId} onValueChange={onSelectChild}>
              <SelectTrigger className="rounded-full border-white/80 bg-white/70 dark:border-white/10 dark:bg-white/5">
                <SelectValue placeholder="Choose learner" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button asChild variant="outline" className="rounded-full border-slate-300/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <Link href="/parent">
              <Shield className="mr-2 h-4 w-4" />
              Parent Dashboard
            </Link>
          </Button>
        </>
      }
      metrics={[
        { label: "Learning Points", value: `${totals.points}` },
        { label: "Current Streak", value: `${totals.streak} days` },
        { label: "Accuracy", value: `${totals.accuracy}%` },
        { label: "Recent Sessions", value: `${recent.length}` },
      ]}
    >
      <MotionGroup className="space-y-6">
        <MotionItem>
        <Card className={shellCardClass}>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="font-display text-2xl text-slate-950 dark:text-slate-50 md:text-3xl">
                  {loading ? "Loading your studio..." : "Ready for today’s learning streak?"}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                  Pick a challenge, earn points, and unlock new looks in the avatar studio.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-violet-100 px-3 py-1 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                  {subjectProgress.math}% math
                </Badge>
                <Badge className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {subjectProgress.english}% English
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#2f58ff_0%,#7e63ff_58%,#d770ff_100%)] p-6 text-white shadow-[0_26px_70px_rgba(102,86,255,0.28)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
                    Mission Board
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                    Start where momentum is highest
                  </Badge>
                </div>
                <div className="mt-5 max-w-xl">
                  <h2 className="font-display text-3xl font-semibold md:text-4xl">
                    Build one strong streak instead of scattering attention.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/82 md:text-base">
                    Your home base now points you toward the fastest next win: a fresh quest, an upgrade, or a reward check-in.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Daily Energy</div>
                    <div className="mt-2 text-3xl font-semibold">{focusMomentum}%</div>
                    <p className="mt-2 text-sm text-white/80">Enough momentum to push another session.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Top Subject</div>
                    <div className="mt-2 text-3xl font-semibold">{topSubject}</div>
                    <p className="mt-2 text-sm text-white/80">Lean into the subject already warming up.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Quick Return</div>
                    <div className="mt-2 text-3xl font-semibold">{recent.length}</div>
                    <p className="mt-2 text-sm text-white/80">Recent sessions ready to turn into a streak.</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full bg-white text-violet-700 hover:bg-slate-100">
                    <Link href={topSubjectRoute}>
                      Resume Best Path
                      <MoveRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                    <Link href="/progress">View Progress Board</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#ff8d5d_0%,#ffb94b_60%,#ffe08d_100%)] p-5 text-slate-950 shadow-lg shadow-orange-500/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-700/70">Points Wallet</div>
                      <div className="mt-3 flex items-center gap-2 text-4xl font-semibold">
                        <Star className="h-8 w-8 text-amber-600" />
                        {totals.points}
                      </div>
                    </div>
                    <Badge className="rounded-full bg-white/40 px-3 py-1 text-slate-800">Spend or save</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">Enough for upgrades, rewards, or a streak push.</p>
                  <div className="mt-4 rounded-[1.2rem] border border-white/35 bg-white/30 px-3 py-3 text-sm text-slate-800/85">
                    Highest-value move right now: keep stacking before cashing out if you are chasing a bigger unlock.
                  </div>
                </div>
                <div className="overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#3fd1bc_0%,#65d7ff_55%,#c7f8ff_100%)] p-5 text-slate-950 shadow-lg shadow-cyan-500/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-700/70">Streak Flame</div>
                      <div className="mt-3 flex items-center gap-2 text-4xl font-semibold">
                        <Trophy className="h-8 w-8 text-emerald-700" />
                        {totals.streak}
                      </div>
                    </div>
                    <Badge className="rounded-full bg-white/40 px-3 py-1 text-slate-800">{sessionCadence}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">Keep your streak alive with one more session today.</p>
                  <div className="mt-4 grid gap-2">
                    <div className="flex items-center justify-between rounded-[1.2rem] border border-white/40 bg-white/30 px-3 py-2 text-sm">
                      <span className="text-slate-700/75">Suggested route</span>
                      <span className="font-semibold text-slate-900">{topSubject}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[1.2rem] border border-white/40 bg-white/30 px-3 py-2 text-sm">
                      <span className="text-slate-700/75">Momentum</span>
                      <span className="font-semibold text-slate-900">{focusMomentum}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </MotionItem>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <MotionItem>
              <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-[linear-gradient(135deg,#315dff_0%,#7b5dff_62%,#cb74ff_100%)] text-white shadow-[0_24px_60px_rgba(78,81,255,0.24)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <SafeHydrated>
                      <Calculator className="h-8 w-8" />
                    </SafeHydrated>
                    <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
                      Math Quest
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-2xl">Math Adventure</CardTitle>
                  <CardDescription className="text-white/75">
                    Multiplication and division sessions with quick scoring and streak support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                      <span>Progress</span>
                      <span>{subjectProgress.math}%</span>
                    </div>
                    <Progress value={subjectProgress.math} className="h-2 bg-white/20" />
                  </div>
                  <Button asChild className="w-full rounded-full bg-white text-violet-700 hover:bg-slate-100">
                    <Link href="/math">Start Math Session</Link>
                  </Button>
                </CardContent>
              </Card>
              </MotionItem>

              <MotionItem>
              <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-[linear-gradient(135deg,#ff6f92_0%,#ff7f62_55%,#ffbf5f_100%)] text-white shadow-[0_24px_60px_rgba(255,111,146,0.24)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <SafeHydrated>
                      <BookOpen className="h-8 w-8" />
                    </SafeHydrated>
                    <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
                      English Quest
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-2xl">English Explorer</CardTitle>
                  <CardDescription className="text-white/75">
                    Grammar, vocabulary, reading, and sentence structure practice in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                      <span>Progress</span>
                      <span>{subjectProgress.english}%</span>
                    </div>
                    <Progress value={subjectProgress.english} className="h-2 bg-white/20" />
                  </div>
                  <Button asChild className="w-full rounded-full bg-white text-rose-700 hover:bg-slate-100">
                    <Link href="/english">Start English Session</Link>
                  </Button>
                </CardContent>
              </Card>
              </MotionItem>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <MotionItem>
              <Card className={shellCardClass}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-[1.15rem] bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                      <Palette className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Avatar Studio</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Dress up your character with the items you unlock.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Spend points on new looks, backgrounds, and accessories.
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200"
                    onClick={() => {
                      toast({ title: "Avatar studio", description: "Opening your customization room." });
                      router.push("/avatar");
                    }}
                  >
                    Customize
                  </Button>
                </CardContent>
              </Card>
              </MotionItem>

              <MotionItem>
              <Card className={shellCardClass}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-[1.15rem] bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Reward Store</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Trade points for time, perks, and redemptions.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Check what you can afford and how much stock is left.
                  </div>
                  <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
                    <Link href="/rewards">Browse Rewards</Link>
                  </Button>
                </CardContent>
              </Card>
              </MotionItem>
            </div>
          </div>

          <div className="space-y-6">
            <MotionItem>
            <Card className={shellCardClass}>
              <CardHeader>
                <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Recent Activity</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Your latest wins, streak moments, and learning sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recent.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No sessions yet. Start a quest to fill your activity board.
                    </div>
                  ) : (
                    recent.map((session) => (
                      <div key={session.id} className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${
                            session.subject === "MATH"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                          }`}>
                            {session.subject === "MATH" ? <Calculator className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-950 dark:text-slate-50">
                              {session.subject === "MATH" ? "Math" : "English"} • {session.topic}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {session.duration} min • {new Date(session.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-violet-700 dark:text-violet-200">+{session.pointsEarned}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            </MotionItem>

            <MotionItem>
            <Card className={shellCardClass}>
              <CardHeader>
                <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Parent Corner</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Quick routes for reporting, settings, and rewards oversight.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="justify-start rounded-full border-slate-300/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
                  <Link href="/progress">
                    <Trophy className="mr-2 h-4 w-4" />
                    Progress Reports
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-full border-slate-300/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
                  <Link href="/parent">
                    <Shield className="mr-2 h-4 w-4" />
                    Session Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </MotionItem>
          </div>
        </div>
      </MotionGroup>
    </LearnerWorkspaceShell>
  );
}
