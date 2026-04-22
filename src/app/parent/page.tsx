"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calculator,
  Clock,
  Eye,
  EyeOff,
  Flame,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Star,
  Target,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { ParentWorkspaceShell } from "@/components/parent-workspace-shell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { formatGradeLabel } from "@/lib/grade-level";

type AuthStatus = "checking" | "authenticated" | "logged_out";

type ParentSettings = {
  maxDailySessionTime: number;
  maxWeeklySessionTime: number;
  pointsPerScreenTime: number;
  pointsPerRobux: number;
  sessionDifficulty: string;
  passwordProtected: boolean;
  parentPassword?: string;
};

type ChildSummary = {
  id: string;
  name: string;
  age: number;
  gradeLevel?: number | null;
};

type DashboardChild = ChildSummary & {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
};

type SubjectProgressItem = {
  subject: string;
  progress: number;
  accuracy: number;
  sessions: number;
  timeSpent: number;
  lastSession?: string;
};

type WeeklyActivityPoint = {
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
  child: DashboardChild | null;
  subjects: SubjectProgressItem[];
  weekly: WeeklyActivityPoint[];
  totals: {
    totalSessions: number;
    totalTime: number;
    totalPoints: number;
    averageAccuracy: number;
  };
  recent: SessionSummary[];
};

type ResetType = "all" | "sessions" | "progress" | "rewards" | "points";

const DEFAULT_SETTINGS: ParentSettings = {
  maxDailySessionTime: 60,
  maxWeeklySessionTime: 300,
  pointsPerScreenTime: 10,
  pointsPerRobux: 100,
  sessionDifficulty: "medium",
  passwordProtected: true,
};

const RESET_OPTIONS: Array<{
  value: ResetType;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All Data",
    description: "Reset sessions, progress, rewards, points, and streak for the active child.",
  },
  {
    value: "sessions",
    label: "Learning Sessions",
    description: "Clear recorded learning sessions while keeping progress and reward history intact.",
  },
  {
    value: "progress",
    label: "Progress Data",
    description: "Reset subject progress without deleting rewards or session history.",
  },
  {
    value: "rewards",
    label: "Reward History",
    description: "Clear reward redemption history for the active child.",
  },
  {
    value: "points",
    label: "Points and Streak",
    description: "Reset points and streak values while leaving sessions and progress untouched.",
  },
];

const workspacePanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/78 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const metricCardClass =
  "overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/72 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50 dark:shadow-[0_20px_50px_rgba(2,6,23,0.3)]";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSubject(subject: string) {
  if (subject === "MATH") return "Math";
  if (subject === "ENGLISH") return "English";
  return subject;
}

function buildErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const errorMessage =
      typeof payload.error === "string"
        ? payload.error
        : typeof payload.message === "string"
          ? payload.message
          : "Request failed";
    throw new Error(errorMessage);
  }
  return payload as T;
}

export default function ParentDashboardPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState<ParentSettings>(DEFAULT_SETTINGS);
  const [childData, setChildData] = useState<DashboardChild | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressItem[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityPoint[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [newChild, setNewChild] = useState({ name: "", age: "", gradeLevel: "" });

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [switchingChildId, setSwitchingChildId] = useState<string | null>(null);
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  const [childToDelete, setChildToDelete] = useState<ChildSummary | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetType, setResetType] = useState<ResetType>("all");
  const [isResetting, setIsResetting] = useState(false);

  const { toast } = useToast();

  const resetDashboardState = () => {
    setSettings(DEFAULT_SETTINGS);
    setChildData(null);
    setSubjectProgress([]);
    setWeeklyActivity([]);
    setRecentSessions([]);
    setChildren([]);
    setActiveChildId(null);
  };

  const handleRequestFailure = (error: unknown, fallback: string) => {
    const message = buildErrorMessage(error, fallback);

    if (message === "Unauthorized") {
      resetDashboardState();
      setAuthStatus("logged_out");
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive" as const,
      });
      return;
    }

    toast({
      title: fallback,
      description: message,
      variant: "destructive" as const,
    });
  };

  const loadDashboardData = async (childId?: string | null) => {
    setLoadingDashboard(true);

    try {
      const progressUrl = childId
        ? `/api/progress?childId=${encodeURIComponent(childId)}`
        : "/api/progress";

      const [settingsResponse, progressResponse, childrenResponse] = await Promise.all([
        fetch("/api/settings"),
        fetch(progressUrl),
        fetch("/api/children"),
      ]);

      const [{ settings: nextSettings }, { data }, { children: nextChildren }] = await Promise.all([
        readJson<{ ok: boolean; settings: ParentSettings | null }>(settingsResponse),
        readJson<{ ok: boolean; data: ProgressPayload | null }>(progressResponse),
        readJson<{ children: ChildSummary[] }>(childrenResponse),
      ]);

      setSettings(nextSettings ?? DEFAULT_SETTINGS);
      setChildren(nextChildren);
      setSubjectProgress(data?.subjects ?? []);
      setWeeklyActivity(data?.weekly ?? []);
      setRecentSessions(data?.recent ?? []);

      if (data?.child) {
        setChildData(data.child);
        setActiveChildId(data.child.id);
      } else {
        setChildData(null);
        setActiveChildId(nextChildren[0]?.id ?? null);
      }
    } catch (error) {
      handleRequestFailure(error, "Failed to load dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const checkAuthStatus = async () => {
    setAuthStatus("checking");

    try {
      const response = await fetch("/api/parent/login");
      const data = await readJson<{ ok: boolean; authed: boolean }>(response);

      if (data.authed) {
        setAuthStatus("authenticated");
        await loadDashboardData();
      } else {
        resetDashboardState();
        setAuthStatus("logged_out");
      }
    } catch {
      resetDashboardState();
      setAuthStatus("logged_out");
    }
  };

  useEffect(() => {
    void checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    setIsAuthenticating(true);

    try {
      const response = await fetch("/api/parent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      await readJson<{ ok: boolean }>(response);
      setPassword("");
      setAuthStatus("authenticated");
      await loadDashboardData();
      toast({
        title: "Welcome back",
        description: "Parent dashboard unlocked.",
      });
    } catch (error) {
      handleRequestFailure(error, "Login failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/logout", { method: "POST" });
      resetDashboardState();
      setAuthStatus("logged_out");
      setPassword("");
      toast({
        title: "Logged out",
        description: "You have been signed out of the parent dashboard.",
      });
    } catch (error) {
      handleRequestFailure(error, "Logout failed");
    }
  };

  const handleSwitchChild = async (childId: string) => {
    if (childId === activeChildId) return;

    setSwitchingChildId(childId);

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = await readJson<{ ok: boolean; child?: ChildSummary }>(response);
      const nextChildId = data.child?.id ?? childId;

      setActiveChildId(nextChildId);
      await loadDashboardData(nextChildId);
      toast({
        title: "Active child updated",
        description: `Now viewing ${data.child?.name ?? "the selected child"}.`,
      });
    } catch (error) {
      handleRequestFailure(error, "Failed to switch child");
    } finally {
      setSwitchingChildId(null);
    }
  };

  const handleAddChild = async () => {
    const trimmedName = newChild.name.trim();
    const parsedAge = Number.parseInt(newChild.age, 10);

    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Enter a name before creating a child profile.",
        variant: "destructive" as const,
      });
      return;
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      toast({
        title: "Valid age required",
        description: "Enter a positive age to create a child profile.",
        variant: "destructive" as const,
      });
      return;
    }

    setIsAddingChild(true);

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          age: parsedAge,
          gradeLevel: newChild.gradeLevel === "" ? null : Number.parseInt(newChild.gradeLevel, 10),
        }),
      });

      const data = await readJson<{ ok: boolean; child: ChildSummary }>(response);
      setNewChild({ name: "", age: "", gradeLevel: "" });
      setActiveChildId(data.child.id);
      await loadDashboardData(data.child.id);
      toast({
        title: "Child added",
        description: `${data.child.name} is ready to use.`,
      });
    } catch (error) {
      handleRequestFailure(error, "Failed to add child");
    } finally {
      setIsAddingChild(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!childToDelete) return;

    const target = childToDelete;
    const fallbackChild = children.find((child) => child.id !== target.id) ?? null;
    setDeletingChildId(target.id);

    try {
      const response = await fetch(`/api/children/${target.id}`, { method: "DELETE" });
      const data = await readJson<{
        ok: boolean;
        message: string;
        deletedWasActive?: boolean;
        activeChild?: ChildSummary | null;
      }>(response);

      const nextActiveChildId = data.activeChild?.id ?? fallbackChild?.id ?? null;

      if (nextActiveChildId && !data.activeChild) {
        await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId: nextActiveChildId }),
        });
      }

      setChildToDelete(null);

      if (nextActiveChildId) {
        setActiveChildId(nextActiveChildId);
        await loadDashboardData(nextActiveChildId);
      } else {
        setChildren([]);
        setActiveChildId(null);
        setChildData(null);
        setSubjectProgress([]);
        setWeeklyActivity([]);
        setRecentSessions([]);
      }

      toast({
        title: "Child deleted",
        description: data.message || `${target.name} has been removed.`,
      });
    } catch (error) {
      handleRequestFailure(error, "Failed to delete child");
    } finally {
      setDeletingChildId(null);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await readJson<{ ok: boolean; settings: ParentSettings }>(response);
      setSettings(data.settings);
      toast({
        title: "Settings saved",
        description: "Session limits were updated successfully.",
      });
    } catch (error) {
      handleRequestFailure(error, "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetData = async () => {
    if (!activeChildId) return;

    setIsResetting(true);

    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: activeChildId, resetType }),
      });

      const data = await readJson<{ ok: boolean; message?: string }>(response);
      setIsResetDialogOpen(false);
      await loadDashboardData(activeChildId);
      toast({
        title: "Data reset",
        description: data.message || "The selected reset action completed successfully.",
      });
    } catch (error) {
      handleRequestFailure(error, "Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };

  const activeChildName =
    childData?.name ?? children.find((child) => child.id === activeChildId)?.name ?? "No child selected";

  const weeklyTime = weeklyActivity.reduce((total, day) => total + day.math + day.english, 0);
  const averageAccuracy =
    subjectProgress.length > 0
      ? Math.round(subjectProgress.reduce((total, subject) => total + subject.accuracy, 0) / subjectProgress.length)
      : 0;
  const topSubject =
    subjectProgress.length > 0
      ? [...subjectProgress].sort((left, right) => right.progress - left.progress)[0]?.subject ?? "None"
      : "None";

  if (authStatus !== "authenticated") {
    const isCheckingAuth = authStatus === "checking";

    return (
      <div className="app-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f7f4ec_0%,#f9fbfc_42%,#eef4f2_100%)] p-4 dark:bg-[linear-gradient(180deg,#081116_0%,#101a21_45%,#111827_100%)] md:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="floating-orb absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-amber-200/45 blur-3xl dark:bg-amber-500/10" />
          <div className="floating-orb absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" style={{ animationDelay: "1.4s" }} />
          <div className="floating-orb absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" style={{ animationDelay: "4s" }} />
        </div>
        <Card className="app-shell panel-elevated relative w-full max-w-lg overflow-hidden rounded-[2.15rem]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/60 bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] text-white shadow-lg shadow-slate-900/10">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <Badge className="mx-auto rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-600 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Parent Workspace
            </Badge>
            <CardTitle className="font-display mt-3 text-3xl text-slate-900 dark:text-slate-50 md:text-4xl">Parent Portal</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              {isCheckingAuth
                ? "Checking your access..."
                : "Enter your password to access the parent dashboard."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border border-white/70 bg-white/65 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Profiles</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Child Ops</div>
              </div>
              <div className="rounded-[1.35rem] border border-white/70 bg-white/65 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Content</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Question Banks</div>
              </div>
              <div className="rounded-[1.35rem] border border-white/70 bg-white/65 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Catalog</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Rewards + Avatar</div>
              </div>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                disabled={isCheckingAuth || isAuthenticating}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isCheckingAuth && !isAuthenticating) {
                    void handleLogin();
                  }
                }}
                className="h-12 rounded-full border-slate-300/70 bg-white/85 pr-10 dark:border-white/10 dark:bg-slate-900/50"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isCheckingAuth || isAuthenticating}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={() => void handleLogin()}
              disabled={isCheckingAuth || isAuthenticating}
              className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200"
            >
              {isCheckingAuth ? "Checking access..." : isAuthenticating ? "Accessing..." : "Access Dashboard"}
            </Button>
            <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/60 px-4 py-3 text-left text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/35 dark:text-slate-300">
              This workspace is designed for calmer review: child switching, content control, catalog management, and session guardrails in one place.
            </div>
            <div className="text-center">
              <Link href="/" className="text-sm text-slate-600 hover:underline dark:text-slate-300">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ParentWorkspaceShell
        currentSection="dashboard"
        title="Parent Dashboard"
        description={`Monitor ${activeChildName} with a calmer operations view for learning progress, session controls, and content management.`}
        icon={<Shield className="h-6 w-6" />}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <ThemeToggle />
            <Button onClick={() => void handleLogout()} variant="outline" className="rounded-full border-red-200/70 bg-white/60 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20">
              Logout
            </Button>
          </>
        }
        metrics={[
          { label: "Active Child", value: activeChildName },
          { label: "Points", value: `${childData?.totalPoints ?? 0}` },
          { label: "Weekly Minutes", value: `${weeklyTime}` },
          { label: "Accuracy", value: `${averageAccuracy}%` },
        ]}
      >
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full border border-white/70 bg-white/72 p-1 shadow-sm dark:border-white/10 dark:bg-slate-950/55">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MotionGroup className="space-y-6">
              <MotionItem>
              <Card className={workspacePanelClass}>
                <CardContent className="p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white">
                          Command Overview
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                          Active child: {activeChildName}
                        </Badge>
                      </div>
                      <h2 className="font-display mt-5 text-3xl font-semibold">
                        Keep the learning system steady while still feeling easy to operate.
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                        Review session data, tune limits, and jump into question or catalog management without leaving the dashboard context.
                      </p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.3rem] border border-white/15 bg-white/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Accuracy</div>
                          <div className="mt-2 text-3xl font-semibold">{averageAccuracy}%</div>
                          <p className="mt-2 text-sm text-white/80">Quick signal for whether difficulty and pacing are aligned.</p>
                        </div>
                        <div className="rounded-[1.3rem] border border-white/15 bg-white/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Top subject</div>
                          <div className="mt-2 text-3xl font-semibold">{formatSubject(topSubject)}</div>
                          <p className="mt-2 text-sm text-white/80">The strongest area currently carrying momentum.</p>
                        </div>
                        <div className="rounded-[1.3rem] border border-white/15 bg-white/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Profiles live</div>
                          <div className="mt-2 text-3xl font-semibold">{children.length}</div>
                          <p className="mt-2 text-sm text-white/80">The number of learners currently managed from this workspace.</p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                          <Link href="/parent/content">
                            Manage Content
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                          <Link href="/parent/catalog">
                            Manage Catalog
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="panel-elevated rounded-[1.5rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/40">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          <Flame className="h-3.5 w-3.5" />
                          Current streak
                        </div>
                        <div className="mt-3 text-3xl font-semibold text-orange-600">{childData?.currentStreak ?? 0} days</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fastest signal for whether learning rhythm is holding.</p>
                      </div>
                      <div className="panel-elevated rounded-[1.5rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/40">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          <Sparkles className="h-3.5 w-3.5" />
                          Weekly load
                        </div>
                        <div className="mt-3 text-3xl font-semibold text-sky-600">{weeklyTime} min</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A quick check for pacing, limits, and consistency over the last week.</p>
                      </div>
                      <div className="panel-elevated rounded-[1.5rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/40 sm:col-span-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Dashboard readiness</div>
                            <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                              {children.length > 0 ? `${children.length} child profile${children.length === 1 ? "" : "s"} active in workspace` : "No child profiles yet"}
                            </div>
                          </div>
                          <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            {loadingDashboard ? "Refreshing" : "Live"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </MotionItem>

              <MotionItem>
              <Card className={workspacePanelClass}>
                <CardHeader>
                  <CardTitle className="font-display text-xl text-slate-900 dark:text-slate-50">Children</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Switch the active child or create a new profile without leaving the dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {children.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        No child profiles yet. Add one below to get started.
                      </p>
                    ) : (
                      children.map((child) => {
                        const isActive = child.id === activeChildId;
                        const isSwitching = switchingChildId === child.id;
                        const isDeleting = deletingChildId === child.id;

                        return (
                          <div key={child.id} className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 p-2 dark:border-white/10 dark:bg-slate-900/40">
                            <Button
                              variant={isActive ? "default" : "outline"}
                              disabled={loadingDashboard || isSwitching || isDeleting}
                              onClick={() => void handleSwitchChild(child.id)}
                              className="min-w-[140px] justify-between rounded-full"
                            >
                              <span>{child.name}</span>
                              {isActive && <Badge variant="secondary" className="ml-2 rounded-full">Active</Badge>}
                            </Button>
                            <Badge variant="outline" className="rounded-full">
                              {formatGradeLabel(child.gradeLevel ?? null)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={isDeleting || loadingDashboard}
                              onClick={() => setChildToDelete(child)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-child-name">Child name</Label>
                      <Input
                        id="new-child-name"
                        value={newChild.name}
                        placeholder="Enter a name"
                        onChange={(event) => setNewChild((prev) => ({ ...prev, name: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-child-age">Age</Label>
                      <Input
                        id="new-child-age"
                        type="number"
                        min={1}
                        value={newChild.age}
                        placeholder="9"
                        onChange={(event) => setNewChild((prev) => ({ ...prev, age: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-child-grade">Grade</Label>
                      <Input
                        id="new-child-grade"
                        type="number"
                        min={0}
                        max={12}
                        value={newChild.gradeLevel}
                        placeholder="4"
                        onChange={(event) => setNewChild((prev) => ({ ...prev, gradeLevel: event.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => void handleAddChild()}
                        disabled={isAddingChild}
                        className="w-full"
                      >
                        {isAddingChild ? "Adding..." : "Add Child"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </MotionItem>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MotionItem>
                <Card className={metricCardClass}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total Points</p>
                        <p className="text-2xl font-bold text-purple-600">{childData?.totalPoints ?? 0}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                </MotionItem>

                <MotionItem>
                <Card className={metricCardClass}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Current Streak</p>
                        <p className="text-2xl font-bold text-orange-600">{childData?.currentStreak ?? 0} days</p>
                      </div>
                      <Target className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                </MotionItem>

                <MotionItem>
                <Card className={metricCardClass}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Average Accuracy</p>
                        <p className="text-2xl font-bold text-green-600">
                          {subjectProgress.length > 0
                            ? Math.round(
                                subjectProgress.reduce((total, subject) => total + subject.accuracy, 0) /
                                  subjectProgress.length,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                </MotionItem>

                <MotionItem>
                <Card className={metricCardClass}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total Sessions</p>
                        <p className="text-2xl font-bold text-blue-600">{recentSessions.length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                </MotionItem>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MotionItem>
                <Card className={workspacePanelClass}>
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-slate-900 dark:text-slate-50">Subject Progress</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {loadingDashboard ? "Refreshing progress..." : "Current progress by subject."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subjectProgress.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">No progress data yet for the selected child.</p>
                    ) : (
                      subjectProgress.map((subject) => (
                        <div key={subject.subject} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900 dark:text-slate-50">{subject.subject}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{subject.sessions} sessions</span>
                            <span>{subject.accuracy}% accuracy</span>
                            <span>{subject.timeSpent} min</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                </MotionItem>

                <MotionItem>
                <Card className={workspacePanelClass}>
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-slate-900 dark:text-slate-50">Weekly Activity</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {weeklyTime > 0
                        ? `${weeklyTime} minutes of learning over the last 7 days.`
                        : "No learning activity recorded in the last 7 days."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {weeklyActivity.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">Weekly activity will appear after learning sessions are logged.</p>
                    ) : (
                      weeklyActivity.map((entry) => (
                        <div key={entry.day} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900 dark:text-slate-50">{entry.day}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{entry.math + entry.english} minutes</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-2xl bg-sky-100/80 px-3 py-2 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                              Math: {entry.math}m
                            </div>
                            <div className="rounded-2xl bg-rose-100/80 px-3 py-2 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                              English: {entry.english}m
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                </MotionItem>
              </div>

              <MotionItem>
              <Card className={workspacePanelClass}>
                <CardHeader>
                  <CardTitle className="font-display text-xl text-slate-900 dark:text-slate-50">Recent Sessions</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Latest completed learning sessions for the active child.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSessions.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">No sessions have been recorded yet.</p>
                    ) : (
                      recentSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-slate-900/40">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              session.subject === "MATH" ? "bg-blue-100" : "bg-pink-100"
                            }`}>
                              {session.subject === "MATH" ? (
                                <Calculator className="w-5 h-5 text-blue-600" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-pink-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-50">
                                {formatSubject(session.subject)} • {session.topic}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                {session.duration} min • {session.questionsCorrect}/{session.questionsAsked} correct
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-600">+{session.pointsEarned} pts</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">{formatDate(session.completedAt)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              </MotionItem>
              </MotionGroup>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className={workspacePanelClass}>
                <CardHeader>
                  <CardTitle className="font-display text-xl text-slate-900 dark:text-slate-50">Session Limits</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Control how much time the active child can spend in learning sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="daily-session-limit">Daily session limit (minutes)</Label>
                      <Input
                        id="daily-session-limit"
                        type="number"
                        min={0}
                        value={settings.maxDailySessionTime}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxDailySessionTime: Number.parseInt(event.target.value, 10) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekly-session-limit">Weekly session limit (minutes)</Label>
                      <Input
                        id="weekly-session-limit"
                        type="number"
                        min={0}
                        value={settings.maxWeeklySessionTime}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxWeeklySessionTime: Number.parseInt(event.target.value, 10) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => void handleSaveSettings()}
                      disabled={isSavingSettings}
                      variant="outline"
                      className="rounded-full border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5"
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      {isSavingSettings ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      <Link href="/parent/content">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Manage Question Content
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <Link href="/parent/catalog">
                        <Star className="w-4 h-4 mr-2" />
                        Manage Catalog
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setIsResetDialogOpen(true)}
                      disabled={!activeChildId || isResetting}
                      variant="outline"
                      className="rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                    >
                      {isResetting ? "Resetting..." : "Reset Data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </ParentWorkspaceShell>

      <AlertDialog
        open={!!childToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingChildId) {
            setChildToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete child profile?</AlertDialogTitle>
            <AlertDialogDescription>
              {childToDelete
                ? `Delete ${childToDelete.name} and all associated learning data. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingChildId}>Cancel</AlertDialogCancel>
            <Button
              onClick={() => void handleDeleteChild()}
              disabled={!!deletingChildId}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletingChildId ? "Deleting..." : "Delete child"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Child Data</DialogTitle>
            <DialogDescription>
              Choose which data to reset for {activeChildName}. This action affects only the active child.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-type">Reset type</Label>
              <Select value={resetType} onValueChange={(value) => setResetType(value as ResetType)}>
                <SelectTrigger id="reset-type" className="w-full">
                  <SelectValue placeholder="Select data to reset" />
                </SelectTrigger>
                <SelectContent>
                  {RESET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {RESET_OPTIONS.find((option) => option.value === resetType)?.description}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleResetData()}
              disabled={!activeChildId || isResetting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isResetting ? "Resetting..." : "Reset selected data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
