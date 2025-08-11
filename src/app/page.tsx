"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calculator, Palette, Trophy, Settings, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [activeUser, setActiveUser] = useState("child"); // "child" or "parent"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8 smooth-scroll">
      <div className="max-w-6xl mx-auto tablet-container">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 card-animate">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center btn-hover">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-title-responsive">Learn & Earn</h1>
              <p className="text-gray-600 text-responsive">Learn math and English, earn rewards!</p>
            </div>
          </div>
          
          {/* User Toggle */}
          <div className="flex gap-2">
            <Button 
              variant={activeUser === "child" ? "default" : "outline"}
              onClick={() => setActiveUser("child")}
              className="flex items-center gap-2 touch-target btn-hover"
            >
              <User className="w-4 h-4" />
              Child View
            </Button>
            <Button 
              variant={activeUser === "parent" ? "default" : "outline"}
              onClick={() => setActiveUser("parent")}
              className="flex items-center gap-2 touch-target btn-hover"
            >
              <Settings className="w-4 h-4" />
              Parent Portal
            </Button>
          </div>
        </header>

        {/* Child View */}
        {activeUser === "child" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-animate card-hover">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Welcome back, Learner! 👋</CardTitle>
                <CardDescription className="text-gray-600">
                  Ready to learn and earn some rewards today?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">150</div>
                    <div className="text-sm text-gray-600">Learning Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">5</div>
                    <div className="text-sm text-gray-600">Day Streak 🔥</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
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
                    <Calculator className="w-8 h-8" />
                    <Badge variant="secondary" className="bg-white/20 text-white">Math</Badge>
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
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2 bg-white/20 progress-animate" />
                    </div>
                    <Link href="/math">
                      <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target btn-hover">
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
                    <BookOpen className="w-8 h-8" />
                    <Badge variant="secondary" className="bg-white/20 text-white">English</Badge>
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
                        <span>Progress</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2 bg-white/20 progress-animate" />
                    </div>
                    <Link href="/english">
                      <Button className="w-full bg-white text-pink-600 hover:bg-gray-100 font-semibold touch-target btn-hover">
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Avatar Customization */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-animate card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-xl text-gray-800">Customize Your Avatar</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Dress up your avatar with your earned rewards!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Your Avatar</div>
                      <div className="text-sm text-gray-600">Level 3 • 12 items unlocked</div>
                    </div>
                  </div>
                  <Link href="/avatar">
                    <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 touch-target btn-hover">
                      Customize
                    </Button>
                  </Link>
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
                    <div className="text-2xl font-bold text-purple-600">150</div>
                    <div className="text-sm text-gray-600">Total Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Average Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">5</div>
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

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg card-animate">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest learning sessions and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Math Session</div>
                        <div className="text-sm text-gray-600">Multiplication practice • 15 min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">+25 points</div>
                      <div className="text-sm text-gray-600">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-pink-600" />
                      <div>
                        <div className="font-semibold text-gray-800">English Session</div>
                        <div className="text-sm text-gray-600">Grammar practice • 20 min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-pink-600">+30 points</div>
                      <div className="text-sm text-gray-600">Yesterday</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}