"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, TrendingUp, Trophy, Target, Clock, Star, BookOpen, Calculator, Calendar, Award } from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/progress").then(async (r) => r.json()).then((json) => {
      setData(json?.data || null);
    }).finally(() => setLoading(false));
  }, []);

  const subjects = data?.subjects || [];
  const totals = data?.totals || { totalSessions: 0, totalTime: 0, averageAccuracy: 0 };
  const weekly = data?.weekly || [];
  const recent = data?.recent || [];

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
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
                      <p className="text-2xl font-bold text-indigo-600">{totals.totalSessions}</p>
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
                      <p className="text-2xl font-bold text-purple-600">{Math.floor((totals.totalTime || 0) / 60)}h {(totals.totalTime || 0) % 60}m</p>
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
                      <p className="text-2xl font-bold text-green-600">{totals.averageAccuracy}%</p>
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
                      <p className="text-2xl font-bold text-orange-600">{data?.child?.currentStreak ?? 0} days 🔥</p>
                    </div>
                    <Trophy className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Weekly Progress</CardTitle>
                <CardDescription className="text-gray-600">Your learning time over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekly.map((w: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{w.day}</span>
                        <span className="text-sm text-gray-600">{(w.total || (w.math + w.english))} minutes</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Math: {w.math}m</span>
                            <span>{Math.round(((w.math || 0) / 120) * 100)}%</span>
                          </div>
                          <Progress value={((w.math || 0) / 120) * 100} className="h-2" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>English: {w.english}m</span>
                            <span>{Math.round(((w.english || 0) / 120) * 100)}%</span>
                          </div>
                          <Progress value={((w.english || 0) / 120) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements (placeholder retained) */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.recent || []).slice(0,2).map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{s.subject === 'MATH' ? 'Great Math Session' : 'Great English Session'}</div>
                        <div className="text-sm text-gray-600">{s.pointsEarned} points • {s.questionsCorrect}/{s.questionsAsked} correct</div>
                        <div className="text-xs text-gray-500">{formatDate(s.completedAt)}</div>
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
              {subjects.map((subject: any) => (
                <Card key={subject.subject} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${subject.subject === 'Math' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                          {subject.subject === 'Math' ? <Calculator className="w-6 h-6 text-blue-600" /> : <BookOpen className="w-6 h-6 text-pink-600" />}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800">{subject.subject}</CardTitle>
                          {subject.lastSession && (
                            <CardDescription className="text-gray-600">Last session: {formatDate(subject.lastSession)}</CardDescription>
                          )}
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
                        <div className={`text-lg font-bold ${getProgressColor(subject.accuracy)}`}>{subject.accuracy}%</div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{subject.timeSpent}m</div>
                        <div className="text-xs text-gray-600">Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  In Progress
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Recent sessions indicate your current streak and progression.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(recent || []).slice(0,3).map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl opacity-60">⭐</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{s.subject === 'MATH' ? 'Math' : 'English'} • {s.topic}</div>
                        <div className="text-sm text-gray-600">{s.duration}m • {s.questionsCorrect}/{s.questionsAsked} correct</div>
                        <div className="text-xs text-gray-500">{formatDate(s.completedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Learning History</CardTitle>
                <CardDescription className="text-gray-600">Your complete learning session history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(recent || []).map((session: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${session.subject === 'MATH' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                          {session.subject === 'MATH' ? <Calculator className="w-6 h-6 text-blue-600" /> : <BookOpen className="w-6 h-6 text-pink-600" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{session.subject === 'MATH' ? 'Math' : 'English'} - {session.topic}</div>
                          <div className="text-sm text-gray-600">{session.duration} minutes • {formatDate(session.completedAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">Accuracy:</span>
                          <span className={`font-semibold ${((session.questionsCorrect / Math.max(1, session.questionsAsked)) >= 0.8) ? 'text-green-600' : ((session.questionsCorrect / Math.max(1, session.questionsAsked)) >= 0.6) ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round((session.questionsCorrect / Math.max(1, session.questionsAsked)) * 100)}%
                          </span>
                        </div>
                        <div className="font-semibold text-purple-600">+{session.pointsEarned} points</div>
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