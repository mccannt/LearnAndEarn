"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Trophy, Clock, Target, Star, CheckCircle } from "lucide-react";
import Link from "next/link";

interface EnglishQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: "grammar" | "vocabulary" | "reading_comprehension" | "sentence_structure";
  difficulty: number;
}

interface SessionStats {
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
  timeElapsed: number;
}

export default function EnglishLearningPage() {
  const [currentQuestion, setCurrentQuestion] = useState<EnglishQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | null; message: string }>({ type: null, message: "" });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsAsked: 0,
    questionsCorrect: 0,
    pointsEarned: 0,
    timeElapsed: 0,
  });
  const [selectedTopic, setSelectedTopic] = useState<"grammar" | "vocabulary" | "reading_comprehension" | "sentence_structure" | "all">("all");
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

  // Sample English questions database
  const questionBank: EnglishQuestion[] = [
    // Grammar questions
    {
      id: "1",
      question: "Which sentence is correct?",
      options: [
        "Me and my friend went to the park.",
        "My friend and I went to the park.",
        "My friend and me went to the park.",
        "I and my friend went to the park."
      ],
      correctAnswer: "My friend and I went to the park.",
      questionType: "grammar",
      difficulty: 1
    },
    {
      id: "2",
      question: "Choose the correct verb: 'She ___ to school every day.'",
      options: ["go", "goes", "going", "gone"],
      correctAnswer: "goes",
      questionType: "grammar",
      difficulty: 1
    },
    {
      id: "3",
      question: "Which is the proper way to write this sentence? 'the cat sat on the mat'",
      options: [
        "the cat sat on the mat",
        "The cat sat on the mat",
        "The Cat Sat On The Mat",
        "The cat sat on the mat."
      ],
      correctAnswer: "The cat sat on the mat.",
      questionType: "grammar",
      difficulty: 2
    },
    // Vocabulary questions
    {
      id: "4",
      question: "What does 'enormous' mean?",
      options: ["Very small", "Very large", "Very fast", "Very slow"],
      correctAnswer: "Very large",
      questionType: "vocabulary",
      difficulty: 1
    },
    {
      id: "5",
      question: "Choose the word that means 'happy':",
      options: ["Sad", "Angry", "Joyful", "Tired"],
      correctAnswer: "Joyful",
      questionType: "vocabulary",
      difficulty: 1
    },
    {
      id: "6",
      question: "What is the meaning of 'perseverance'?",
      options: [
        "Giving up easily",
        "Continuing despite difficulties",
        "Running very fast",
        "Being very loud"
      ],
      correctAnswer: "Continuing despite difficulties",
      questionType: "vocabulary",
      difficulty: 3
    },
    // Reading comprehension questions
    {
      id: "7",
      question: "Read the sentence: 'The bright yellow sun warmed the green grass.' What is the main idea?",
      options: [
        "The sun is yellow",
        "The grass is green",
        "The sun is warming the grass",
        "The grass is bright"
      ],
      correctAnswer: "The sun is warming the grass",
      questionType: "reading_comprehension",
      difficulty: 1
    },
    {
      id: "8",
      question: "Read: 'Sarah loves to read books. She goes to the library every Saturday. Her favorite books are about animals.' What does Sarah like to do?",
      options: [
        "Play sports",
        "Read books",
        "Watch movies",
        "Draw pictures"
      ],
      correctAnswer: "Read books",
      questionType: "reading_comprehension",
      difficulty: 1
    },
    // Sentence structure questions
    {
      id: "9",
      question: "Which is a complete sentence?",
      options: [
        "Running in the park",
        "The big dog",
        "The cat sleeps on the couch",
        "Very happy today"
      ],
      correctAnswer: "The cat sleeps on the couch",
      questionType: "sentence_structure",
      difficulty: 1
    },
    {
      id: "10",
      question: "Choose the sentence that has correct punctuation:",
      options: [
        "What time is it",
        "What time is it!",
        "What time is it?",
        "What time is it."
      ],
      correctAnswer: "What time is it?",
      questionType: "sentence_structure",
      difficulty: 1
    }
  ];

  // Get filtered questions
  const getFilteredQuestions = (): EnglishQuestion[] => {
    return questionBank.filter(q => {
      const topicMatch = selectedTopic === "all" || q.questionType === selectedTopic;
      const difficultyMatch = q.difficulty <= selectedDifficulty;
      return topicMatch && difficultyMatch;
    });
  };

  // Get random question
  const getRandomQuestion = (): EnglishQuestion => {
    const filteredQuestions = getFilteredQuestions();
    if (filteredQuestions.length === 0) {
      // Fallback to any question if no matches
      return questionBank[Math.floor(Math.random() * questionBank.length)];
    }
    return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
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
    setCurrentQuestion(getRandomQuestion());
    setSelectedAnswer(null);
    setFeedback({ type: null, message: "" });
    setIsSubmitting(false);
  };

  // Submit answer
  const submitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;
    
    setIsSubmitting(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Calculate points based on difficulty and speed
    const basePoints = currentQuestion.difficulty * 15; // English questions worth more
    const speedBonus = Math.max(0, 45 - Math.min(sessionTime, 45)); // More time for English
    const pointsEarned = isCorrect ? basePoints + speedBonus : 0;
    
    setFeedback({
      type: isCorrect ? "correct" : "incorrect",
      message: isCorrect 
        ? `Correct! +${pointsEarned} points ${speedBonus > 0 ? `(Speed bonus: +${speedBonus})` : ""}`
        : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`,
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
    }, 3000);
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

  // Get topic display name
  const getTopicDisplayName = (topic: string) => {
    switch (topic) {
      case "grammar": return "Grammar";
      case "vocabulary": return "Vocabulary";
      case "reading_comprehension": return "Reading";
      case "sentence_structure": return "Sentences";
      default: return topic;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-pink-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">English Explorer</h1>
              <p className="text-gray-600">Improve grammar and reading comprehension</p>
            </div>
          </div>
        </header>

        {!sessionActive ? (
          <div className="space-y-6">
            {/* Session Setup */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Start English Session</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose your preferences and begin learning!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Topics:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button
                      variant={selectedTopic === "grammar" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("grammar")}
                      className="border-pink-200"
                    >
                      Grammar
                    </Button>
                    <Button
                      variant={selectedTopic === "vocabulary" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("vocabulary")}
                      className="border-pink-200"
                    >
                      Vocabulary
                    </Button>
                    <Button
                      variant={selectedTopic === "reading_comprehension" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("reading_comprehension")}
                      className="border-pink-200"
                    >
                      Reading
                    </Button>
                    <Button
                      variant={selectedTopic === "sentence_structure" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("sentence_structure")}
                      className="border-pink-200"
                    >
                      Sentences
                    </Button>
                    <Button
                      variant={selectedTopic === "all" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("all")}
                      className="border-pink-200 md:col-span-2"
                    >
                      All Topics
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
                        className="border-pink-200"
                      >
                        Level {level}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedDifficulty === 1 && "Easy: Basic concepts"}
                    {selectedDifficulty === 2 && "Medium: Intermediate skills"}
                    {selectedDifficulty === 3 && "Hard: Advanced understanding"}
                    {selectedDifficulty === 4 && "Expert: Complex analysis"}
                    {selectedDifficulty === 5 && "Master: Challenging content"}
                  </div>
                </div>

                <Button onClick={startSession} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold">
                  Start Learning Session
                </Button>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Your English Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">45%</div>
                    <div className="text-sm text-gray-600">Grammar</div>
                    <Progress value={45} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-rose-50 rounded-lg">
                    <div className="text-2xl font-bold text-rose-600">60%</div>
                    <div className="text-sm text-gray-600">Vocabulary</div>
                    <Progress value={60} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">75%</div>
                    <div className="text-sm text-gray-600">Reading</div>
                    <Progress value={75} className="mt-2 h-2" />
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
                    <div className="text-2xl font-bold text-pink-600">{sessionStats.questionsAsked}</div>
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
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                      {getTopicDisplayName(currentQuestion.questionType)}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Level {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        onClick={() => !isSubmitting && setSelectedAnswer(option)}
                        disabled={isSubmitting}
                        className={`text-left justify-start h-auto p-4 border-2 transition-all ${
                          selectedAnswer === option
                            ? "border-pink-400 bg-pink-50"
                            : "border-pink-200 hover:border-pink-300 hover:bg-pink-50"
                        } ${feedback.type && selectedAnswer === option
                          ? feedback.type === "correct"
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === option
                              ? "border-pink-500 bg-pink-500 text-white"
                              : "border-pink-300"
                          } ${feedback.type && selectedAnswer === option
                            ? feedback.type === "correct"
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-red-500 bg-red-500 text-white"
                            : ""
                          }`}>
                            {selectedAnswer === option && (
                              <span className="text-sm font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                            )}
                            {!selectedAnswer === option && (
                              <span className="text-sm text-gray-500">
                                {String.fromCharCode(65 + index)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm">{option}</span>
                        </div>
                      </Button>
                    ))}
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
                      disabled={!selectedAnswer || isSubmitting}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold"
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
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Pro Tips:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Read each question carefully before answering</li>
                      <li>• Take your time to understand what the question is asking</li>
                      <li>• If you're not sure, eliminate the options you know are wrong</li>
                      <li>• Learn from incorrect answers - they help you improve!</li>
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