"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { SessionQuestionResult } from "@/lib/scoring";

interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  remainder?: number | null;
  operation: "addition" | "subtraction" | "multiplication" | "division";
  difficulty: number;
}

interface SessionStats {
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
  timeElapsed: number;
}

interface MathApiQuestion {
  id: string | number;
  question: string;
  answer: number;
  remainder?: number | null;
  operation: "ADDITION" | "SUBTRACTION" | "DIVISION" | "MULTIPLICATION";
  difficulty: number;
}

interface MathQuestionResponse {
  questions?: MathApiQuestion[];
  curriculumContext?: {
    gradeLevel: number | null;
    gradeLabel: string;
    source: string;
  };
}

const lessonPanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(95,111,255,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const difficultyCopy: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Easy: early-grade facts and quick wins.",
  2: "Medium: familiar patterns with slightly larger numbers.",
  3: "Hard: stronger fluency with multi-step thinking.",
  4: "Expert: multi-digit work and tougher distractors.",
  5: "Master: upper-elementary pressure with heavier numbers.",
};

type MathOperationChoice = MathQuestion["operation"] | "both";
const DECIMAL_TOLERANCE = 1e-9;

function formatMathValue(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toString();
}

function getAvailableMathOperations(gradeLevel: number | null | undefined) {
  if (typeof gradeLevel !== "number") {
    return ["addition", "subtraction", "multiplication", "division"] as const;
  }

  if (gradeLevel <= 2) {
    return ["addition", "subtraction"] as const;
  }

  if (gradeLevel >= 7) {
    return ["addition", "subtraction", "multiplication", "division"] as const;
  }

  return ["multiplication", "division"] as const;
}

function getMathProgressionCopy(gradeLevel: number | null | undefined) {
  if (typeof gradeLevel !== "number") {
    return "A mixed progression path will stay inside the current learner bank and fall back to broad fluency work if needed.";
  }

  if (gradeLevel <= 2) {
    return "This band emphasizes addition and subtraction fluency before multiplication and division become the core lane.";
  }

  if (gradeLevel === 3) {
    return "This band emphasizes multiplication facts and their related division strategies so inverse thinking stays connected.";
  }

  if (gradeLevel === 6) {
    return "This band emphasizes decimal multiplication and division with 1-digit multipliers or divisors so estimation and decimal placement stay central.";
  }

  if (gradeLevel >= 7) {
    return "This band emphasizes decimal operations across all four operations so the learner can estimate, place the decimal, and solve context-rich problems accurately.";
  }

  return "This band emphasizes multi-digit multiplication and division so the learner keeps building efficient upper-elementary strategies.";
}

function getOperationLabel(
  operation: "addition" | "subtraction" | "multiplication" | "division" | "both",
) {
  switch (operation) {
    case "addition":
      return "+ Addition";
    case "subtraction":
      return "− Subtraction";
    case "multiplication":
      return "× Multiplication";
    case "division":
      return "÷ Division";
    default:
      return "Mixed practice";
  }
}

function parseMathResponse(value: string) {
  const trimmed = value.trim().toLowerCase();
  const remainderMatch = trimmed.match(/^(-?\d+)\s*(?:r|remainder)\s*(-?\d+)$/i);
  if (remainderMatch) {
    return {
      answer: Number.parseInt(remainderMatch[1], 10),
      remainder: Number.parseInt(remainderMatch[2], 10),
    };
  }

  const answer = Number(trimmed);
  if (!Number.isFinite(answer)) {
    return null;
  }

  return { answer, remainder: null };
}

export default function MathLearningPage() {
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
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
  const [selectedOperation, setSelectedOperation] = useState<MathOperationChoice>("both");
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [questionQueue, setQuestionQueue] = useState<MathQuestion[]>([]);
  const [questionResults, setQuestionResults] = useState<SessionQuestionResult[]>([]);
  const [curriculumContext, setCurriculumContext] = useState<{
    gradeLevel: number | null;
    gradeLabel: string;
    source: string;
  } | null>(null);
  const [limits, setLimits] = useState({
    maxDailySessionTime: 60,
    maxWeeklySessionTime: 300,
    weeklyTimeUsed: 0,
    dailyTimeUsed: 0,
  });

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

    if (selectedOperation !== "both") {
      params.set("operation", selectedOperation.toUpperCase());
    }

    fetch(`/api/questions/math?${params.toString()}`)
      .then(async (response) => response.json())
      .then((json: MathQuestionResponse) => {
        const list = Array.isArray(json?.questions) ? json.questions : [];
        const mapped = list.map<MathQuestion>((question) => ({
          id: String(question.id),
          question: question.question,
          answer: question.answer,
          remainder: question.remainder ?? null,
          operation:
            question.operation === "DIVISION"
              ? "division"
              : question.operation === "MULTIPLICATION"
                ? "multiplication"
                : question.operation === "SUBTRACTION"
                  ? "subtraction"
                  : "addition",
          difficulty: question.difficulty,
        }));

        setQuestionQueue(mapped);
        setCurriculumContext(json?.curriculumContext ?? null);
      })
      .catch(() => {
        setQuestionQueue([]);
        setCurriculumContext(null);
      });
  }, [selectedOperation, selectedDifficulty]);

  const availableOperations = getAvailableMathOperations(curriculumContext?.gradeLevel);

  useEffect(() => {
    if (selectedOperation === "both") {
      return;
    }

    if (!availableOperations.some((operation) => operation === selectedOperation)) {
      setSelectedOperation("both");
    }
  }, [curriculumContext?.gradeLevel, selectedOperation]);

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

  const generateQuestion = (): MathQuestion => {
    const operations =
      selectedOperation === "both"
        ? availableOperations
        : [selectedOperation];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const supportsDecimals = (curriculumContext?.gradeLevel ?? null) !== null && (curriculumContext?.gradeLevel ?? 0) >= 6;
    let num1: number;
    let num2: number;
    let answer: number;
    let question: string;

    if (supportsDecimals && operation === "addition") {
      num1 = (Math.floor(Math.random() * 90) + 10) / 10;
      num2 = (Math.floor(Math.random() * 90) + 10) / 100;
      answer = num1 + num2;
      question = `${formatMathValue(num1)} + ${formatMathValue(num2)} = ?`;
    } else if (supportsDecimals && operation === "subtraction") {
      num1 = (Math.floor(Math.random() * 900) + 100) / 100;
      num2 = (Math.floor(Math.random() * (num1 * 100 - 25)) + 25) / 100;
      answer = num1 - num2;
      question = `${formatMathValue(num1)} - ${formatMathValue(num2)} = ?`;
    } else if (supportsDecimals && operation === "multiplication") {
      num1 = (Math.floor(Math.random() * 40) + 10) / 10;
      num2 = Math.floor(Math.random() * 8) + 2;
      answer = num1 * num2;
      question = `${formatMathValue(num1)} × ${formatMathValue(num2)} = ?`;
    } else if (supportsDecimals && operation === "division") {
      answer = (Math.floor(Math.random() * 40) + 10) / 10;
      num2 = Math.floor(Math.random() * 8) + 2;
      num1 = answer * num2;
      question = `${formatMathValue(num1)} ÷ ${formatMathValue(num2)} = ?`;
    } else if (operation === "addition") {
      const maxNum = Math.min(20 + selectedDifficulty * 20, 100);
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    } else if (operation === "subtraction") {
      const maxNum = Math.min(20 + selectedDifficulty * 20, 100);
      num1 = Math.floor(Math.random() * maxNum) + 10;
      num2 = Math.floor(Math.random() * Math.min(num1, maxNum)) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
    } else if (operation === "multiplication") {
      const maxNum = Math.min(10 + selectedDifficulty * 2, 20);
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    } else {
      const maxNum = Math.min(10 + selectedDifficulty, 15);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      const multiplier = Math.floor(Math.random() * maxNum) + 1;
      num1 = num2 * multiplier;
      answer = multiplier;
      question = `${num1} ÷ ${num2} = ?`;
    }

    return {
      id: Math.random().toString(36).slice(2, 11),
      question,
      answer,
      remainder: null,
      operation,
      difficulty: selectedDifficulty,
    };
  };

  const nextQuestion = () => {
    if (questionQueue.length > 0) {
      const [next, ...rest] = questionQueue;
      setQuestionQueue(rest);
      setCurrentQuestion(next);
    } else {
      setCurrentQuestion(generateQuestion());
    }

    setUserAnswer("");
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
    if (!currentQuestion || !userAnswer.trim()) {
      return;
    }

    const parsedResponse = parseMathResponse(userAnswer);
    if (!parsedResponse) {
      return;
    }

    setIsSubmitting(true);
    const isCorrect =
      Math.abs(parsedResponse.answer - currentQuestion.answer) < DECIMAL_TOLERANCE &&
      (currentQuestion.remainder ?? null) === parsedResponse.remainder;
    const basePoints = currentQuestion.difficulty * 10;
    const speedBonus = Math.max(0, 30 - Math.min(sessionTime, 30));
    const pointsEarned = isCorrect ? basePoints + speedBonus : 0;

    setFeedback({
      type: isCorrect ? "correct" : "incorrect",
      message: isCorrect
        ? `Correct! +${pointsEarned} points${speedBonus > 0 ? ` including +${speedBonus} speed bonus` : ""}.`
        : currentQuestion.remainder !== null
          ? `Not quite. The right answer is ${formatMathValue(currentQuestion.answer)} R ${currentQuestion.remainder}.`
          : `Not quite. The right answer is ${formatMathValue(currentQuestion.answer)}.`,
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
    }, 1800);
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
          subject: "MATH",
          topic: currentQuestion.operation,
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
  const operationLabel = selectedOperation === "both" ? "Mixed practice" : `${getOperationLabel(selectedOperation)} focus`;
  const gradeLabel = curriculumContext?.gradeLabel ?? "Current learner band";
  const progressionCopy = getMathProgressionCopy(curriculumContext?.gradeLevel);

  return (
    <LearnerWorkspaceShell
      currentSection="math"
      title="Math Adventure"
      description="Run grade-aware New Brunswick-aligned math practice with operations, fluency, and problem-solving tuned to the learner."
      icon={<Calculator className="h-6 w-6" />}
      accent="sky"
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
                    <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-200">
                      {operationLabel}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      Level {selectedDifficulty}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      {queueCount > 0 ? `${queueCount} questions loaded` : "Generator fallback ready"}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      {gradeLabel}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Start Math Session</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Tune the round first, then jump into a focused sprint that stays inside the learner's progression lane.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Choose operations
                    </label>
                    <div className={`grid gap-3 ${availableOperations.length > 2 ? "sm:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-3"}`}>
                      {availableOperations.map((operation) => (
                        <Button
                          key={operation}
                          variant={selectedOperation === operation ? "default" : "outline"}
                          onClick={() => setSelectedOperation(operation)}
                          className="rounded-full border-blue-200"
                        >
                          {getOperationLabel(operation)}
                        </Button>
                      ))}
                      {availableOperations.length > 1 ? (
                        <Button
                          variant={selectedOperation === "both" ? "default" : "outline"}
                          onClick={() => setSelectedOperation("both")}
                          className="rounded-full border-blue-200"
                        >
                          Mixed
                        </Button>
                      ) : null}
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
                          className="rounded-full border-blue-200"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{difficultyCopy[selectedDifficulty]}</p>
                  </div>

                  <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-violet-50 p-4 dark:from-blue-500/10 dark:to-violet-500/10">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-blue-500" />
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
                    className="w-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 font-semibold text-white hover:from-blue-600 hover:to-violet-600"
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
                      What this round is optimized for before you begin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Focus</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{operationLabel}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Curriculum band</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{gradeLabel}</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pace</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Fast response bonus</div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/45">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Queue</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                        {queueCount > 0 ? `${queueCount} ready now` : "Infinite fallback"}
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
                      Stay inside the parent-configured learning guardrails.
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
                      You’ll get a warning near the daily cap, and the round stops automatically if a limit is exceeded.
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
                        <div className="font-semibold text-lg">Time limit reached</div>
                        <div className="text-sm">
                          This session hit the daily or weekly learning cap. Come back once more time is available.
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
                      <div className="mt-2 text-2xl font-bold text-blue-600">{sessionStats.questionsAsked}</div>
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
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                        {getOperationLabel(currentQuestion.operation)}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200">
                        Level {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                        {queueCount > 0 ? `${queueCount} queued next` : "Generator mode"}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100">
                        {gradeLabel}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-950 dark:text-slate-50 md:text-4xl">
                      {currentQuestion.question}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Enter the answer and press <span className="font-medium">Enter</span> for a faster flow.
                      {currentQuestion.remainder === null ? " Decimals are accepted when the lesson uses them." : ""}
                      {currentQuestion.remainder !== null ? " Use q R r when a remainder is needed." : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <Input
                        type="text"
                        value={userAnswer}
                        onChange={(event) => setUserAnswer(event.target.value)}
                        placeholder={currentQuestion.remainder !== null ? "23 R 2" : "5.23"}
                        className="h-20 w-40 rounded-[1.5rem] border-2 border-blue-200 text-center text-4xl font-bold focus:border-blue-400"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !isSubmitting) {
                            submitAnswer();
                          }
                        }}
                        disabled={isSubmitting}
                      />
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
                        disabled={!userAnswer.trim() || isSubmitting}
                        className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 font-semibold text-white hover:from-blue-600 hover:to-violet-600"
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
                  title="Preparing the next challenge"
                  description="The next math question is loading. Stay ready for the next round."
                  icon={<Calculator className="h-6 w-6" />}
                />
              )}
            </MotionItem>

            <MotionItem>
              <Card className="rounded-[1.75rem] border-0 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg dark:from-yellow-500/10 dark:to-orange-500/10">
                <CardContent className="p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
                    <div className="flex items-start gap-3">
                      <Star className="mt-0.5 h-5 w-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold text-slate-950 dark:text-slate-50">Pro tips</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Look for number patterns, use factor pairs for division, and stay accurate before chasing speed.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/35">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <Flame className="h-4 w-4 text-orange-500" />
                          Speed bonus
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Up to 30 extra points on fast correct answers.</div>
                      </div>
                      <div className="rounded-[1.25rem] bg-white/70 p-4 dark:bg-slate-900/35">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Accuracy first
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Clean streaks grow your score faster than guesses, especially within the current grade lane.</div>
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
