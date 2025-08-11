"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calculator, Trophy, Clock, Target, Star } from "lucide-react";
import Link from "next/link";

interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  operation: "multiplication" | "division";
  difficulty: number;
}

interface SessionStats {
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
  timeElapsed: number;
}

export default function MathLearningPage() {
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | null; message: string }>({ type: null, message: "" });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsAsked: 0,
    questionsCorrect: 0,
    pointsEarned: 0,
    timeElapsed: 0,
  });
  const [selectedOperation, setSelectedOperation] = useState<"multiplication" | "division" | "both">("both");
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // Mock settings - in a real app, this would come from the database
  const settings = {
    maxDailySessionTime: 60, // minutes
    maxWeeklySessionTime: 300, // minutes
    weeklyTimeUsed: 85, // minutes used this week
    dailyTimeUsed: 15, // minutes used today
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive && !timeLimitReached) {
      interval = setInterval(() => {
        const newTime = sessionTime + 1;
        setSessionTime(newTime);
        setSessionStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
        
        // Check daily limit
        const totalDailyTime = settings.dailyTimeUsed + Math.floor(newTime / 60);
        if (totalDailyTime >= settings.maxDailySessionTime && !warningShown) {
          setWarningShown(true);
          // Show warning but don't stop immediately
        }
        
        // Hard stop at daily limit + 5 minutes grace period
        if (totalDailyTime >= settings.maxDailySessionTime + 5) {
          setTimeLimitReached(true);
          endSession();
        }
        
        // Check weekly limit
        const totalWeeklyTime = settings.weeklyTimeUsed + Math.floor(newTime / 60);
        if (totalWeeklyTime >= settings.maxWeeklySessionTime) {
          setTimeLimitReached(true);
          endSession();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, timeLimitReached, warningShown]);

  // Generate math question
  const generateQuestion = (): MathQuestion => {
    const operations = selectedOperation === "both" 
      ? ["multiplication", "division"] as const
      : [selectedOperation];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    if (operation === "multiplication") {
      // Adjust numbers based on difficulty
      const maxNum = Math.min(10 + selectedDifficulty * 2, 20);
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    } else {
      // Division - ensure clean division
      const maxNum = Math.min(10 + selectedDifficulty, 15);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      const multiplier = Math.floor(Math.random() * maxNum) + 1;
      num1 = num2 * multiplier;
      answer = multiplier;
      question = `${num1} ÷ ${num2} = ?`;
    }
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      question,
      answer,
      operation,
      difficulty: selectedDifficulty,
    };
  };

  // Start new session
  const startSession = () => {
    setSessionActive(true);
    setSessionStats({
      questionsAsked: 0,
      questionsCorrect: 0,
      pointsEarned: 0,
      timeElapsed: 0,
    });
    setSessionTime(0);
    nextQuestion();
  };

  // Get next question
  const nextQuestion = () => {
    setCurrentQuestion(generateQuestion());
    setUserAnswer("");
    setFeedback({ type: null, message: "" });
    setIsSubmitting(false);
  };

  // Submit answer
  const submitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    setIsSubmitting(true);
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentQuestion.answer;
    
    // Calculate points based on difficulty and speed
    const basePoints = currentQuestion.difficulty * 10;
    const speedBonus = Math.max(0, 30 - Math.min(sessionTime, 30)); // Bonus for answering quickly
    const pointsEarned = isCorrect ? basePoints + speedBonus : 0;
    
    setFeedback({
      type: isCorrect ? "correct" : "incorrect",
      message: isCorrect 
        ? `Correct! +${pointsEarned} points ${speedBonus > 0 ? `(Speed bonus: +${speedBonus})` : ""}`
        : `Incorrect. The answer is ${currentQuestion.answer}`,
    });
    
    setSessionStats(prev => ({
      questionsAsked: prev.questionsAsked + 1,
      questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0),
      pointsEarned: prev.pointsEarned + pointsEarned,
      timeElapsed: prev.timeElapsed,
    }));
    
    // Auto-advance after delay
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // End session
  const endSession = () => {
    setSessionActive(false);
    setCurrentQuestion(null);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate accuracy
  const accuracy = sessionStats.questionsAsked > 0 
    ? Math.round((sessionStats.questionsCorrect / sessionStats.questionsAsked) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-blue-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Math Adventure</h1>
              <p className="text-gray-600">Master multiplication and division</p>
            </div>
          </div>
        </header>

        {!sessionActive ? (
          <div className="space-y-6">
            {/* Session Setup */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Start Math Session</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose your preferences and begin learning!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operation Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Operations:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={selectedOperation === "multiplication" ? "default" : "outline"}
                      onClick={() => setSelectedOperation("multiplication")}
                      className="border-blue-200"
                    >
                      × Multiplication
                    </Button>
                    <Button
                      variant={selectedOperation === "division" ? "default" : "outline"}
                      onClick={() => setSelectedOperation("division")}
                      className="border-blue-200"
                    >
                      ÷ Division
                    </Button>
                    <Button
                      variant={selectedOperation === "both" ? "default" : "outline"}
                      onClick={() => setSelectedOperation("both")}
                      className="border-blue-200"
                    >
                      × & ÷ Mixed
                    </Button>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={selectedDifficulty === level ? "default" : "outline"}
                        onClick={() => setSelectedDifficulty(level as 1 | 2 | 3 | 4 | 5)}
                        className="border-blue-200"
                      >
                        Level {level}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedDifficulty === 1 && "Easy: Single digit numbers"}
                    {selectedDifficulty === 2 && "Medium: Numbers up to 12"}
                    {selectedDifficulty === 3 && "Hard: Numbers up to 15"}
                    {selectedDifficulty === 4 && "Expert: Numbers up to 18"}
                    {selectedDifficulty === 5 && "Master: Numbers up to 20"}
                  </div>
                </div>

                <Button onClick={startSession} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold">
                  Start Learning Session
                </Button>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Your Math Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">65%</div>
                    <div className="text-sm text-gray-600">Multiplication</div>
                    <Progress value={65} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">45%</div>
                    <div className="text-sm text-gray-600">Division</div>
                    <Progress value={45} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Overall Accuracy</div>
                    <Progress value={85} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Time Limit Reached Message */}
            {timeLimitReached && (
              <Card className="bg-red-100 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-red-800">
                    <Clock className="w-6 h-6" />
                    <div>
                      <div className="font-semibold text-lg">Time Limit Reached</div>
                      <div className="text-sm">
                        You've reached your daily or weekly time limit. Come back tomorrow to continue learning!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{sessionStats.questionsAsked}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{sessionStats.pointsEarned}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${timeLimitReached ? "text-red-600" : "text-orange-600"}`}>
                      {formatTime(sessionTime)}
                    </div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                </div>
                
                {/* Time Limit Warning */}
                {warningShown && !timeLimitReached && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Time limit warning: You have {settings.maxDailySessionTime - (settings.dailyTimeUsed + Math.floor(sessionTime / 60))} minutes left today
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Time Limits Info */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div className="text-center">
                    <div>Daily: {settings.dailyTimeUsed + Math.floor(sessionTime / 60)}/{settings.maxDailySessionTime} min</div>
                    <Progress 
                      value={((settings.dailyTimeUsed + Math.floor(sessionTime / 60)) / settings.maxDailySessionTime) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  <div className="text-center">
                    <div>Weekly: {settings.weeklyTimeUsed + Math.floor(sessionTime / 60)}/{settings.maxWeeklySessionTime} min</div>
                    <Progress 
                      value={((settings.weeklyTimeUsed + Math.floor(sessionTime / 60)) / settings.maxWeeklySessionTime) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            {currentQuestion && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="text-center">
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {currentQuestion.operation === "multiplication" ? "× Multiplication" : "÷ Division"}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Level {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-gray-800">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      className="w-32 text-center text-2xl font-bold border-2 border-blue-200 focus:border-blue-400"
                      onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && submitAnswer()}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {feedback.message && (
                    <div className={`text-center p-4 rounded-lg ${
                      feedback.type === "correct" 
                        ? "bg-green-100 text-green-800 border border-green-200" 
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        {feedback.type === "correct" ? (
                          <Trophy className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                        <span className="font-semibold">{feedback.message}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={submitAnswer}
                      disabled={!userAnswer.trim() || isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      Submit Answer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={endSession}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      End Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Pro Tips:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Answer quickly for bonus points!</li>
                      <li>• For division: think "What times this number equals that number?"</li>
                      <li>• Take your time - accuracy is more important than speed</li>
                    </ul>
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