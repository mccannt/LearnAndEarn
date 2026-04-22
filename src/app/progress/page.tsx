"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  Clock,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LearnerWorkspaceShell } from "@/components/learner-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { LearnerEmptyState, LearnerLoadingGrid } from "@/components/learner-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubjectSummary = {
  subject: string;
  progress: number;
  accuracy: number;
  sessions: number;
  timeSpent: number;
  lastSession?: string;
};

type WeeklyPoint = {
  day: string;
  math: number;
  english: number;
};

type SessionSummary = {
  id: string;
  subject: "MATH" | "ENGLISH";
  topic: string;
  duration: number;
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
  completedAt: string;
};

type ProgressPayload = {
  child: { currentStreak: number } | null;
  subjects: SubjectSummary[];
  weekly: WeeklyPoint[];
  totals: {
    totalSessions: number;
    totalTime: number;
    totalPoints: number;
    averageAccuracy: number;
  };
  recent: SessionSummary[];
};

const progressPanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(95,111,255,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const weeklyChartConfig = {
  math: {
    label: "Math",
    color: "#4f7cff",
  },
  english: {
    label: "English",
    color: "#ff6f92",
  },
} satisfies ChartConfig;

const subjectChartConfig = {
  progress: {
    label: "Progress",
    color: "#7c5cff",
  },
  accuracy: {
    label: "Accuracy",
    color: "#12b981",
  },
} satisfies ChartConfig;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMinutes(totalMinutes: number) {
  return `${Math.floor((totalMinutes || 0) / 60)}h ${(totalMinutes || 0) % 60}m`;
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setHasError(false);
    fetch("/api/progress", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load progress");
        }

        return response.json();
      })
      .then((json) => {
        setData(json?.data || null);
      })
      .catch(() => {
        setData(null);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const subjects = data?.subjects ?? [];
  const totals = data?.totals ?? { totalSessions: 0, totalTime: 0, totalPoints: 0, averageAccuracy: 0 };
  const weekly = data?.weekly ?? [];
  const recent = data?.recent ?? [];

  const weeklyChartData = weekly.map((point) => ({
    day: point.day.slice(5),
    math: point.math,
    english: point.english,
    total: point.math + point.english,
  }));

  const subjectChartData = subjects.map((subject) => ({
    subject: subject.subject,
    progress: subject.progress,
    accuracy: subject.accuracy,
  }));
  const strongestSubject = [...subjectChartData].sort((left, right) => right.accuracy - left.accuracy)[0]?.subject;

  return (
    <LearnerWorkspaceShell
      currentSection="progress"
      title="Progress & Statistics"
      description="See how your streak, accuracy, and recent sessions are building up across both subjects."
      icon={<BarChart3 className="h-6 w-6" />}
      accent="sky"
      actions={
        <Button asChild variant="outline" className="rounded-full border-white/80 bg-white/70 dark:border-white/10 dark:bg-white/5">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      }
      metrics={[
        { label: "Sessions", value: `${totals.totalSessions}` },
        { label: "Points", value: `${totals.totalPoints}` },
        { label: "Accuracy", value: `${totals.averageAccuracy}%` },
        { label: "Streak", value: `${data?.child?.currentStreak ?? 0} days` },
      ]}
    >
      <div className="mx-auto max-w-7xl">
        {loading ? (
          <div className="space-y-6">
            <LearnerLoadingGrid />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className={progressPanelClass}>
                <div className="space-y-4 p-6">
                  <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-60 animate-pulse rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className={progressPanelClass}>
                <div className="space-y-4 p-6">
                  <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-60 animate-pulse rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        ) : hasError ? (
          <LearnerEmptyState
            title="Progress is temporarily unavailable"
            description="The dashboard could not load right now. Try refreshing after a moment and your charts should return."
            icon={<AlertCircle className="h-6 w-6" />}
          />
        ) : !data ? (
          <LearnerEmptyState
            title="No progress yet"
            description="Finish a learning session to start filling your stats board with charts, streaks, and achievements."
            icon={<TrendingUp className="h-6 w-6" />}
          />
        ) : (
          <MotionGroup className="space-y-6">
          <MotionItem>
            <Card className={progressPanelClass}>
              <CardContent className="p-6">
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#345eff_0%,#6881ff_54%,#61d9ff_100%)] p-6 text-white shadow-[0_26px_70px_rgba(95,111,255,0.24)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
                        Stats Board
                      </Badge>
                      <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                        {subjects.length} tracked subject{subjects.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                      Read momentum at a glance instead of piecing it together from separate screens.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 md:text-base">
                      Sessions, points, streaks, and subject performance now sit in one clearer progress layer so it’s easier to see what deserves the next push.
                    </p>
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Points earned</div>
                        <div className="mt-2 text-3xl font-semibold">{totals.totalPoints}</div>
                        <p className="mt-2 text-sm text-white/80">Every session rolls forward into rewards and unlocks.</p>
                      </div>
                      <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Time invested</div>
                        <div className="mt-2 text-3xl font-semibold">{formatMinutes(totals.totalTime)}</div>
                        <p className="mt-2 text-sm text-white/80">A simple view of how much practice is actually happening.</p>
                      </div>
                      <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Current streak</div>
                        <div className="mt-2 text-3xl font-semibold">{data.child?.currentStreak ?? 0} days</div>
                        <p className="mt-2 text-sm text-white/80">A fast read on rhythm, consistency, and follow-through.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Strongest subject</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {strongestSubject ?? "No data yet"}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Based on current accuracy across the tracked subjects.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Latest acceleration</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {recent[0] ? `${recent[0].subject === "MATH" ? "Math" : "English"} • ${recent[0].topic}` : "No recent session"}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Your latest session usually tells you where the next momentum bump can come from.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionItem>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 rounded-[1.5rem] border border-white/80 bg-white/75 p-1 dark:border-white/10 dark:bg-slate-950/45 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MotionGroup className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total Sessions</p>
                            <p className="text-2xl font-bold text-indigo-600">{totals.totalSessions}</p>
                          </div>
                          <BookOpen className="h-8 w-8 text-indigo-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </MotionItem>

                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Time Spent</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {formatMinutes(totals.totalTime)}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </MotionItem>

                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Average Accuracy</p>
                            <p className="text-2xl font-bold text-emerald-600">{totals.averageAccuracy}%</p>
                          </div>
                          <Target className="h-8 w-8 text-emerald-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </MotionItem>

                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Current Streak</p>
                            <p className="text-2xl font-bold text-orange-600">{data.child?.currentStreak ?? 0} days</p>
                          </div>
                          <Trophy className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </MotionItem>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardHeader>
                        <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Weekly Momentum</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                          A stacked view of your math and English time over the last seven days.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {weeklyChartData.length === 0 ? (
                          <LearnerEmptyState
                            title="No weekly sessions yet"
                            description="Finish a lesson and your weekly chart will start to light up here."
                          />
                        ) : (
                          <ChartContainer
                            className="h-[280px] w-full"
                            config={weeklyChartConfig}
                          >
                            <BarChart accessibilityLayer data={weeklyChartData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="day" tickLine={false} axisLine={false} />
                              <YAxis tickLine={false} axisLine={false} />
                              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                              <ChartLegend content={<ChartLegendContent />} />
                              <Bar dataKey="math" fill="var(--color-math)" radius={[10, 10, 0, 0]} />
                              <Bar dataKey="english" fill="var(--color-english)" radius={[10, 10, 0, 0]} />
                            </BarChart>
                          </ChartContainer>
                        )}
                      </CardContent>
                    </Card>
                  </MotionItem>

                  <MotionItem>
                    <Card className={progressPanelClass}>
                      <CardHeader>
                        <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Current Run</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                          A quick pulse check on what your recent sessions are building.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recent.length === 0 ? (
                          <LearnerEmptyState
                            title="No highlights yet"
                            description="Recent sessions and streak moments will appear here as soon as you start playing."
                            icon={<Award className="h-6 w-6" />}
                          />
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-[1.25rem] bg-gradient-to-br from-yellow-50 to-orange-50 p-4 dark:from-yellow-500/10 dark:to-orange-500/10">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Recent Points</div>
                                <div className="mt-2 text-2xl font-bold text-amber-600">
                                  {recent.slice(0, 3).reduce((sum, session) => sum + session.pointsEarned, 0)}
                                </div>
                                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">From your latest three sessions</div>
                              </div>
                              <div className="rounded-[1.25rem] bg-gradient-to-br from-sky-50 to-indigo-50 p-4 dark:from-sky-500/10 dark:to-indigo-500/10">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Best Accuracy</div>
                                <div className="mt-2 text-2xl font-bold text-sky-600">
                                  {Math.max(
                                    ...recent.slice(0, 3).map((session) =>
                                      Math.round((session.questionsCorrect / Math.max(1, session.questionsAsked)) * 100),
                                    ),
                                  )}
                                  %
                                </div>
                                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Top finish across recent sessions</div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {recent.slice(0, 2).map((session) => (
                                <div key={session.id} className="flex items-center gap-3 rounded-[1.5rem] bg-white/70 p-3 ring-1 ring-white/80 dark:bg-slate-900/45 dark:ring-white/10">
                                  <div className="text-2xl">🏆</div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-950 dark:text-slate-50">
                                      {session.subject === "MATH" ? "Great Math Session" : "Great English Session"}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                      {session.pointsEarned} points • {session.questionsCorrect}/{session.questionsAsked} correct
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {formatDate(session.completedAt)}
                                    </div>
                                  </div>
                                  <Award className="h-5 w-5 text-yellow-500" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </MotionItem>
                </div>
              </MotionGroup>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <MotionGroup className="space-y-6">
                <MotionItem>
                  <Card className={progressPanelClass}>
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Subject Comparison</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Compare overall progress and accuracy side by side.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subjectChartData.length === 0 ? (
                        <LearnerEmptyState
                          title="No subject data yet"
                          description="Once you complete lessons, each subject will gain its own performance profile."
                        />
                      ) : (
                        <ChartContainer className="h-[280px] w-full" config={subjectChartConfig}>
                          <AreaChart accessibilityLayer data={subjectChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area type="monotone" dataKey="progress" fill="var(--color-progress)" fillOpacity={0.18} stroke="var(--color-progress)" strokeWidth={3} />
                            <Area type="monotone" dataKey="accuracy" fill="var(--color-accuracy)" fillOpacity={0.14} stroke="var(--color-accuracy)" strokeWidth={3} />
                          </AreaChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                </MotionItem>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {subjects.length === 0 ? (
                    <div className="lg:col-span-2">
                      <LearnerEmptyState
                        title="No subject cards yet"
                        description="Subject breakdowns unlock after your first logged sessions."
                      />
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <MotionItem key={subject.subject}>
                        <Card className={progressPanelClass}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${subject.subject === "Math" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" : "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300"}`}>
                                  {subject.subject === "Math" ? <Calculator className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                                </div>
                                <div>
                                  <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">{subject.subject}</CardTitle>
                                  {subject.lastSession ? (
                                    <CardDescription className="text-slate-600 dark:text-slate-300">
                                      Last session: {formatDate(subject.lastSession)}
                                    </CardDescription>
                                  ) : null}
                                </div>
                              </div>
                              <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                                {subject.progress}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="mb-2 flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{subject.progress}%</span>
                              </div>
                              <Progress value={subject.progress} className="h-3" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="rounded-[1rem] bg-white/70 p-3 text-center dark:bg-slate-900/45">
                                <div className="text-lg font-bold text-blue-600">{subject.sessions}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Sessions</div>
                              </div>
                              <div className="rounded-[1rem] bg-white/70 p-3 text-center dark:bg-slate-900/45">
                                <div className="text-lg font-bold text-emerald-600">{subject.accuracy}%</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Accuracy</div>
                              </div>
                              <div className="rounded-[1rem] bg-white/70 p-3 text-center dark:bg-slate-900/45">
                                <div className="text-lg font-bold text-purple-600">{subject.timeSpent}m</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Time</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </MotionItem>
                    ))
                  )}
                </div>
              </MotionGroup>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <MotionGroup>
                <MotionItem>
                  <Card className={progressPanelClass}>
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2 text-xl text-slate-950 dark:text-slate-50">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        In Progress
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Your latest sessions show what’s improving fastest right now.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recent.length === 0 ? (
                        <LearnerEmptyState
                          title="No streak story yet"
                          description="Your current milestones will appear here once you have a few sessions on the board."
                        />
                      ) : (
                        <div className="space-y-3">
                          {recent.slice(0, 4).map((session) => (
                            <div key={session.id} className="flex items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/45">
                              <div className="text-2xl opacity-60">⭐</div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-950 dark:text-slate-50">
                                  {session.subject === "MATH" ? "Math" : "English"} • {session.topic}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                  {session.duration}m • {session.questionsCorrect}/{session.questionsAsked} correct
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatDate(session.completedAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </MotionItem>
              </MotionGroup>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <MotionGroup>
                <MotionItem>
                  <Card className={progressPanelClass}>
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Learning History</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Your complete session history, with performance snapshots for each run.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recent.length === 0 ? (
                        <LearnerEmptyState
                          title="No history yet"
                          description="Once you finish a session, your timeline will appear here with accuracy and points."
                        />
                      ) : (
                        <div className="space-y-3">
                          {recent.map((session) => {
                            const accuracy = Math.round((session.questionsCorrect / Math.max(1, session.questionsAsked)) * 100);

                            return (
                              <div key={session.id} className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/45">
                                <div className="flex items-center gap-4">
                                  <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${session.subject === "MATH" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" : "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300"}`}>
                                    {session.subject === "MATH" ? <Calculator className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-950 dark:text-slate-50">
                                      {session.subject === "MATH" ? "Math" : "English"} - {session.topic}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                      {session.duration} minutes • {formatDate(session.completedAt)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Accuracy:</span>
                                    <span className="font-semibold text-emerald-600">{accuracy}%</span>
                                  </div>
                                  <div className="font-semibold text-purple-600">+{session.pointsEarned} points</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </MotionItem>
              </MotionGroup>
            </TabsContent>
          </Tabs>
          </MotionGroup>
        )}
      </div>
    </LearnerWorkspaceShell>
  );
}
