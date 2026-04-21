import { EnglishQuestionType, MathOperation } from "@prisma/client";

export type CurriculumSubject = "math" | "english";

type BaseCurriculumTemplate = {
  id: string;
  subject: CurriculumSubject;
  label: string;
  gradeMin: number;
  gradeMax: number;
  curriculumCode: string;
  curriculumOutcome: string;
  sourceUrl: string;
};

export type MathCurriculumTemplate = BaseCurriculumTemplate & {
  subject: "math";
  operationOptions: MathOperation[];
  defaultTopic: string;
};

export type EnglishCurriculumTemplate = BaseCurriculumTemplate & {
  subject: "english";
  questionTypeOptions: EnglishQuestionType[];
  defaultTopic: string;
};

export const NB_MATH_CURRICULUM_TEMPLATES: MathCurriculumTemplate[] = [
  {
    id: "nb-math-g1-n9",
    subject: "math",
    label: "NB Grade 1 Addition and Subtraction",
    gradeMin: 1,
    gradeMax: 1,
    curriculumCode: "NB Math Grade 1 N9",
    curriculumOutcome:
      "Demonstrate addition to 20 and corresponding subtraction facts using concrete, pictorial, and symbolic representations in context.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade1.pdf",
    operationOptions: [MathOperation.ADDITION, MathOperation.SUBTRACTION],
    defaultTopic: "addition_subtraction_facts",
  },
  {
    id: "nb-math-g2-n9",
    subject: "math",
    label: "NB Grade 2 Addition and Subtraction",
    gradeMin: 2,
    gradeMax: 2,
    curriculumCode: "NB Math Grade 2 N9",
    curriculumOutcome:
      "Demonstrate addition and corresponding subtraction with 1- and 2-digit numerals to 100 using personal strategies and contextual problems.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade2.pdf",
    operationOptions: [MathOperation.ADDITION, MathOperation.SUBTRACTION],
    defaultTopic: "addition_subtraction_to_100",
  },
  {
    id: "nb-math-g3-n11",
    subject: "math",
    label: "NB Grade 3 Multiplication Facts",
    gradeMin: 3,
    gradeMax: 3,
    curriculumCode: "NB Math Grade 3 N11",
    curriculumOutcome:
      "Demonstrate multiplication to 5 × 5 using equal grouping, arrays, contextual problems, repeated addition, and connections to division.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade3.pdf",
    operationOptions: [MathOperation.MULTIPLICATION],
    defaultTopic: "multiplication_facts",
  },
  {
    id: "nb-math-g3-n12",
    subject: "math",
    label: "NB Grade 3 Division Facts",
    gradeMin: 3,
    gradeMax: 3,
    curriculumCode: "NB Math Grade 3 N12",
    curriculumOutcome:
      "Demonstrate division through equal sharing, equal grouping, and repeated subtraction, limited to facts related to multiplication up to 5 × 5.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade3.pdf",
    operationOptions: [MathOperation.DIVISION],
    defaultTopic: "division_facts",
  },
  {
    id: "nb-math-g4-n6",
    subject: "math",
    label: "NB Grade 4 Multi-Digit Multiplication",
    gradeMin: 4,
    gradeMax: 4,
    curriculumCode: "NB Math Grade 4 N6",
    curriculumOutcome:
      "Demonstrate multiplication with 2- or 3-digit by 1-digit numbers using personal strategies, arrays, symbolic representations, and estimation.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade4.pdf",
    operationOptions: [MathOperation.MULTIPLICATION],
    defaultTopic: "multi_digit_multiplication",
  },
  {
    id: "nb-math-g4-n7",
    subject: "math",
    label: "NB Grade 4 Division Strategies",
    gradeMin: 4,
    gradeMax: 4,
    curriculumCode: "NB Math Grade 4 N7",
    curriculumOutcome:
      "Demonstrate division with a 1-digit divisor and up to a 2-digit dividend using personal strategies, estimation, and connections to multiplication.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade4.pdf",
    operationOptions: [MathOperation.DIVISION],
    defaultTopic: "division_to_2_digits",
  },
  {
    id: "nb-math-g5-n5",
    subject: "math",
    label: "NB Grade 5 Two-Digit Multiplication",
    gradeMin: 5,
    gradeMax: 5,
    curriculumCode: "NB Math Grade 5 N5",
    curriculumOutcome:
      "Demonstrate multiplication of 2-digit by 2-digit numbers to solve problems with concrete supports, area reasoning, partial products, and estimation.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade5.pdf",
    operationOptions: [MathOperation.MULTIPLICATION],
    defaultTopic: "two_digit_by_two_digit",
  },
  {
    id: "nb-math-g5-n6",
    subject: "math",
    label: "NB Grade 5 Division with Remainders",
    gradeMin: 5,
    gradeMax: 5,
    curriculumCode: "NB Math Grade 5 N6",
    curriculumOutcome:
      "Demonstrate division of 3-digit by 1-digit numbers and interpret remainders appropriately when solving contextual problems.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade5.pdf",
    operationOptions: [MathOperation.DIVISION],
    defaultTopic: "division_with_remainders",
  },
  {
    id: "nb-math-g6-n8",
    subject: "math",
    label: "NB Grade 6 Decimal Multiplication and Division",
    gradeMin: 6,
    gradeMax: 6,
    curriculumCode: "NB Math Grade 6 N8",
    curriculumOutcome:
      "Demonstrate an understanding of multiplication and division of decimals using 1-digit whole-number multipliers and 1-digit natural-number divisors.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade6.pdf",
    operationOptions: [MathOperation.MULTIPLICATION, MathOperation.DIVISION],
    defaultTopic: "decimal_multiplication_division",
  },
  {
    id: "nb-math-g7-n2",
    subject: "math",
    label: "NB Grade 7 Decimal Operations",
    gradeMin: 7,
    gradeMax: 7,
    curriculumCode: "NB Math Grade 7 N2",
    curriculumOutcome:
      "Solve problems with decimal addition, subtraction, multiplication, and division, using technology when divisors or multipliers go beyond the expected pencil-and-paper range.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/Math/Math-Grade7.pdf",
    operationOptions: [
      MathOperation.ADDITION,
      MathOperation.SUBTRACTION,
      MathOperation.MULTIPLICATION,
      MathOperation.DIVISION,
    ],
    defaultTopic: "decimal_operations",
  },
];

export const NB_ENGLISH_CURRICULUM_TEMPLATES: EnglishCurriculumTemplate[] = [
  {
    id: "nb-ela-k3-reading",
    subject: "english",
    label: "NB ELA K-3 Reading and Viewing",
    gradeMin: 1,
    gradeMax: 3,
    curriculumCode: "NB ELA K-3 Reading and Viewing",
    curriculumOutcome:
      "Select and read varied texts, use text features and cueing systems to construct meaning, ask questions, and respond critically to texts.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/English/EnglishLanguageArts-GradeK-3.pdf",
    questionTypeOptions: [EnglishQuestionType.VOCABULARY, EnglishQuestionType.READING_COMPREHENSION],
    defaultTopic: "k3_reading_viewing",
  },
  {
    id: "nb-ela-k3-writing",
    subject: "english",
    label: "NB ELA K-3 Writing and Representing",
    gradeMin: 1,
    gradeMax: 3,
    curriculumCode: "NB ELA K-3 Writing and Representing",
    curriculumOutcome:
      "Use writing and other representations to formulate questions, organize ideas, experiment with language, create texts, and apply conventions with support.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/English/EnglishLanguageArts-GradeK-3.pdf",
    questionTypeOptions: [EnglishQuestionType.GRAMMAR, EnglishQuestionType.SENTENCE_STRUCTURE],
    defaultTopic: "k3_writing_representing",
  },
  {
    id: "nb-ela-4-6-reading",
    subject: "english",
    label: "NB ELA 4-6 Reading and Viewing",
    gradeMin: 4,
    gradeMax: 6,
    curriculumCode: "NB ELA 4-6 GCO 4",
    curriculumOutcome:
      "Select, read, and view texts with growing independence, using text features, context, structural analysis, and cueing systems to construct meaning.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/English/EnglishLanguageArts-Grade4-6.pdf",
    questionTypeOptions: [EnglishQuestionType.VOCABULARY, EnglishQuestionType.READING_COMPREHENSION],
    defaultTopic: "4_6_reading_viewing",
  },
  {
    id: "nb-ela-4-6-writing",
    subject: "english",
    label: "NB ELA 4-6 Writing and Representing",
    gradeMin: 4,
    gradeMax: 6,
    curriculumCode: "NB ELA 4-6 GCO 9",
    curriculumOutcome:
      "Create texts collaboratively and independently, choosing language and structures that fit audience, purpose, form, and clear written communication.",
    sourceUrl: "https://www2.gnb.ca/content/dam/gnb/Departments/ed/pdf/K12/curric/English/EnglishLanguageArts-Grade4-6.pdf",
    questionTypeOptions: [EnglishQuestionType.GRAMMAR, EnglishQuestionType.SENTENCE_STRUCTURE],
    defaultTopic: "4_6_writing_representing",
  },
];

export function getMathCurriculumTemplate(id: string) {
  return NB_MATH_CURRICULUM_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function getEnglishCurriculumTemplate(id: string) {
  return NB_ENGLISH_CURRICULUM_TEMPLATES.find((template) => template.id === id) ?? null;
}
