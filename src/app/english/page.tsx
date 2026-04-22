"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import { LearnerEmptyState } from "@/components/learner-state";
import { LearnerWorkspaceShell } from "@/components/learner-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { curriculumEnglishQuestions } from "@/lib/curriculum-question-bank";
import type { SessionQuestionResult } from "@/lib/scoring";

interface EnglishQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: "grammar" | "vocabulary" | "reading_comprehension" | "sentence_structure";
  difficulty: number;
  gradeMin: number;
  gradeMax: number;
}

interface SessionStats {
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
  timeElapsed: number;
}

interface EnglishApiQuestion {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: string;
  difficulty: number;
  gradeMin?: number | null;
  gradeMax?: number | null;
}

interface EnglishQuestionResponse {
  questions?: EnglishApiQuestion[];
  curriculumContext?: {
    gradeLevel: number | null;
    gradeLabel: string;
    source: string;
  };
}

const lessonPanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(255,111,146,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const difficultyCopy: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Easy: short prompts and basic comprehension.",
  2: "Medium: broader vocabulary and sentence work.",
  3: "Hard: more nuanced reading and grammar.",
  4: "Expert: denser prompts and trickier distractors.",
  5: "Master: highest challenge across all language skills.",
};

function getEnglishProgressionCopy(gradeLevel: number | null | undefined) {
  if (typeof gradeLevel !== "number") {
    return "The round will stay inside the current learner bank and fall back to mixed reading and writing practice if needed.";
  }

  if (gradeLevel <= 3) {
    return "This band emphasizes K–3 reading/viewing and writing/representing outcomes with shorter texts, vocabulary support, and sentence clarity.";
  }

  return "This band emphasizes 4–6 reading/viewing and writing/representing outcomes with denser texts, stronger evidence work, and more precise language.";
}

const questionBank: EnglishQuestion[] = curriculumEnglishQuestions.map((question) => ({
  id: question.seedKey,
  question: question.question,
  options: question.options,
  correctAnswer: question.correctAnswer,
  questionType: question.questionType.toLowerCase() as EnglishQuestion["questionType"],
  difficulty: question.difficulty,
  gradeMin: question.gradeMin,
  gradeMax: question.gradeMax,
}));

export default function EnglishLearningPage() {
  const [currentQuestion, setCurrentQuestion] = useState<EnglishQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | null; message: string }>({
    type: null,
    message: "",
  });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsAsked: 0,
    questionsCorrect: 0,
    pointsEarned: 0,
    timeElapsed: 0,
  });
  const [selectedTopic, setSelectedTopic] = useState<
    "grammar" | "vocabulary" | "reading_comprehension" | "sentence_structure" | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [limits, setLimits] = useState({
    maxDailySessionTime: 60,
    maxWeeklySessionTime: 300,
    weeklyTimeUsed: 0,
    dailyTimeUsed: 0,
  });
  const [questionQueue, setQuestionQueue] = useState<EnglishQuestion[]>([]);
  const [questionResults, setQuestionResults] = useState<SessionQuestionResult[]>([]);
  const [curriculumContext, setCurriculumContext] = useState<{
    gradeLevel: number | null;
    gradeLabel: string;
    source: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (response) => response.json())
      .then((json) => {
        const settings = json?.settings;
        if (!settings) {
          return;
        }

        setLimits((prev) => ({
          ...prev,
          maxDailySessionTime: settings.maxDailySessionTime ?? prev.maxDailySessionTime,
          maxWeeklySessionTime: settings.maxWeeklySessionTime ?? prev.maxWeeklySessionTime,
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      difficulty: String(selectedDifficulty),
    });

    if (selectedTopic !== "all") {
      params.set("type", selectedTopic.toUpperCase());
    }

    fetch(`/api/questions/english?${params.toString()}`)
      .then(async (response) => response.json())
      .then((json: EnglishQuestionResponse) => {
        const list = Array.isArray(json?.questions) ? json.questions : [];
        const mapped = list.map<EnglishQuestion>((question) => ({
          id: String(question.id),
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          questionType: question.questionType.toLowerCase() as EnglishQuestion["questionType"],
          difficulty: question.difficulty,
          gradeMin: question.gradeMin ?? 0,
          gradeMax: question.gradeMax ?? 12,
        }));

        setQuestionQueue(mapped);
        setCurriculumContext(json?.curriculumContext ?? null);
      })
      .catch(() => {
        setQuestionQueue([]);
        setCurriculumContext(null);
      });
  }, [selectedDifficulty, selectedTopic]);

  useEffect(() => {
    if (!sessionActive || timeLimitReached) {
      return;
    }

    const interval = setInterval(() => {
      setSessionTime((prevTime) => {
        const nextTime = prevTime + 1;
        setSessionStats((prevStats) => ({ ...prevStats, timeElapsed: prevStats.timeElapsed + 1 }));

        const totalDailyTime = limits.dailyTimeUsed + Math.floor(nextTime / 60);
        const totalWeeklyTime = limits.weeklyTimeUsed + Math.floor(nextTime / 60);

        if (totalDailyTime >= limits.maxDailySessionTime && !warningShown) {
          setWarningShown(true);
        }

        if (totalDailyTime >= limits.maxDailySessionTime + 5 || totalWeeklyTime >= limits.maxWeeklySessionTime) {
          setTimeLimitReached(true);
          endSession();
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    limits.dailyTimeUsed,
    limits.maxDailySessionTime,
    limits.maxWeeklySessionTime,
    limits.weeklyTimeUsed,
    sessionActive,
    timeLimitReached,
    warningShown,
  ]);

  const getFilteredQuestions = () => {
    return questionBank.filter((question) => {
      const gradeMatch =
        typeof curriculumContext?.gradeLevel !== "number" ||
        (question.gradeMin <= curriculumContext.gradeLevel && question.gradeMax >= curriculumContext.gradeLevel);
      const topicMatch = selectedTopic === "all" || question.questionType === selectedTopic;
      const difficultyMatch = question.difficulty <= selectedDifficulty;
      return gradeMatch && topicMatch && difficultyMatch;
    });
  };

  const getRandomQuestion = (): EnglishQuestion => {
    const filteredQuestions = getFilteredQuestions();
    if (filteredQuestions.length === 0) {
      const gradeMatchedQuestions = questionBank.filter((question) => {
        return (
          typeof curriculumContext?.gradeLevel !== "number" ||
          (question.gradeMin <= curriculumContext.gradeLevel && question.gradeMax >= curriculumContext.gradeLevel)
        );
      });

      const fallbackPool = gradeMatchedQuestions.length > 0 ? gradeMatchedQuestions : questionBank;
      return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    }

    return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
  };

  const nextQuestion = () => {
    if (questionQueue.length > 0) {
      const [next, ...rest] = questionQueue;
      setQuestionQueue(rest);
      setCurrentQuestion(next);
    } else {
      setCurrentQuestion(getRandomQuestion());
    }

    setSelectedAnswer(null);
    setFeedback({ type: null, message: "" });
    setIsSubmitting(false);
  };

  const startSession = () => {
    setSessionActive(true);
    setTimeLimitReached(false);
    setWarningShown(false);
    setSessionStats({ questionsAsked: 0, questionsCorrect: 0, pointsEarned: 0, timeElapsed: 0 });
    setSessionTime(0);
    setQuestionResults([]);
    nextQuestion();
  };

  const submitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    setIsSubmitting(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const basePoints = currentQuestion.difficulty * 15;
    const speedBonus = Math.max(0, 45 - Math.min(sessionTime, 45));
    const pointsEarned = isCorrect ? basePoints + speedBonus : 0;

    setFeedback({
      type: isCorrect ? "correct" : "incorrect",
      message: isCorrect
        ? `Correct! +${pointsEarned} points${speedBonus > 0 ? ` including +${speedBonus} speed bonus` : ""}.`
        : `Not quite. The right answer is "${currentQuestion.correctAnswer}".`,
    });

    setSessionStats((prev) => ({
      questionsAsked: prev.questionsAsked + 1,
      questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0),
      pointsEarned: prev.pointsEarned + pointsEarned,
      timeElapsed: prev.timeElapsed,
    }));

    setQuestionResults((prev) => [
      ...prev,
      {
        difficulty: currentQuestion.difficulty,
        isCorrect,
        secondsElapsed: sessionTime,
      },
    ]);

    window.setTimeout(() => {
      nextQuestion();
    }, 2400);
  };

  const postSession = async () => {
    if (!currentQuestion || sessionStats.questionsAsked === 0) {
      return;
    }

    const minutes = Math.max(1, Math.round(sessionTime / 60));

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "ENGLISH",
          topic: currentQuestion.questionType,
          duration: minutes,
          questionsAsked: sessionStats.questionsAsked,
          questionsCorrect: sessionStats.questionsCorrect,
          pointsEarned: sessionStats.pointsEarned,
          completedAt: new Date().toISOString(),
          questionResults,
        }),
      });
    } catch {}
  };

  const endSession = () => {
    setSessionActive(false);
    void postSession();
    setCurrentQuestion(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTopicDisplayName = (topic: string) => {
    switch (topic) {
      case "grammar":
        return "Grammar";
      case "vocabulary":
        return "Vocabulary";
      case "reading_comprehension":
        return "Reading";
      case "sentence_structure":
        return "Sentences";
      default:
        return topic;
    }
  };

  const accuracy =
    sessionStats.questionsAsked > 0
      ? Math.round((sessionStats.questionsCorrect / sessionStats.questionsAsked) * 100)
      : 0;
  const dailyMinutesUsed = limits.dailyTimeUsed + Math.floor(sessionTime / 60);
  const weeklyMinutesUsed = limits.weeklyTimeUsed + Math.floor(sessionTime / 60);
  const dailyProgress =
    limits.maxDailySessionTime > 0 ? Math.min(100, (dailyMinutesUsed / limits.maxDailySessionTime) * 100) : 0;
  const weeklyProgress =
    limits.maxWeeklySessionTime > 0 ? Math.min(100, (weeklyMinutesUsed / limits.maxWeeklySessionTime) * 100) : 0;
  const dailyRemaining = Math.max(0, limits.maxDailySessionTime - dailyMinutesUsed);
  const weeklyRemaining = Math.max(0, limits.maxWeeklySessionTime - weeklyMinutesUsed);
  const queueCount = questionQueue.length;
  const topicLabel = selectedTopic === "all" ? "Mixed language practice" : getTopicDisplayName(selectedTopic);
  const gradeLabel = curriculumContext?.gradeLabel ?? "Current learner band";
  const progressionCopy = getEnglishProgressionCopy(curriculumContext?.gradeLevel);

  return (
    <LearnerWorkspaceShell
      currentSection="english"
      title="English Explorer"
      description="Run grade-aware New Brunswick-aligned reading and writing practice across grammar, vocabulary, sentence work, and comprehension."
      icon={<BookOpen className="h-6 w-6" />}
      accent="rose"
      actions={
        <Button asChild variant="outline" className="rounded-full border-white/80 bg-white/70 dark:border-white/10 dark:bg-white/5">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      }
      metrics={[
        { label: "Questions", value: `${sessionStats.questionsAsked}` },
        { label: "Accuracy", value: `${accuracy}%` },
        { label: "Points", value: `${sessionStats.pointsEarned}` },
        { label: "Timer", value: formatTime(sessionTime) },
      ]}
    >
      <div className="mx-auto max-w-5xl">
        {!sessionActive ? (
          <MotionGroup className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <MotionItem>
              <Card className={lessonPanelClass}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-pink-100 text-pink-700 hover:bg-pink-100 dark:bg-pink-500/10 dark:text-pink-200">
                      {topicLabel}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      Level {selectedDifficulty}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      {queueCount > 0 ? `${queueCount} questions loaded` : "Built-in fallback ready"}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      {gradeLabel}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Start English Session</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Pick a lane, set the challenge, then step into a quiz flow that stays inside the learner's reading and writing band.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Choose topics
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["grammar", "Grammar"],
                        ["vocabulary", "Vocabulary"],
                        ["reading_comprehension", "Reading"],
                        ["sentence_structure", "Sentences"],
                        ["all", "All Topics"],
                      ].map(([value, label]) => (
                        <Button
                          key={value}
                          variant={selectedTopic === value ? "default" : "outline"}
                          onClick={() =>
                            setSelectedTopic(
                              value as "grammar" | "vocabulary" | "reading_comprehension" | "sentence_structure" | "all",
                            )
                          }
                          className={`rounded-full border-pink-200 ${value === "all" ? "sm:col-span-2" : ""}`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Difficulty level
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Button
                          key={level}
                          variant={selectedDifficulty === level ? "default" : "outline"}
                          onClick={() => setSelectedDifficulty(level as 1 | 2 | 3 | 4 | 5)}
                          className="rounded-full border-pink-200"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{difficultyCopy[selectedDifficulty]}</p>
                  </div>

                  <div className="rounded-[1.5rem] bg-gradient-to-br from-pink-50 to-rose-50 p-4 dark:from-pink-500/10 dark:to-rose-500/10">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-pink-500" />
                      <div>
                        <div className="font-semibold text-slate-950 dark:text-slate-50">Progression lane</div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {progressionCopy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startSession}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 font-semibold text-white hover:from-pink-600 hover:to-rose-600"
                  >
                    Start Learning Session
                  </Button>
                </CardContent>
              </Card>
            </MotionItem>

            <div className="space-y-6">
              <MotionItem>
                <Card className={lessonPanelClass}>
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Session Blueprint</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      A clear preview of what this reading and language round emphasizes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Focus</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{topicLabel}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Curriculum band</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{gradeLabel}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pace</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Thoughtful but quick</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Queue</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                        {queueCount > 0 ? `${queueCount} ready now` : "Fallback bank enabled"}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45 sm:col-span-2 xl:col-span-1">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Difficulty</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Level {selectedDifficulty}</div>
                    </div>
                  </CardContent>
                </Card>
              </MotionItem>

              <MotionItem>
                <Card className={lessonPanelClass}>
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Time Budget</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      The same parent guardrails apply here, with session warnings before the cap.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>Daily time</span>
                        <span>{dailyRemaining} min remaining</span>
                      </div>
                      <Progress value={dailyProgress} className="h-2.5" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>Weekly time</span>
                        <span>{weeklyRemaining} min remaining</span>
                      </div>
                      <Progress value={weeklyProgress} className="h-2.5" />
                    </div>
                    <div className="rounded-[1.25rem] bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                      Reading rounds stop automatically if the configured daily or weekly limit is exceeded.
                    </div>
                  </CardContent>
                </Card>
              </MotionItem>
            </div>
          </MotionGroup>
        ) : (
          <MotionGroup className="space-y-6">
            {timeLimitReached ? (
              <MotionItem>
                <Card className="rounded-[1.75rem] border-0 bg-red-100/90 shadow-lg dark:bg-red-500/10">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 text-red-800 dark:text-red-100">
                      <Clock className="mt-0.5 h-6 w-6" />
                      <div>
                        <div className="text-lg font-semibold">Time limit reached</div>
                        <div className="text-sm">
                          This session has hit the current learning cap. Return when the schedule opens more time.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MotionItem>
            ) : null}

            <MotionItem>
              <Card className={lessonPanelClass}>
                <CardContent className="p-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.25rem] bg-white/70 p-4 text-center dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Questions</div>
                      <div className="mt-2 text-2xl font-bold text-pink-600">{sessionStats.questionsAsked}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 text-center dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Accuracy</div>
                      <div className="mt-2 text-2xl font-bold text-emerald-600">{accuracy}%</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 text-center dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Points</div>
                      <div className="mt-2 text-2xl font-bold text-violet-600">{sessionStats.pointsEarned}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 text-center dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Timer</div>
                      <div className={`mt-2 text-2xl font-bold ${timeLimitReached ? "text-red-600" : "text-orange-600"}`}>
                        {formatTime(sessionTime)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-slate-50/90 p-4 dark:bg-slate-900/45">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>Daily usage</span>
                        <span>{dailyMinutesUsed}/{limits.maxDailySessionTime} min</span>
                      </div>
                      <Progress value={dailyProgress} className="mt-3 h-2" />
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50/90 p-4 dark:bg-slate-900/45">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>Weekly usage</span>
                        <span>{weeklyMinutesUsed}/{limits.maxWeeklySessionTime} min</span>
                      </div>
                      <Progress value={weeklyProgress} className="mt-3 h-2" />
                    </div>
                  </div>

                  {warningShown && !timeLimitReached ? (
                    <div className="mt-5 rounded-[1.25rem] border border-yellow-200 bg-yellow-100 px-4 py-3 text-sm font-medium text-yellow-800 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-100">
                      Time warning: {dailyRemaining} minutes remain in today’s budget.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </MotionItem>

            <MotionItem>
              {currentQuestion ? (
                <Card className={`${lessonPanelClass} shadow-xl`}>
                  <CardHeader className="text-center">
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-200">
                        {getTopicDisplayName(currentQuestion.questionType)}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200">
                        Level {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                        {queueCount > 0 ? `${queueCount} queued next` : "Fallback bank"}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                        {gradeLabel}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold leading-relaxed text-slate-950 dark:text-slate-50 md:text-2xl">
                      {currentQuestion.question}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Pick the strongest answer, then move quickly to keep the bonus alive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-2">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const hasFeedback = Boolean(feedback.type);
                        const selectedStateClass = hasFeedback && isSelected
                          ? feedback.type === "correct"
                            ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-500/10"
                            : "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10"
                          : isSelected
                            ? "border-pink-400 bg-pink-50 dark:border-pink-300 dark:bg-pink-500/10"
                            : "border-pink-200 hover:border-pink-300 hover:bg-pink-50 dark:border-pink-500/20 dark:hover:bg-pink-500/10";

                        return (
                          <Button
                            key={option}
                            variant="outline"
                            onClick={() => {
                              if (!isSubmitting) {
                                setSelectedAnswer(option);
                              }
                            }}
                            disabled={isSubmitting}
                            className={`h-auto justify-start rounded-[1.5rem] border-2 px-4 py-4 text-left transition-all ${selectedStateClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                                  isSelected
                                    ? "border-pink-500 bg-pink-500 text-white"
                                    : "border-pink-300 text-slate-500 dark:border-pink-500/30 dark:text-slate-300"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="whitespace-normal text-sm text-slate-800 dark:text-slate-100">{option}</span>
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                    {feedback.message ? (
                      <div
                        className={`rounded-[1.5rem] p-4 text-center ${
                          feedback.type === "correct"
                            ? "border border-green-200 bg-green-100 text-green-800 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-100"
                            : "border border-red-200 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {feedback.type === "correct" ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                          <span className="font-semibold">{feedback.message}</span>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap justify-center gap-4">
                      <Button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer || isSubmitting}
                        className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 font-semibold text-white hover:from-pink-600 hover:to-rose-600"
                      >
                        Submit Answer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={endSession}
                        className="rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                      >
                        End Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <LearnerEmptyState
                  title="Preparing the next prompt"
                  description="The next English question is loading. The round will continue in a moment."
                  icon={<BookOpen className="h-6 w-6" />}
                />
              )}
            </MotionItem>

            <MotionItem>
              <Card className="rounded-[1.75rem] border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg dark:from-purple-500/10 dark:to-pink-500/10">
                <CardContent className="p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
                    <div className="flex items-start gap-3">
                      <Star className="mt-0.5 h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-semibold text-slate-950 dark:text-slate-50">Pro tips</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Read the whole prompt first, eliminate obvious misses, and only then commit to the strongest option.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/35">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <Flame className="h-4 w-4 text-pink-500" />
                          Speed bonus
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Up to 45 extra points for quick, correct reading.</div>
                      </div>
                      <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/35">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Better habits
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Slower, accurate reading usually beats rushed guessing.</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>
          </MotionGroup>
        )}
      </div>
    </LearnerWorkspaceShell>
  );
}
