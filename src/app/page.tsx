"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calculator, Palette, Trophy, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { SafeHydrated } from "@/components/SafeHydrated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const [activeUser, setActiveUser] = useState("child"); // "child" or "parent"
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [activeChildId, setActiveChildId] = useState<string | undefined>(undefined);
  const [totals, setTotals] = useState<{ points: number; streak: number; accuracy: number }>({ points: 0, streak: 0, accuracy: 0 });
  const [subjectProgress, setSubjectProgress] = useState<{ math: number; english: number }>({ math: 0, english: 0 });
  const [recent, setRecent] = useState<Array<{ id: string; subject: string; topic: string; duration: number; pointsEarned: number; completedAt: string }>>([]);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      const json = await res.json();
      const data = json?.data;
      if (data?.child) {
        setActiveChildId(data.child.id);
        setTotals({ points: data.child.totalPoints ?? 0, streak: data.child.currentStreak ?? 0, accuracy: data.totals?.averageAccuracy ?? 0 });
        const math = (data.subjects || []).find((s: any) => s.subject === "Math")?.progress ?? 0;
        const english = (data.subjects || []).find((s: any) => s.subject === "English")?.progress ?? 0;
        setSubjectProgress({ math, english });
      }
      // also fetch recent sessions
      const s = await fetch("/api/sessions", { cache: "no-store" });
      const sj = await s.json();
      setRecent((sj?.sessions || []).slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/children", { cache: "no-store" });
      const json = await res.json();
      setChildren((json?.children || []).map((c: any) => ({ id: c.id, name: c.name })));
    } catch {}
  };

  useEffect(() => {
    fetchProgress();
    fetchChildren();
  }, []);

  const onSelectChild = async (childId: string) => {
    try {
      setActiveChildId(childId);
      await fetch("/api/children", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId }) });
      await fetchProgress();
      toast({ title: "Switched child", description: "Active child updated." });
    } catch {
      toast({ title: "Failed to switch", description: "Please try again.", variant: "destructive" as any });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 smooth-scroll">
      <div className="max-w-6xl mx-auto tablet-container">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 card-animate">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center btn-hover">
              <SafeHydrated>
                <BookOpen className="w-6 h-6 text-white" />
              </SafeHydrated>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-title-responsive">Learn & Earn</h1>
              <p className="text-gray-600 dark:text-gray-300 text-responsive">Learn math and English, earn rewards!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Child Selector */}
            <div className="block min-w-[180px]">
              <Select value={activeChildId} onValueChange={onSelectChild}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="dark:hover:bg-gray-700">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={activeUser === "child" ? "default" : "outline"}
                onClick={() => setActiveUser("child")}
                className="flex items-center gap-2 touch-target btn-hover dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <SafeHydrated>
                  <User className="w-4 h-4" />
                </SafeHydrated>
                Child View
              </Button>
              <Button 
                variant={activeUser === "parent" ? "default" : "outline"}
                onClick={() => setActiveUser("parent")}
                className="flex items-center gap-2 touch-target btn-hover dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <SafeHydrated>
                  <Settings className="w-4 h-4" />
                </SafeHydrated>
                Parent Portal
              </Button>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Child View */}
        {activeUser === "child" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg card-animate card-hover">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Welcome back, Learner! 👋</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {loading ? "Loading your progress..." : "Ready to learn and earn some rewards today?"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{totals.points}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Learning Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{totals.streak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Day Streak 🔥</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totals.accuracy}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Math Module */}
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl card-hover transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <SafeHydrated>
                      <Calculator className="w-8 h-8" />
                    </SafeHydrated>
                    <Badge variant="secondary" className="bg-white/20 text-white dark:bg-gray-700/50">Math</Badge>
                  </div>
                  <CardTitle className="text-xl">Math Adventure</CardTitle>
                  <CardDescription className="text-blue-100">
                    Master multiplication and division
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="dark:text-gray-300">Progress</span>
                        <span className="dark:text-gray-300">{subjectProgress.math}%</span>
                      </div>
                      <Progress value={subjectProgress.math} className="h-2 bg-white/20 progress-animate dark:bg-gray-700/50" />
                    </div>
                    <Link href="/math">
                      <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target btn-hover dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600">
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* English Module */}
              <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-xl card-hover transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <SafeHydrated>
                      <BookOpen className="w-8 h-8" />
                    </SafeHydrated>
                    <Badge variant="secondary" className="bg-white/20 text-white dark:bg-gray-700/50">English</Badge>
                  </div>
                  <CardTitle className="text-xl">English Explorer</CardTitle>
                  <CardDescription className="text-pink-100">
                    Improve grammar and reading comprehension
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="dark:text-gray-300">Progress</span>
                        <span className="dark:text-gray-300">{subjectProgress.english}%</span>
                      </div>
                      <Progress value={subjectProgress.english} className="h-2 bg-white/20 progress-animate dark:bg-gray-700/50" />
                    </div>
                    <Link href="/english">
                      <Button className="w-full bg-white text-pink-600 hover:bg-gray-100 font-semibold touch-target btn-hover dark:bg-gray-700 dark:text-pink-300 dark:hover:bg-gray-600">
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Avatar Customization */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg card-animate card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <SafeHydrated>
                    <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </SafeHydrated>
                  <CardTitle className="text-xl text-gray-800 dark:text-white">Customize Your Avatar</CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Dress up your avatar with your earned rewards!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Your Avatar</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Level 3 • 12 items unlocked</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast({ title: "Customizing Avatar", description: "Redirecting to avatar studio..." });
                      router.push("/avatar");
                    }}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 touch-target btn-hover dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900 dark:hover:text-white"
                  >
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg card-animate">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Latest learning sessions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recent.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.subject === 'MATH' ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-pink-100 dark:bg-pink-800/50'}`}>
                          {r.subject === 'MATH' ? (
                            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-pink-600 dark:text-pink-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white text-sm">{r.subject === 'MATH' ? 'Math' : 'English'} • {r.topic}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">{r.duration} min • {new Date(r.completedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600 text-sm dark:text-purple-300">+{r.pointsEarned} pts</div>
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No sessions yet. Start learning to see activity here.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Parent View */}
        {activeUser === "parent" && (
          <div className="space-y-8">
            {/* Parent Dashboard */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-animate">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Parent Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitor progress and manage settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totals.points}</div>
                    <div className="text-sm text-gray-600">Total Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{subjectProgress.math + subjectProgress.english > 0 ? Math.floor((subjectProgress.math + subjectProgress.english) / 100 * 20) : 0}</div>
                    <div className="text-sm text-gray-600">Sessions (est.)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totals.accuracy}%</div>
                    <div className="text-sm text-gray-600">Average Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{totals.streak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-hover">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Progress Reports</CardTitle>
                  <CardDescription className="text-gray-600">
                    View detailed progress and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/progress">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 touch-target btn-hover">
                      View Reports
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-hover">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Session Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Set time limits and session durations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/parent">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 touch-target btn-hover">
                      Configure Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-hover">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Reward Management</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage rewards and redemption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/parent">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 touch-target btn-hover">
                      Manage Rewards
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}