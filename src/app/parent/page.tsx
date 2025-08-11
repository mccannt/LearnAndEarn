"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Settings, BarChart3, Clock, Target, BookOpen, Calculator, Palette, Star, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ParentDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    maxDailySessionTime: 60,
    maxWeeklySessionTime: 300,
    pointsPerScreenTime: 10,
    pointsPerRobux: 100,
    sessionDifficulty: "medium",
    passwordProtected: true,
    parentPassword: "parent123" // In a real app, this would be hashed
  });

  // Mock data
  const childData = {
    name: "Emma",
    age: 9,
    totalPoints: 150,
    currentStreak: 5,
    longestStreak: 12,
    accuracy: 85,
    totalSessions: 24,
    weeklySessions: 5,
    weeklyTime: 85,
    avatarLevel: 3,
    unlockedItems: 12
  };

  const subjectProgress = [
    { subject: "Math", progress: 65, accuracy: 82, sessions: 12, timeSpent: 180 },
    { subject: "English", progress: 45, accuracy: 78, sessions: 8, timeSpent: 120 },
    { subject: "Reading", progress: 75, accuracy: 88, sessions: 4, timeSpent: 60 }
  ];

  const recentSessions = [
    { id: 1, subject: "Math", topic: "Multiplication", date: "2024-01-15", duration: 15, questions: 10, correct: 8, points: 85 },
    { id: 2, subject: "English", topic: "Grammar", date: "2024-01-14", duration: 20, questions: 8, correct: 6, points: 90 },
    { id: 3, subject: "Math", topic: "Division", date: "2024-01-13", duration: 12, questions: 8, correct: 7, points: 75 },
    { id: 4, subject: "English", topic: "Vocabulary", date: "2024-01-12", duration: 18, questions: 10, correct: 9, points: 105 }
  ];

  const weeklyActivity = [
    { day: "Mon", math: 15, english: 0 },
    { day: "Tue", math: 0, english: 20 },
    { day: "Wed", math: 12, english: 0 },
    { day: "Thu", math: 0, english: 15 },
    { day: "Fri", math: 18, english: 0 },
    { day: "Sat", math: 0, english: 0 },
    { day: "Sun", math: 25, english: 20 }
  ];

  const handleLogin = () => {
    if (password === settings.parentPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="pr-10"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
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
                <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
                <p className="text-gray-600">Monitor {childData.name}'s progress and manage settings</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            Logout
          </Button>
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="text-2xl font-bold text-purple-600">{childData.totalPoints}</p>
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
                      <p className="text-2xl font-bold text-orange-600">{childData.currentStreak} days 🔥</p>
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
                      <p className="text-2xl font-bold text-green-600">{childData.accuracy}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-blue-600">{childData.weeklySessions} sessions</p>
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
                    {weeklyActivity.map((day) => (
                      <div key={day.day} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                        <div className="flex-1 flex gap-2">
                          {day.math > 0 && (
                            <div className="flex-1 bg-blue-100 rounded px-2 py-1 text-xs text-blue-700 text-center">
                              Math: {day.math}m
                            </div>
                          )}
                          {day.english > 0 && (
                            <div className="flex-1 bg-pink-100 rounded px-2 py-1 text-xs text-pink-700 text-center">
                              English: {day.english}m
                            </div>
                          )}
                          {day.math === 0 && day.english === 0 && (
                            <div className="flex-1 text-center text-xs text-gray-400">
                              No activity
                            </div>
                          )}
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
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.subject === "Math" ? "bg-blue-100" : "bg-pink-100"
                        }`}>
                          {session.subject === "Math" ? 
                            <Calculator className="w-5 h-5 text-blue-600" /> : 
                            <BookOpen className="w-5 h-5 text-pink-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{session.subject} - {session.topic}</div>
                          <div className="text-sm text-gray-600">
                            {session.duration} min • {session.questions} questions • {session.correct}/{session.questions} correct
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">+{session.points} pts</div>
                        <div className="text-sm text-gray-600">{session.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Learning Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">Level 3</div>
                    <div className="text-sm text-gray-600">Current Learning Level</div>
                    <Progress value={65} className="mt-2 h-3" />
                    <div className="text-xs text-gray-500 mt-1">65% to Level 4</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{childData.totalSessions}</div>
                      <div className="text-xs text-gray-600">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{childData.weeklyTime}</div>
                      <div className="text-xs text-gray-600">Minutes This Week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          🏆
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">First Week Complete</div>
                          <div className="text-sm text-gray-600">Finished first week of learning</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Earned
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          🔥
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">On Fire!</div>
                          <div className="text-sm text-gray-600">5 day learning streak</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          ⭐
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">Math Master</div>
                          <div className="text-sm text-gray-600">Scored 90%+ in math</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Earned
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          👑
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">Avatar Collector</div>
                          <div className="text-sm text-gray-600">Unlock 20 avatar items</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        12/20
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">All Learning Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          session.subject === "Math" ? "bg-blue-100" : "bg-pink-100"
                        }`}>
                          {session.subject === "Math" ? 
                            <Calculator className="w-6 h-6 text-blue-600" /> : 
                            <BookOpen className="w-6 h-6 text-pink-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{session.subject} - {session.topic}</div>
                          <div className="text-sm text-gray-600">
                            {session.duration} minutes • {session.questions} questions
                          </div>
                          <div className="text-xs text-gray-500">{session.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">Accuracy:</span>
                          <span className={`font-semibold ${
                            (session.correct / session.questions) >= 0.8 ? "text-green-600" : 
                            (session.correct / session.questions) >= 0.6 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {Math.round((session.correct / session.questions) * 100)}%
                          </span>
                        </div>
                        <div className="font-semibold text-purple-600">+{session.points} points</div>
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
                    Control how much time {childData.name} can spend learning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Session Limit (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.maxDailySessionTime}
                      onChange={(e) => updateSetting("maxDailySessionTime", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Session Limit (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.maxWeeklySessionTime}
                      onChange={(e) => updateSetting("maxWeeklySessionTime", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>This week:</strong> {childData.weeklyTime} / {settings.maxWeeklySessionTime} minutes used
                    </div>
                    <Progress value={(childData.weeklyTime / settings.maxWeeklySessionTime) * 100} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Reward Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure how points convert to rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points per Minute of Screen Time
                    </label>
                    <Input
                      type="number"
                      value={settings.pointsPerScreenTime}
                      onChange={(e) => updateSetting("pointsPerScreenTime", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Current: {childData.totalPoints} points = {Math.floor(childData.totalPoints / settings.pointsPerScreenTime)} minutes
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points per Robux
                    </label>
                    <Input
                      type="number"
                      value={settings.pointsPerRobux}
                      onChange={(e) => updateSetting("pointsPerRobux", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Current: {childData.totalPoints} points = {Math.floor(childData.totalPoints / settings.pointsPerRobux)} Robux
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Learning Preferences</CardTitle>
                  <CardDescription className="text-gray-600">
                    Adjust difficulty and other settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Difficulty
                    </label>
                    <select
                      value={settings.sessionDifficulty}
                      onChange={(e) => updateSetting("sessionDifficulty", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Password Protection</div>
                      <div className="text-xs text-gray-500">Require password for parent access</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.passwordProtected}
                      onChange={(e) => updateSetting("passwordProtected", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Account Management</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Parent Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      onChange={(e) => updateSetting("parentPassword", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                    Export Learning Data
                  </Button>
                  
                  <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50">
                    Reset All Progress
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}