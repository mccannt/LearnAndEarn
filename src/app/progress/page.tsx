"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, TrendingUp, Trophy, Target, Clock, Star, BookOpen, Calculator, Calendar, Award } from "lucide-react";
import Link from "next/link";

interface ProgressData {
  subject: string;
  progress: number;
  accuracy: number;
  sessions: number;
  timeSpent: number;
  lastSession: string;
}

interface WeeklyData {
  week: string;
  math: number;
  english: number;
  total: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
  progress?: number;
}

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month");

  // Mock progress data
  const subjectProgress: ProgressData[] = [
    { subject: "Math", progress: 65, accuracy: 82, sessions: 12, timeSpent: 180, lastSession: "2024-01-15" },
    { subject: "English", progress: 45, accuracy: 78, sessions: 8, timeSpent: 120, lastSession: "2024-01-14" },
    { subject: "Reading", progress: 75, accuracy: 88, sessions: 4, timeSpent: 60, lastSession: "2024-01-12" }
  ];

  const weeklyProgress: WeeklyData[] = [
    { week: "Week 1", math: 45, english: 30, total: 75 },
    { week: "Week 2", math: 60, english: 45, total: 105 },
    { week: "Week 3", math: 75, english: 60, total: 135 },
    { week: "Week 4", math: 90, english: 75, total: 165 }
  ];

  const achievements: Achievement[] = [
    { id: "first_session", title: "First Steps", description: "Complete your first learning session", icon: "🎯", earned: true, date: "2024-01-01" },
    { id: "week_streak", title: "Week Warrior", description: "Learn for 7 days in a row", icon: "🔥", earned: true, date: "2024-01-07" },
    { id: "math_master", title: "Math Master", description: "Score 90%+ in 10 math sessions", icon: "🧮", earned: true, date: "2024-01-10" },
    { id: "english_expert", title: "English Expert", description: "Score 90%+ in 10 english sessions", icon: "📚", earned: false, progress: 60 },
    { id: "time_champion", title: "Time Champion", description: "Spend 10 hours learning", icon: "⏰", earned: false, progress: 75 },
    { id: "perfect_week", title: "Perfect Week", description: "100% accuracy for a week", icon: "💯", earned: false, progress: 30 },
    { id: "avatar_collector", title: "Avatar Collector", description: "Unlock 20 avatar items", icon: "👗", earned: false, progress: 60 },
    { id: "point_master", title: "Point Master", description: "Earn 1000 points", icon: "⭐", earned: false, progress: 15 }
  ];

  const learningStats = {
    totalSessions: 24,
    totalTime: 360, // minutes
    totalPoints: 150,
    currentStreak: 5,
    longestStreak: 12,
    averageAccuracy: 85,
    favoriteSubject: "Math"
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return "bg-green-100";
    if (progress >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && a.progress !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="border-indigo-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Progress & Statistics</h1>
                <p className="text-gray-600">Track your learning journey and achievements</p>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-indigo-600">{learningStats.totalSessions}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Time Spent</p>
                      <p className="text-2xl font-bold text-purple-600">{Math.floor(learningStats.totalTime / 60)}h {learningStats.totalTime % 60}m</p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{learningStats.averageAccuracy}%</p>
                    </div>
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">{learningStats.currentStreak} days 🔥</p>
                    </div>
                    <Trophy className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Weekly Progress</CardTitle>
                <CardDescription className="text-gray-600">
                  Your learning time over the past few weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyProgress.map((week) => (
                    <div key={week.week} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{week.week}</span>
                        <span className="text-sm text-gray-600">{week.total} minutes</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Math: {week.math}m</span>
                            <span>{Math.round((week.math / 120) * 100)}%</span>
                          </div>
                          <Progress value={(week.math / 120) * 100} className="h-2" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>English: {week.english}m</span>
                            <span>{Math.round((week.english / 120) * 100)}%</span>
                          </div>
                          <Progress value={(week.english / 120) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnedAchievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        <div className="text-xs text-gray-500">{formatDate(achievement.date!)}</div>
                      </div>
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjectProgress.map((subject) => (
                <Card key={subject.subject} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          subject.subject === "Math" ? "bg-blue-100" : 
                          subject.subject === "English" ? "bg-pink-100" : "bg-green-100"
                        }`}>
                          {subject.subject === "Math" ? 
                            <Calculator className="w-6 h-6 text-blue-600" /> : 
                            subject.subject === "English" ? 
                            <BookOpen className="w-6 h-6 text-pink-600" /> :
                            <BookOpen className="w-6 h-6 text-green-600" />
                          }
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800">{subject.subject}</CardTitle>
                          <CardDescription className="text-gray-600">
                            Last session: {formatDate(subject.lastSession)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`${getProgressBgColor(subject.progress)} ${getProgressColor(subject.progress)}`}>
                        {subject.progress}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{subject.sessions}</div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getProgressColor(subject.accuracy)}`}>
                          {subject.accuracy}%
                        </div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{subject.timeSpent}m</div>
                        <div className="text-xs text-gray-600">Time</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-sm text-gray-600 mb-2">Strengths:</div>
                      <div className="flex flex-wrap gap-2">
                        {subject.subject === "Math" && (
                          <>
                            <Badge variant="outline" className="border-blue-200 text-blue-600">Multiplication</Badge>
                            <Badge variant="outline" className="border-blue-200 text-blue-600">Problem Solving</Badge>
                          </>
                        )}
                        {subject.subject === "English" && (
                          <>
                            <Badge variant="outline" className="border-pink-200 text-pink-600">Grammar</Badge>
                            <Badge variant="outline" className="border-pink-200 text-pink-600">Vocabulary</Badge>
                          </>
                        )}
                        {subject.subject === "Reading" && (
                          <>
                            <Badge variant="outline" className="border-green-200 text-green-600">Comprehension</Badge>
                            <Badge variant="outline" className="border-green-200 text-green-600">Speed Reading</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earned Achievements */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Earned Achievements
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {earnedAchievements.length} achievements unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {earnedAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                          <div className="text-xs text-gray-500">Earned on {formatDate(achievement.date!)}</div>
                        </div>
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* In Progress Achievements */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    In Progress
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {inProgressAchievements.length} achievements in progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inProgressAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl opacity-60">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Achievement Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{earnedAchievements.length}</div>
                    <div className="text-sm text-gray-600">Earned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{achievements.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((earnedAchievements.length / achievements.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Completion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Learning History</CardTitle>
                <CardDescription className="text-gray-600">
                  Your complete learning session history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock history data */}
                  {[
                    { date: "2024-01-15", subject: "Math", topic: "Multiplication", duration: 15, accuracy: 80, points: 85 },
                    { date: "2024-01-14", subject: "English", topic: "Grammar", duration: 20, accuracy: 75, points: 90 },
                    { date: "2024-01-13", subject: "Math", topic: "Division", duration: 12, accuracy: 88, points: 75 },
                    { date: "2024-01-12", subject: "English", topic: "Vocabulary", duration: 18, accuracy: 90, points: 105 },
                    { date: "2024-01-11", subject: "Math", topic: "Multiplication", duration: 15, accuracy: 85, points: 80 },
                    { date: "2024-01-10", subject: "Reading", topic: "Comprehension", duration: 25, accuracy: 92, points: 120 }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          session.subject === "Math" ? "bg-blue-100" : 
                          session.subject === "English" ? "bg-pink-100" : "bg-green-100"
                        }`}>
                          {session.subject === "Math" ? 
                            <Calculator className="w-6 h-6 text-blue-600" /> : 
                            session.subject === "English" ? 
                            <BookOpen className="w-6 h-6 text-pink-600" /> :
                            <BookOpen className="w-6 h-6 text-green-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{session.subject} - {session.topic}</div>
                          <div className="text-sm text-gray-600">
                            {session.duration} minutes • {formatDate(session.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">Accuracy:</span>
                          <span className={`font-semibold ${
                            session.accuracy >= 80 ? "text-green-600" : 
                            session.accuracy >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {session.accuracy}%
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
        </Tabs>
      </div>
    </div>
  );
}