"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Calculator, Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParentWorkspaceShell } from "@/components/parent-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import {
  NB_ENGLISH_CURRICULUM_TEMPLATES,
  NB_MATH_CURRICULUM_TEMPLATES,
  getEnglishCurriculumTemplate,
  getMathCurriculumTemplate,
} from "@/lib/curriculum";
import { formatGradeLabel } from "@/lib/grade-level";

type MathOperation = "ADDITION" | "SUBTRACTION" | "MULTIPLICATION" | "DIVISION";
type EnglishQuestionType = "GRAMMAR" | "VOCABULARY" | "READING_COMPREHENSION" | "SENTENCE_STRUCTURE";

type MathQuestionRecord = {
  id: string;
  question: string;
  answer: number;
  remainder?: number | null;
  operation: MathOperation;
  difficulty: number;
  topic: string;
  gradeMin: number | null;
  gradeMax: number | null;
  curriculumCode?: string | null;
  curriculumOutcome?: string | null;
};

type EnglishQuestionRecord = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: EnglishQuestionType;
  difficulty: number;
  topic: string;
  gradeMin: number | null;
  gradeMax: number | null;
  curriculumCode?: string | null;
  curriculumOutcome?: string | null;
};

const mathOperationOptions: Array<{ value: MathOperation; label: string }> = [
  { value: "ADDITION", label: "Addition" },
  { value: "SUBTRACTION", label: "Subtraction" },
  { value: "MULTIPLICATION", label: "Multiplication" },
  { value: "DIVISION", label: "Division" },
];

const englishTypeOptions: Array<{ value: EnglishQuestionType; label: string }> = [
  { value: "GRAMMAR", label: "Grammar" },
  { value: "VOCABULARY", label: "Vocabulary" },
  { value: "READING_COMPREHENSION", label: "Reading Comprehension" },
  { value: "SENTENCE_STRUCTURE", label: "Sentence Structure" },
];

const workspacePanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/78 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const workspaceTableShellClass =
  "overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/65 dark:border-white/10 dark:bg-slate-900/50";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMathValue(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toString();
}

function buildMathTopic(operation: MathOperation) {
  return operation.toLowerCase();
}

function buildEnglishTopic(questionType: EnglishQuestionType) {
  return questionType.toLowerCase();
}

const defaultMathTemplate = NB_MATH_CURRICULUM_TEMPLATES[0];
const defaultEnglishTemplate = NB_ENGLISH_CURRICULUM_TEMPLATES[0];

function createMathForm(templateId = defaultMathTemplate.id, operation: MathOperation = defaultMathTemplate.operationOptions[0]) {
  const template = getMathCurriculumTemplate(templateId) ?? defaultMathTemplate;
  const safeOperation = template.operationOptions.includes(operation) ? operation : template.operationOptions[0];

  return {
    question: "",
    answer: "",
    remainder: "",
    operation: safeOperation,
    difficulty: "1",
    topic: template.defaultTopic,
    curriculumTemplateId: template.id,
    gradeMin: String(template.gradeMin),
    gradeMax: String(template.gradeMax),
    curriculumCode: template.curriculumCode,
    curriculumOutcome: template.curriculumOutcome,
    curriculumSourceUrl: template.sourceUrl,
  };
}

function createEnglishForm(
  templateId = defaultEnglishTemplate.id,
  questionType: EnglishQuestionType = defaultEnglishTemplate.questionTypeOptions[0],
) {
  const template = getEnglishCurriculumTemplate(templateId) ?? defaultEnglishTemplate;
  const safeType = template.questionTypeOptions.includes(questionType) ? questionType : template.questionTypeOptions[0];

  return {
    question: "",
    options: "",
    correctAnswer: "",
    questionType: safeType,
    difficulty: "1",
    topic: template.defaultTopic,
    curriculumTemplateId: template.id,
    gradeMin: String(template.gradeMin),
    gradeMax: String(template.gradeMax),
    curriculumCode: template.curriculumCode,
    curriculumOutcome: template.curriculumOutcome,
    curriculumSourceUrl: template.sourceUrl,
  };
}

export function ParentContentManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("math");
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mathQuestions, setMathQuestions] = useState<MathQuestionRecord[]>([]);
  const [mathLoading, setMathLoading] = useState(true);
  const [savingMath, setSavingMath] = useState(false);
  const [mathFilters, setMathFilters] = useState({
    operation: "ALL",
    difficulty: "5",
    grade: "ALL",
  });
  const [mathForm, setMathForm] = useState(() => createMathForm());

  const [englishQuestions, setEnglishQuestions] = useState<EnglishQuestionRecord[]>([]);
  const [englishLoading, setEnglishLoading] = useState(true);
  const [savingEnglish, setSavingEnglish] = useState(false);
  const [englishFilters, setEnglishFilters] = useState({
    type: "ALL",
    difficulty: "5",
    topic: "",
    grade: "ALL",
  });
  const [englishForm, setEnglishForm] = useState(() => createEnglishForm());

  const handleUnauthorized = () => {
    toast({
      title: "Session expired",
      description: "Please sign in again on the parent dashboard.",
      variant: "destructive",
    });
    router.push("/parent");
  };

  const fetchJson = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(payload?.error || "Request failed.");
    }

    return payload;
  };

  const loadMathQuestions = async () => {
    setMathLoading(true);
    setPageError(null);

    try {
      const url = new URL("/api/questions/math", window.location.origin);
      url.searchParams.set("admin", "1");
      url.searchParams.set("limit", "200");
      url.searchParams.set("difficulty", mathFilters.difficulty);
      if (mathFilters.operation !== "ALL") {
        url.searchParams.set("operation", mathFilters.operation);
      }
      if (mathFilters.grade !== "ALL") {
        url.searchParams.set("grade", mathFilters.grade);
      }

      const payload = await fetchJson(url.toString());
      setMathQuestions(payload.questions || []);
    } catch (error) {
      if (error instanceof Error && error.message !== "Unauthorized") {
        setPageError(error.message);
      }
    } finally {
      setMathLoading(false);
    }
  };

  const loadEnglishQuestions = async () => {
    setEnglishLoading(true);
    setPageError(null);

    try {
      const url = new URL("/api/questions/english", window.location.origin);
      url.searchParams.set("admin", "1");
      url.searchParams.set("limit", "200");
      url.searchParams.set("difficulty", englishFilters.difficulty);
      if (englishFilters.type !== "ALL") {
        url.searchParams.set("type", englishFilters.type);
      }
      if (englishFilters.grade !== "ALL") {
        url.searchParams.set("grade", englishFilters.grade);
      }
      if (englishFilters.topic.trim()) {
        url.searchParams.set("topic", englishFilters.topic.trim());
      }

      const payload = await fetchJson(url.toString());
      setEnglishQuestions(payload.questions || []);
    } catch (error) {
      if (error instanceof Error && error.message !== "Unauthorized") {
        setPageError(error.message);
      }
    } finally {
      setEnglishLoading(false);
    }
  };

  useEffect(() => {
    void loadMathQuestions();
  }, [mathFilters.difficulty, mathFilters.grade, mathFilters.operation]);

  useEffect(() => {
    void loadEnglishQuestions();
  }, [englishFilters.difficulty, englishFilters.grade, englishFilters.topic, englishFilters.type]);

  const submitMathQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingMath(true);
    setPageError(null);
    setSuccessMessage(null);

    try {
      await fetchJson("/api/questions/math", {
        method: "POST",
        body: JSON.stringify({
          question: mathForm.question,
          answer: Number(mathForm.answer),
          remainder: mathForm.remainder === "" ? null : Number(mathForm.remainder),
          operation: mathForm.operation,
          difficulty: Number(mathForm.difficulty),
          topic: mathForm.topic.trim() || buildMathTopic(mathForm.operation),
          gradeMin: Number(mathForm.gradeMin),
          gradeMax: Number(mathForm.gradeMax),
          curriculumCode: mathForm.curriculumCode,
          curriculumOutcome: mathForm.curriculumOutcome,
          curriculumSourceUrl: mathForm.curriculumSourceUrl,
        }),
      });

      setMathForm(createMathForm(mathForm.curriculumTemplateId, mathForm.operation));

      toast({
        title: "Math question added",
        description: "The question is now available in the math question bank.",
      });
      setSuccessMessage("Math library updated. The new question is now part of the active bank.");

      await loadMathQuestions();
    } catch (error) {
      if (error instanceof Error && error.message !== "Unauthorized") {
        setPageError(error.message);
        toast({
          title: "Could not add math question",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSavingMath(false);
    }
  };

  const submitEnglishQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingEnglish(true);
    setPageError(null);
    setSuccessMessage(null);

    try {
      await fetchJson("/api/questions/english", {
        method: "POST",
        body: JSON.stringify({
          question: englishForm.question,
          options: englishForm.options,
          correctAnswer: englishForm.correctAnswer,
          questionType: englishForm.questionType,
          difficulty: Number(englishForm.difficulty),
          topic: englishForm.topic.trim() || buildEnglishTopic(englishForm.questionType),
          gradeMin: Number(englishForm.gradeMin),
          gradeMax: Number(englishForm.gradeMax),
          curriculumCode: englishForm.curriculumCode,
          curriculumOutcome: englishForm.curriculumOutcome,
          curriculumSourceUrl: englishForm.curriculumSourceUrl,
        }),
      });

      setEnglishForm(createEnglishForm(englishForm.curriculumTemplateId, englishForm.questionType));

      toast({
        title: "English question added",
        description: "The question is now available in the English question bank.",
      });
      setSuccessMessage("English library updated. The new question is now part of the active bank.");

      await loadEnglishQuestions();
    } catch (error) {
      if (error instanceof Error && error.message !== "Unauthorized") {
        setPageError(error.message);
        toast({
          title: "Could not add English question",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSavingEnglish(false);
    }
  };

  const mathTopicCount = new Set(mathQuestions.map((question) => question.topic)).size;
  const englishTopicCount = new Set(englishQuestions.map((question) => question.topic)).size;

  return (
    <ParentWorkspaceShell
      currentSection="content"
      title="Question Content"
      description="Shape the active learning library with cleaner editorial tools for math and English content."
      icon={<BookOpen className="h-6 w-6" />}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-full border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5">
            <Link href="/parent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <ThemeToggle />
        </>
      }
      metrics={[
        { label: "Math Library", value: `${mathQuestions.length} loaded` },
        { label: "English Library", value: `${englishQuestions.length} loaded` },
        { label: "Math Topics", value: `${mathTopicCount}` },
        { label: "English Topics", value: `${englishTopicCount}` },
      ]}
    >
      <MotionGroup className="space-y-6">
        {pageError ? (
          <Alert variant="destructive" className="rounded-[1.5rem] border-red-200/80 bg-white/90 dark:border-red-500/30 dark:bg-red-950/20">
            <AlertTitle>Something needs attention</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="rounded-[1.5rem] border-emerald-200/80 bg-white/90 dark:border-emerald-500/30 dark:bg-emerald-950/10">
            <AlertTitle>Library updated</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full border border-white/70 bg-white/72 p-1 shadow-sm dark:border-white/10 dark:bg-slate-950/55">
            <TabsTrigger value="math">Math</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
          </TabsList>

          <TabsContent value="math" className="space-y-6">
            <MotionItem>
              <Card className={workspacePanelClass}>
                <CardContent className="p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#244ad8_0%,#4f7cff_56%,#8ba7ff_100%)] p-6 text-white shadow-[0_24px_60px_rgba(79,124,255,0.2)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/12 text-white">
                          Math Editor
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                          {mathQuestions.length} loaded
                        </Badge>
                      </div>
                      <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                        Keep the question bank aligned with the learner experience, not just filled with entries.
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                        Review what the learner will actually pull, tune filters, and add only the prompts that strengthen the current math flow.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Topic coverage</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{mathTopicCount} topics</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">See whether the bank is broad enough before adding more of the same pattern.</p>
                      </div>
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Difficulty window</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">Up to {mathFilters.difficulty}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Quickly narrow the bank to what matches the learner path you want to inspect.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Loaded questions</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">{mathQuestions.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Topics in view</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">{mathTopicCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Current difficulty cap</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">Up to {mathFilters.difficulty}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className={workspacePanelClass}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display">Math library</CardTitle>
                  </div>
                  <CardDescription>
                    Filter the current math bank and review what the learner will pull from.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="math-operation-filter">Operation</Label>
                      <Select
                        value={mathFilters.operation}
                        onValueChange={(value) => setMathFilters((current) => ({ ...current, operation: value }))}
                      >
                        <SelectTrigger id="math-operation-filter" className="w-full">
                          <SelectValue placeholder="All operations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All operations</SelectItem>
                          {mathOperationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="math-difficulty-filter">Max difficulty</Label>
                      <Select
                        value={mathFilters.difficulty}
                        onValueChange={(value) => setMathFilters((current) => ({ ...current, difficulty: value }))}
                      >
                        <SelectTrigger id="math-difficulty-filter" className="w-full">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1", "2", "3", "4", "5"].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="math-grade-filter">Grade</Label>
                      <Select
                        value={mathFilters.grade}
                        onValueChange={(value) => setMathFilters((current) => ({ ...current, grade: value }))}
                      >
                        <SelectTrigger id="math-grade-filter" className="w-full">
                          <SelectValue placeholder="All grades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All grades</SelectItem>
                          {["1", "2", "3", "4", "5", "6"].map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className={workspaceTableShellClass}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[36%]">Question</TableHead>
                          <TableHead>Answer</TableHead>
                          <TableHead>Operation</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Grades</TableHead>
                          <TableHead>Curriculum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mathLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading math questions
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : mathQuestions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                              No questions matched these filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          mathQuestions.map((question) => (
                            <TableRow key={question.id}>
                              <TableCell className="max-w-xl whitespace-normal font-medium text-slate-900">
                                {question.question}
                              </TableCell>
                              <TableCell>
                                {question.remainder !== null && typeof question.remainder !== "undefined"
                                  ? `${formatMathValue(question.answer)} R ${question.remainder}`
                                  : formatMathValue(question.answer)}
                              </TableCell>
                              <TableCell>{formatLabel(question.operation)}</TableCell>
                              <TableCell>{question.difficulty}</TableCell>
                              <TableCell>{formatGradeLabel(question.gradeMin)}-{formatGradeLabel(question.gradeMax)}</TableCell>
                              <TableCell className="max-w-[16rem] whitespace-normal text-xs text-slate-600">
                                <div className="font-medium text-slate-900">{question.curriculumCode ?? question.topic}</div>
                                <div>{question.curriculumOutcome ?? question.topic}</div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className={workspacePanelClass}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display">Add math question</CardTitle>
                  </div>
                  <CardDescription>
                    Tie every new math question to a New Brunswick curriculum target before it enters the active bank.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={submitMathQuestion}>
                    <div className="space-y-2">
                      <Label htmlFor="math-curriculum-template">Curriculum target</Label>
                      <Select
                        value={mathForm.curriculumTemplateId}
                        onValueChange={(value) => {
                          const template = getMathCurriculumTemplate(value) ?? defaultMathTemplate;
                          setMathForm(createMathForm(template.id, template.operationOptions[0]));
                        }}
                      >
                        <SelectTrigger id="math-curriculum-template" className="w-full">
                          <SelectValue placeholder="Select curriculum target" />
                        </SelectTrigger>
                        <SelectContent>
                          {NB_MATH_CURRICULUM_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="math-question">Question</Label>
                      <Textarea
                        id="math-question"
                        value={mathForm.question}
                        onChange={(event) => setMathForm((current) => ({ ...current, question: event.target.value }))}
                        placeholder="12 x 8 = ?"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="math-answer">Answer</Label>
                        <Input
                          id="math-answer"
                          inputMode="decimal"
                          value={mathForm.answer}
                          onChange={(event) => setMathForm((current) => ({ ...current, answer: event.target.value }))}
                          placeholder="96 or 5.23"
                        />
                        <p className="text-xs text-slate-500">Use whole numbers or decimals. Keep remainders only for whole-number division.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="math-remainder">Remainder (optional)</Label>
                        <Input
                          id="math-remainder"
                          inputMode="numeric"
                          value={mathForm.remainder}
                          onChange={(event) => setMathForm((current) => ({ ...current, remainder: event.target.value }))}
                          placeholder="Leave blank unless needed"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="math-form-difficulty">Difficulty</Label>
                        <Select
                          value={mathForm.difficulty}
                          onValueChange={(value) => setMathForm((current) => ({ ...current, difficulty: value }))}
                        >
                          <SelectTrigger id="math-form-difficulty" className="w-full">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {["1", "2", "3", "4", "5"].map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="math-grade-min">Minimum grade</Label>
                        <Input
                          id="math-grade-min"
                          value={mathForm.gradeMin}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-900/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="math-grade-max">Maximum grade</Label>
                        <Input
                          id="math-grade-max"
                          value={mathForm.gradeMax}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-900/60"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="math-form-operation">Operation</Label>
                        <Select
                          value={mathForm.operation}
                          onValueChange={(value: MathOperation) =>
                            setMathForm((current) => ({
                              ...current,
                              operation: value,
                              topic: buildMathTopic(value),
                            }))
                          }
                        >
                          <SelectTrigger id="math-form-operation" className="w-full">
                            <SelectValue placeholder="Operation" />
                          </SelectTrigger>
                          <SelectContent>
                            {(getMathCurriculumTemplate(mathForm.curriculumTemplateId)?.operationOptions ?? mathOperationOptions.map((option) => option.value)).map((value) => {
                              const option = mathOperationOptions.find((item) => item.value === value);
                              if (!option) return null;

                              return (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="math-topic">Topic slug</Label>
                        <Input
                          id="math-topic"
                          value={mathForm.topic}
                          onChange={(event) => setMathForm((current) => ({ ...current, topic: event.target.value }))}
                          placeholder="multiplication"
                        />
                        <p className="text-xs text-slate-500">Leave it aligned with the operation unless you have matching learner filters.</p>
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/65 p-4 text-sm dark:border-white/10 dark:bg-slate-900/45">
                      <div className="font-medium text-slate-900 dark:text-slate-50">{mathForm.curriculumCode}</div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{mathForm.curriculumOutcome}</p>
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200" disabled={savingMath}>
                      {savingMath ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving
                        </span>
                      ) : (
                        "Add math question"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="english" className="space-y-6">
            <MotionItem>
              <Card className={workspacePanelClass}>
                <CardContent className="p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#a83a7a_0%,#dd5c93_56%,#ff9f8f_100%)] p-6 text-white shadow-[0_24px_60px_rgba(221,92,147,0.18)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/12 text-white">
                          English Editor
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                          {englishQuestions.length} loaded
                        </Badge>
                      </div>
                      <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                        Keep reading and language content curated enough to feel intentional.
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                        Review prompts, answer sets, and topic coverage before expanding the bank so the learner experience stays coherent.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Topic coverage</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{englishTopicCount} topics</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A quick read on whether the language bank is too narrow or too noisy.</p>
                      </div>
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Difficulty window</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">Up to {englishFilters.difficulty}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use the current view to validate pacing before adding harder items.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Loaded questions</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">{englishQuestions.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Topics in view</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">{englishTopicCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className={workspacePanelClass}>
                <CardHeader className="pb-3">
                  <CardDescription className="uppercase tracking-[0.2em] text-[11px]">Current difficulty cap</CardDescription>
                  <CardTitle className="font-display text-3xl text-slate-900">Up to {englishFilters.difficulty}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className={workspacePanelClass}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-rose-100 p-2 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display">English library</CardTitle>
                  </div>
                  <CardDescription>
                    Review current prompts, answer sets, and curriculum coverage before adding more content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="english-type-filter">Question type</Label>
                      <Select
                        value={englishFilters.type}
                        onValueChange={(value) => setEnglishFilters((current) => ({ ...current, type: value }))}
                      >
                        <SelectTrigger id="english-type-filter" className="w-full">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All types</SelectItem>
                          {englishTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-difficulty-filter">Max difficulty</Label>
                      <Select
                        value={englishFilters.difficulty}
                        onValueChange={(value) => setEnglishFilters((current) => ({ ...current, difficulty: value }))}
                      >
                        <SelectTrigger id="english-difficulty-filter" className="w-full">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1", "2", "3", "4", "5"].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-topic-filter">Topic slug</Label>
                      <Input
                        id="english-topic-filter"
                        value={englishFilters.topic}
                        onChange={(event) => setEnglishFilters((current) => ({ ...current, topic: event.target.value }))}
                        placeholder="Optional exact topic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-grade-filter">Grade</Label>
                      <Select
                        value={englishFilters.grade}
                        onValueChange={(value) => setEnglishFilters((current) => ({ ...current, grade: value }))}
                      >
                        <SelectTrigger id="english-grade-filter" className="w-full">
                          <SelectValue placeholder="All grades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All grades</SelectItem>
                          {["1", "2", "3", "4", "5", "6"].map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className={workspaceTableShellClass}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[24%]">Question</TableHead>
                          <TableHead className="w-[18%]">Options</TableHead>
                          <TableHead>Correct answer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Grades</TableHead>
                          <TableHead>Curriculum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {englishLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading English questions
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : englishQuestions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                              No questions matched these filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          englishQuestions.map((question) => (
                            <TableRow key={question.id}>
                              <TableCell className="max-w-xl whitespace-normal font-medium text-slate-900">
                                <div>{question.question}</div>
                                <div className="mt-2 text-xs text-slate-500">Topic: {question.topic}</div>
                              </TableCell>
                              <TableCell className="max-w-sm whitespace-normal text-slate-600">
                                {question.options.join(" / ")}
                              </TableCell>
                              <TableCell className="max-w-xs whitespace-normal">{question.correctAnswer}</TableCell>
                              <TableCell>{formatLabel(question.questionType)}</TableCell>
                              <TableCell>{question.difficulty}</TableCell>
                              <TableCell>{formatGradeLabel(question.gradeMin)}-{formatGradeLabel(question.gradeMax)}</TableCell>
                              <TableCell className="max-w-[16rem] whitespace-normal text-xs text-slate-600">
                                <div className="font-medium text-slate-900">{question.curriculumCode ?? question.topic}</div>
                                <div>{question.curriculumOutcome ?? question.topic}</div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className={workspacePanelClass}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display">Add English question</CardTitle>
                  </div>
                  <CardDescription>
                    Tie each prompt to a New Brunswick reading or writing target before it enters the active bank.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={submitEnglishQuestion}>
                    <div className="space-y-2">
                      <Label htmlFor="english-curriculum-template">Curriculum target</Label>
                      <Select
                        value={englishForm.curriculumTemplateId}
                        onValueChange={(value) => {
                          const template = getEnglishCurriculumTemplate(value) ?? defaultEnglishTemplate;
                          setEnglishForm(createEnglishForm(template.id, template.questionTypeOptions[0]));
                        }}
                      >
                        <SelectTrigger id="english-curriculum-template" className="w-full">
                          <SelectValue placeholder="Select curriculum target" />
                        </SelectTrigger>
                        <SelectContent>
                          {NB_ENGLISH_CURRICULUM_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-question">Question</Label>
                      <Textarea
                        id="english-question"
                        value={englishForm.question}
                        onChange={(event) => setEnglishForm((current) => ({ ...current, question: event.target.value }))}
                        placeholder="Which sentence is punctuated correctly?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-options">Options</Label>
                      <Textarea
                        id="english-options"
                        value={englishForm.options}
                        onChange={(event) => setEnglishForm((current) => ({ ...current, options: event.target.value }))}
                        placeholder={"Option 1\nOption 2\nOption 3\nOption 4"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-correct-answer">Correct answer</Label>
                      <Input
                        id="english-correct-answer"
                        value={englishForm.correctAnswer}
                        onChange={(event) => setEnglishForm((current) => ({ ...current, correctAnswer: event.target.value }))}
                        placeholder="Option 2"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="english-question-type">Question type</Label>
                        <Select
                          value={englishForm.questionType}
                          onValueChange={(value: EnglishQuestionType) =>
                            setEnglishForm((current) => ({
                              ...current,
                              questionType: value,
                              topic:
                                current.topic === buildEnglishTopic(current.questionType) || !current.topic.trim()
                                  ? buildEnglishTopic(value)
                                  : current.topic,
                            }))
                          }
                        >
                          <SelectTrigger id="english-question-type" className="w-full">
                            <SelectValue placeholder="Question type" />
                          </SelectTrigger>
                          <SelectContent>
                            {(getEnglishCurriculumTemplate(englishForm.curriculumTemplateId)?.questionTypeOptions ?? englishTypeOptions.map((option) => option.value)).map((value) => {
                              const option = englishTypeOptions.find((item) => item.value === value);
                              if (!option) return null;

                              return (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="english-form-difficulty">Difficulty</Label>
                        <Select
                          value={englishForm.difficulty}
                          onValueChange={(value) => setEnglishForm((current) => ({ ...current, difficulty: value }))}
                        >
                          <SelectTrigger id="english-form-difficulty" className="w-full">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {["1", "2", "3", "4", "5"].map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="english-grade-min">Minimum grade</Label>
                        <Input
                          id="english-grade-min"
                          value={englishForm.gradeMin}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-900/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="english-grade-max">Maximum grade</Label>
                        <Input
                          id="english-grade-max"
                          value={englishForm.gradeMax}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-900/60"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-topic">Topic slug</Label>
                      <Input
                        id="english-topic"
                        value={englishForm.topic}
                        onChange={(event) => setEnglishForm((current) => ({ ...current, topic: event.target.value }))}
                        placeholder="grammar"
                      />
                    </div>
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/65 p-4 text-sm dark:border-white/10 dark:bg-slate-900/45">
                      <div className="font-medium text-slate-900 dark:text-slate-50">{englishForm.curriculumCode}</div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{englishForm.curriculumOutcome}</p>
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200" disabled={savingEnglish}>
                      {savingEnglish ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving
                        </span>
                      ) : (
                        "Add English question"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </MotionGroup>
    </ParentWorkspaceShell>
  );
}
