"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Settings as SettingsIcon, BarChart3, Clock, Target, BookOpen, Calculator, Palette, Star, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function hashPW(pw: string) {
  if (!pw) return "";
  // Light client-side hash to compare with sha256:hex stored server-side (display only; real security would be server-side). 
  // We won't import crypto in the browser; simulate by simple stable transform and rely on server default if mismatch.
  return `sha256:${pw.split("").reverse().join("")}`; // placeholder visual check; real check will be done by comparing plaintext to default when hash not set
}

export default function ParentDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<any | null>(null);
  const [childData, setChildData] = useState<any | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [newChild, setNewChild] = useState<{ name: string; age: string }>({ name: "", age: "" });
  const { toast } = useToast();

  useEffect(() => {
    // Load settings for authentication + limits
    fetch("/api/settings").then(async (r) => r.json()).then((json) => setSettings(json?.settings || null)).catch(() => {});
    // Check auth cookie
    fetch("/api/parent/login").then(async (r) => r.json()).then((json) => setIsAuthenticated(!!json?.authed)).catch(() => {});
    // Load progress for child + subjects
    fetch("/api/progress").then(async (r) => r.json()).then((json) => {
      const d = json?.data;
      if (d) {
        setChildData({
          name: d.child?.name ?? "Child",
          age: d.child?.age ?? 0,
          totalPoints: d.child?.totalPoints ?? 0,
          currentStreak: d.child?.currentStreak ?? 0,
          longestStreak: d.child?.longestStreak ?? 0,
          accuracy: d.totals?.averageAccuracy ?? 0,
          totalSessions: d.totals?.totalSessions ?? 0,
          weeklySessions: 0,
          weeklyTime: 0,
          avatarLevel: 3,
          unlockedItems: 12,
        });
        setSubjectProgress(d.subjects || []);
        setRecentSessions(d.recent || []);
      }
    }).catch(() => {});
    fetch("/api/children").then(async (r) => r.json()).then((json) => setChildren((json?.children || []).map((c: any) => ({ id: c.id, name: c.name }))));
  }, []);

  const handleLogin = async () => {
    try {
      const resp = await fetch("/api/parent/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (resp.ok) {
        setIsAuthenticated(true);
      } else {
        alert("Incorrect password");
      }
    } catch {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/logout", { method: "POST" });
      setIsAuthenticated(false);
      setPassword("");
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    } catch {
      toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" as any });
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...(prev || {}), [key]: value }));
  };

  const saveSettings = async () => {
    try {
      const r = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (!r.ok) throw new Error("Failed");
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
    } catch {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" as any });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Parent Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your password to access the parent dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="pr-10 w-full border rounded-md p-2"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold">
              Access Dashboard
            </Button>
            <div className="text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="border-blue-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
                          <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Parent Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Monitor {childData?.name ?? "Child"}'s progress and manage settings</p>
            </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Child switcher + create */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Children</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Switch active child or add another</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <div key={c.id} className="flex gap-1">
                      <Button variant="outline" onClick={async () => { 
                        try {
                          const res = await fetch("/api/children", { 
                            method: "POST", 
                            headers: { "Content-Type": "application/json" }, 
                            body: JSON.stringify({ childId: c.id }) 
                          });
                          if (res.ok) {
                            toast({ title: "Child switched", description: `Now viewing ${c.name}'s progress.` });
                            location.reload();
                          } else {
                            toast({ title: "Failed to switch child", description: "Please try again.", variant: "destructive" as any });
                          }
                        } catch {
                          toast({ title: "Failed to switch child", description: "Please try again.", variant: "destructive" as any });
                        }
                      }}>{c.name}</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          if (!confirm(`Delete ${c.name} and all their data? This cannot be undone.`)) return;
                          try {
                            const res = await fetch(`/api/children/${c.id}`, { method: "DELETE" });
                            if (res.ok) {
                              toast({ title: "Child deleted", description: `${c.name} has been removed.` });
                              location.reload();
                            } else {
                              toast({ title: "Failed to delete", description: "Please try again.", variant: "destructive" as any });
                            }
                          } catch {
                            toast({ title: "Failed to delete", description: "Please try again.", variant: "destructive" as any });
                          }
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                  <input placeholder="New child name" value={newChild.name} onChange={(e) => setNewChild({ ...newChild, name: e.target.value })} className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                  <input placeholder="Age" type="number" value={newChild.age} onChange={(e) => setNewChild({ ...newChild, age: e.target.value })} className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                  <Button onClick={async () => { 
                    if (!newChild.name) {
                      toast({ title: "Name required", description: "Please enter a child's name.", variant: "destructive" as any });
                      return;
                    }
                    try {
                      const res = await fetch("/api/children", { 
                        method: "POST", 
                        headers: { "Content-Type": "application/json" }, 
                        body: JSON.stringify({ name: newChild.name, age: parseInt(newChild.age || '0', 10) }) 
                      });
                      if (res.ok) {
                        toast({ title: "Child added", description: `${newChild.name} has been added successfully.` });
                        setNewChild({ name: "", age: "" });
                        location.reload();
                      } else {
                        toast({ title: "Failed to add child", description: "Please try again.", variant: "destructive" as any });
                      }
                    } catch {
                      toast({ title: "Failed to add child", description: "Please try again.", variant: "destructive" as any });
                    }
                  }}>Add Child</Button>
                </div>
              </CardContent>
            </Card>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="text-2xl font-bold text-purple-600">{childData?.totalPoints ?? 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">{childData?.currentStreak ?? 0} days 🔥</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{childData?.accuracy ?? 0}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-blue-600">{childData?.totalSessions ?? 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Subject Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjectProgress.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{subject.subject}</span>
                        <span className="text-sm text-gray-600">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{subject.sessions} sessions</span>
                        <span>{subject.accuracy}% accuracy</span>
                        <span>{subject.timeSpent} min</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Use recent sessions as a simple activity list */}
                    {recentSessions.slice(0, 7).map((s, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium text-gray-600">{new Date(s.completedAt).toLocaleDateString()}</div>
                        <div className="flex-1 flex gap-2">
                          <div className={`flex-1 ${s.subject === 'MATH' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'} rounded px-2 py-1 text-xs text-center`}>
                            {s.subject === 'MATH' ? 'Math' : 'English'}: {s.duration}m
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.subject === 'MATH' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                          {session.subject === 'MATH' ? 
                            <Calculator className="w-5 h-5 text-blue-600" /> : 
                            <BookOpen className="w-5 h-5 text-pink-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{session.subject === 'MATH' ? 'Math' : 'English'} - {session.topic}</div>
                          <div className="text-sm text-gray-600">
                            {session.duration} min • {session.questions} questions • {session.questionsCorrect}/{session.questionsAsked} correct
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">+{session.pointsEarned} pts</div>
                        <div className="text-sm text-gray-600">{new Date(session.completedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Session Limits</CardTitle>
                  <CardDescription className="text-gray-600">
                    Control how much time your child can spend learning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Daily Session Limit (minutes)</label>
                    <input type="number" value={settings?.maxDailySessionTime ?? 60} onChange={(e) => updateSetting("maxDailySessionTime", parseInt(e.target.value))} className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly Session Limit (minutes)</label>
                    <input type="number" value={settings?.maxWeeklySessionTime ?? 300} onChange={(e) => updateSetting("maxWeeklySessionTime", parseInt(e.target.value))} className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSettings} variant="outline" className="border-blue-200">
                      <SettingsIcon className="w-4 h-4 mr-2" /> Save Settings
                    </Button>
                    <Button onClick={async () => { 
                      const resetType = await new Promise<string>((resolve) => {
                        const dialog = document.createElement('div');
                        dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        dialog.innerHTML = `
                          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 class="text-lg font-semibold mb-4">Select Reset Type</h3>
                            <div class="space-y-2">
                              <button class="w-full text-left p-2 hover:bg-gray-100 rounded" data-type="all">All Data (Complete Reset)</button>
                              <button class="w-full text-left p-2 hover:bg-gray-100 rounded" data-type="sessions">Learning Sessions Only</button>
                              <button class="w-full text-left p-2 hover:bg-gray-100 rounded" data-type="progress">Progress Data Only</button>
                              <button class="w-full text-left p-2 hover:bg-gray-100 rounded" data-type="rewards">Reward History Only</button>
                              <button class="w-full text-left p-2 hover:bg-gray-100 rounded" data-type="points">Points & Streak Only</button>
                            </div>
                            <div class="flex gap-2 mt-4">
                              <button class="flex-1 px-4 py-2 text-gray-600 border rounded hover:bg-gray-50" onclick="this.closest('.fixed').remove()">Cancel</button>
                            </div>
                          </div>
                        `;
                        
                        dialog.addEventListener('click', (e) => {
                          const target = e.target as HTMLElement;
                          if (target.dataset.type) {
                            resolve(target.dataset.type);
                            dialog.remove();
                          }
                        });
                        
                        document.body.appendChild(dialog);
                      });
                      
                      if (!resetType) return;
                      
                      if (!confirm(`Reset ${resetType === 'all' ? 'all data' : resetType} for the active child? This cannot be undone.`)) return;
                      
                      try {
                        const res = await fetch('/api/admin/reset', { 
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ resetType })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          toast({ title: 'Data reset', description: data.message || 'Reset completed successfully.' });
                          location.reload();
                        } else {
                          toast({ title: 'Reset failed', description: 'Please try again.', variant: 'destructive' as any });
                        }
                      } catch {
                        toast({ title: 'Reset failed', description: 'Please try again.', variant: 'destructive' as any });
                      }
                    }} variant="outline" className="border-red-200 text-red-600">
                      Reset Data
                    </Button>

                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}