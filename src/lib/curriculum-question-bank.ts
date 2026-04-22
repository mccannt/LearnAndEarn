import { EnglishQuestionType, MathOperation } from "@prisma/client";

import {
  NB_ENGLISH_CURRICULUM_TEMPLATES,
  NB_MATH_CURRICULUM_TEMPLATES,
} from "@/lib/curriculum";

export type SeedMathQuestion = {
  seedKey: string;
  question: string;
  answer: number;
  remainder?: number | null;
  operation: MathOperation;
  difficulty: number;
  topic: string;
  gradeMin: number;
  gradeMax: number;
  curriculumCode: string;
  curriculumOutcome: string;
  curriculumSourceUrl: string;
};

export type SeedEnglishQuestion = {
  seedKey: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: EnglishQuestionType;
  difficulty: number;
  topic: string;
  gradeMin: number;
  gradeMax: number;
  curriculumCode: string;
  curriculumOutcome: string;
  curriculumSourceUrl: string;
};

const mathById = Object.fromEntries(
  NB_MATH_CURRICULUM_TEMPLATES.map((template) => [template.id, template]),
) as Record<string, (typeof NB_MATH_CURRICULUM_TEMPLATES)[number]>;

const englishById = Object.fromEntries(
  NB_ENGLISH_CURRICULUM_TEMPLATES.map((template) => [template.id, template]),
) as Record<string, (typeof NB_ENGLISH_CURRICULUM_TEMPLATES)[number]>;

function withMathTemplate(
  templateId: string,
  question: Omit<SeedMathQuestion, "gradeMin" | "gradeMax" | "curriculumCode" | "curriculumOutcome" | "curriculumSourceUrl">,
): SeedMathQuestion {
  const template = mathById[templateId];

  return {
    ...question,
    gradeMin: template.gradeMin,
    gradeMax: template.gradeMax,
    curriculumCode: template.curriculumCode,
    curriculumOutcome: template.curriculumOutcome,
    curriculumSourceUrl: template.sourceUrl,
  };
}

function withEnglishTemplate(
  templateId: string,
  question: Omit<SeedEnglishQuestion, "gradeMin" | "gradeMax" | "curriculumCode" | "curriculumOutcome" | "curriculumSourceUrl">,
): SeedEnglishQuestion {
  const template = englishById[templateId];

  return {
    ...question,
    gradeMin: template.gradeMin,
    gradeMax: template.gradeMax,
    curriculumCode: template.curriculumCode,
    curriculumOutcome: template.curriculumOutcome,
    curriculumSourceUrl: template.sourceUrl,
  };
}

export const curriculumMathQuestions: SeedMathQuestion[] = [
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-add-01",
    question: "8 + 5 = ?",
    answer: 13,
    operation: MathOperation.ADDITION,
    difficulty: 1,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-sub-01",
    question: "15 - 7 = ?",
    answer: 8,
    operation: MathOperation.SUBTRACTION,
    difficulty: 1,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-add-02",
    question: "9 + 9 = ?",
    answer: 18,
    operation: MathOperation.ADDITION,
    difficulty: 2,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-sub-02",
    question: "20 - 6 = ?",
    answer: 14,
    operation: MathOperation.SUBTRACTION,
    difficulty: 2,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-add-03",
    question: "7 + 8 = ?",
    answer: 15,
    operation: MathOperation.ADDITION,
    difficulty: 1,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g1-n9", {
    seedKey: "nb-math-g1-sub-03",
    question: "18 - 9 = ?",
    answer: 9,
    operation: MathOperation.SUBTRACTION,
    difficulty: 2,
    topic: "addition_subtraction_facts",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-add-01",
    question: "37 + 25 = ?",
    answer: 62,
    operation: MathOperation.ADDITION,
    difficulty: 2,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-sub-01",
    question: "83 - 27 = ?",
    answer: 56,
    operation: MathOperation.SUBTRACTION,
    difficulty: 2,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-add-02",
    question: "46 + 18 = ?",
    answer: 64,
    operation: MathOperation.ADDITION,
    difficulty: 3,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-sub-02",
    question: "92 - 35 = ?",
    answer: 57,
    operation: MathOperation.SUBTRACTION,
    difficulty: 3,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-add-03",
    question: "58 + 16 = ?",
    answer: 74,
    operation: MathOperation.ADDITION,
    difficulty: 3,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g2-n9", {
    seedKey: "nb-math-g2-sub-03",
    question: "71 - 18 = ?",
    answer: 53,
    operation: MathOperation.SUBTRACTION,
    difficulty: 3,
    topic: "addition_subtraction_to_100",
  }),
  withMathTemplate("nb-math-g3-n11", {
    seedKey: "nb-math-g3-mul-01",
    question: "4 × 5 = ?",
    answer: 20,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 1,
    topic: "multiplication_facts",
  }),
  withMathTemplate("nb-math-g3-n11", {
    seedKey: "nb-math-g3-mul-02",
    question: "3 × 4 = ?",
    answer: 12,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 1,
    topic: "multiplication_facts",
  }),
  withMathTemplate("nb-math-g3-n11", {
    seedKey: "nb-math-g3-mul-03",
    question: "5 × 5 = ?",
    answer: 25,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 2,
    topic: "multiplication_facts",
  }),
  withMathTemplate("nb-math-g3-n11", {
    seedKey: "nb-math-g3-mul-04",
    question: "2 × 5 = ?",
    answer: 10,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 1,
    topic: "multiplication_facts",
  }),
  withMathTemplate("nb-math-g3-n11", {
    seedKey: "nb-math-g3-mul-05",
    question: "4 × 4 = ?",
    answer: 16,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 2,
    topic: "multiplication_facts",
  }),
  withMathTemplate("nb-math-g3-n12", {
    seedKey: "nb-math-g3-div-01",
    question: "20 ÷ 5 = ?",
    answer: 4,
    operation: MathOperation.DIVISION,
    difficulty: 1,
    topic: "division_facts",
  }),
  withMathTemplate("nb-math-g3-n12", {
    seedKey: "nb-math-g3-div-02",
    question: "15 ÷ 3 = ?",
    answer: 5,
    operation: MathOperation.DIVISION,
    difficulty: 1,
    topic: "division_facts",
  }),
  withMathTemplate("nb-math-g3-n12", {
    seedKey: "nb-math-g3-div-03",
    question: "25 ÷ 5 = ?",
    answer: 5,
    operation: MathOperation.DIVISION,
    difficulty: 2,
    topic: "division_facts",
  }),
  withMathTemplate("nb-math-g3-n12", {
    seedKey: "nb-math-g3-div-04",
    question: "12 ÷ 4 = ?",
    answer: 3,
    operation: MathOperation.DIVISION,
    difficulty: 1,
    topic: "division_facts",
  }),
  withMathTemplate("nb-math-g3-n12", {
    seedKey: "nb-math-g3-div-05",
    question: "16 ÷ 4 = ?",
    answer: 4,
    operation: MathOperation.DIVISION,
    difficulty: 2,
    topic: "division_facts",
  }),
  withMathTemplate("nb-math-g4-n6", {
    seedKey: "nb-math-g4-mul-01",
    question: "34 × 3 = ?",
    answer: 102,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 3,
    topic: "multi_digit_multiplication",
  }),
  withMathTemplate("nb-math-g4-n6", {
    seedKey: "nb-math-g4-mul-02",
    question: "206 × 4 = ?",
    answer: 824,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "multi_digit_multiplication",
  }),
  withMathTemplate("nb-math-g4-n6", {
    seedKey: "nb-math-g4-mul-03",
    question: "58 × 7 = ?",
    answer: 406,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "multi_digit_multiplication",
  }),
  withMathTemplate("nb-math-g4-n6", {
    seedKey: "nb-math-g4-mul-04",
    question: "142 × 3 = ?",
    answer: 426,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "multi_digit_multiplication",
  }),
  withMathTemplate("nb-math-g4-n7", {
    seedKey: "nb-math-g4-div-01",
    question: "84 ÷ 6 = ?",
    answer: 14,
    operation: MathOperation.DIVISION,
    difficulty: 3,
    topic: "division_to_2_digits",
  }),
  withMathTemplate("nb-math-g4-n7", {
    seedKey: "nb-math-g4-div-02",
    question: "95 ÷ 4 = ? Write quotient and remainder as q R r.",
    answer: 23,
    remainder: 3,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "division_to_2_digits",
  }),
  withMathTemplate("nb-math-g4-n7", {
    seedKey: "nb-math-g4-div-03",
    question: "96 ÷ 8 = ?",
    answer: 12,
    operation: MathOperation.DIVISION,
    difficulty: 3,
    topic: "division_to_2_digits",
  }),
  withMathTemplate("nb-math-g4-n7", {
    seedKey: "nb-math-g4-div-04",
    question: "73 ÷ 5 = ? Write quotient and remainder as q R r.",
    answer: 14,
    remainder: 3,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "division_to_2_digits",
  }),
  withMathTemplate("nb-math-g5-n5", {
    seedKey: "nb-math-g5-mul-01",
    question: "23 × 14 = ?",
    answer: 322,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "two_digit_by_two_digit",
  }),
  withMathTemplate("nb-math-g5-n5", {
    seedKey: "nb-math-g5-mul-02",
    question: "36 × 27 = ?",
    answer: 972,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 5,
    topic: "two_digit_by_two_digit",
  }),
  withMathTemplate("nb-math-g5-n5", {
    seedKey: "nb-math-g5-mul-03",
    question: "48 × 16 = ?",
    answer: 768,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "two_digit_by_two_digit",
  }),
  withMathTemplate("nb-math-g5-n5", {
    seedKey: "nb-math-g5-mul-04",
    question: "57 × 23 = ?",
    answer: 1311,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 5,
    topic: "two_digit_by_two_digit",
  }),
  withMathTemplate("nb-math-g5-n6", {
    seedKey: "nb-math-g5-div-01",
    question: "432 ÷ 8 = ?",
    answer: 54,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "division_with_remainders",
  }),
  withMathTemplate("nb-math-g5-n6", {
    seedKey: "nb-math-g5-div-02",
    question: "347 ÷ 6 = ? Write quotient and remainder as q R r.",
    answer: 57,
    remainder: 5,
    operation: MathOperation.DIVISION,
    difficulty: 5,
    topic: "division_with_remainders",
  }),
  withMathTemplate("nb-math-g5-n6", {
    seedKey: "nb-math-g5-div-03",
    question: "648 ÷ 9 = ?",
    answer: 72,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "division_with_remainders",
  }),
  withMathTemplate("nb-math-g5-n6", {
    seedKey: "nb-math-g5-div-04",
    question: "521 ÷ 4 = ? Write quotient and remainder as q R r.",
    answer: 130,
    remainder: 1,
    operation: MathOperation.DIVISION,
    difficulty: 5,
    topic: "division_with_remainders",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-mul-01",
    question: "2.34 × 6 = ?",
    answer: 14.04,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 3,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-mul-02",
    question: "4.8 × 7 = ?",
    answer: 33.6,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 3,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-mul-03",
    question: "15.205 × 4 = ?",
    answer: 60.82,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-mul-04",
    question: "8.75 × 8 = ?",
    answer: 70,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 4,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-div-01",
    question: "25.2 ÷ 4 = ?",
    answer: 6.3,
    operation: MathOperation.DIVISION,
    difficulty: 3,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-div-02",
    question: "14.56 ÷ 4 = ?",
    answer: 3.64,
    operation: MathOperation.DIVISION,
    difficulty: 3,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-div-03",
    question: "74.4 ÷ 8 = ?",
    answer: 9.3,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g6-n8", {
    seedKey: "nb-math-g6-div-04",
    question: "93.25 ÷ 5 = ?",
    answer: 18.65,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "decimal_multiplication_division",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-add-01",
    question: "4.5 + 0.73 = ?",
    answer: 5.23,
    operation: MathOperation.ADDITION,
    difficulty: 2,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-add-02",
    question: "12.4 + 3.08 = ?",
    answer: 15.48,
    operation: MathOperation.ADDITION,
    difficulty: 3,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-sub-01",
    question: "9.2 - 1.75 = ?",
    answer: 7.45,
    operation: MathOperation.SUBTRACTION,
    difficulty: 3,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-sub-02",
    question: "15.08 - 6.4 = ?",
    answer: 8.68,
    operation: MathOperation.SUBTRACTION,
    difficulty: 3,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-mul-01",
    question: "2.4 × 3 = ?",
    answer: 7.2,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 2,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-mul-02",
    question: "1.25 × 4 = ?",
    answer: 5,
    operation: MathOperation.MULTIPLICATION,
    difficulty: 3,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-div-01",
    question: "7.5 ÷ 3 = ?",
    answer: 2.5,
    operation: MathOperation.DIVISION,
    difficulty: 2,
    topic: "decimal_operations",
  }),
  withMathTemplate("nb-math-g7-n2", {
    seedKey: "nb-math-g7-div-02",
    question: "5.4 ÷ 0.9 = ?",
    answer: 6,
    operation: MathOperation.DIVISION,
    difficulty: 4,
    topic: "decimal_operations",
  }),
];

export const curriculumEnglishQuestions: SeedEnglishQuestion[] = [
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-grammar-01",
    question: "Which sentence is written correctly?",
    options: [
      "my dog likes to play outside",
      "My dog likes to play outside.",
      "My Dog likes to play outside",
      "my Dog likes to play outside.",
    ],
    correctAnswer: "My dog likes to play outside.",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 1,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-sentence-01",
    question: "Which option is a complete sentence?",
    options: ["Running to the park", "The little bird sang.", "On the green mat", "Very excited today"],
    correctAnswer: "The little bird sang.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 1,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-grammar-02",
    question: "Choose the correct verb: 'She ___ her lunch at school.'",
    options: ["eat", "eats", "eating", "ateing"],
    correctAnswer: "eats",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 2,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-grammar-03",
    question: "Which sentence uses the correct end punctuation?",
    options: [
      "Can you help me carry these books?",
      "Can you help me carry these books.",
      "Can you help me carry these books!",
      "Can you help me carry these books,",
    ],
    correctAnswer: "Can you help me carry these books?",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 1,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-sentence-02",
    question: "Which option is the best complete sentence?",
    options: ["Because the rain started", "The class planted beans.", "Under the tall tree", "After lunch quickly"],
    correctAnswer: "The class planted beans.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 1,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-writing", {
    seedKey: "nb-ela-k3-sentence-03",
    question: "Choose the sentence that is written the clearest way.",
    options: [
      "The fox jumped over the log.",
      "The fox over jumped the log.",
      "Jumped over the log the fox.",
      "Fox the jumped log over.",
    ],
    correctAnswer: "The fox jumped over the log.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 2,
    topic: "k3_writing_representing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-vocab-01",
    question: "What does the word 'gigantic' mean?",
    options: ["Very small", "Very loud", "Very big", "Very cold"],
    correctAnswer: "Very big",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 1,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-vocab-02",
    question: "What does 'careful' mean?",
    options: ["Rushing without looking", "Paying close attention", "Being very noisy", "Feeling sleepy"],
    correctAnswer: "Paying close attention",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 1,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-vocab-03",
    question: "Which word means almost the same as 'tiny'?",
    options: ["Huge", "Little", "Heavy", "Bright"],
    correctAnswer: "Little",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 1,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-reading-01",
    question:
      "Read: 'Lena packed a snack, filled her water bottle, and put on her rain boots before the class walk.' What was Lena getting ready for?",
    options: ["A swim lesson", "A class walk", "A piano recital", "A birthday party"],
    correctAnswer: "A class walk",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 2,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-reading-02",
    question:
      "Read: 'The rabbit hid under the bush when the thunder started.' Why did the rabbit hide?",
    options: ["It was hungry", "It was scared by the storm", "It was playing a game", "It found a snack"],
    correctAnswer: "It was scared by the storm",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 2,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-reading-03",
    question:
      "Read: 'Owen checked the seed packet, dug a small hole, and covered the seed with soil.' What was Owen doing?",
    options: ["Baking", "Planting", "Painting", "Fishing"],
    correctAnswer: "Planting",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 2,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-k3-reading", {
    seedKey: "nb-ela-k3-reading-04",
    question:
      "Read: 'Mina wore a headlamp and followed the signs so she could reach the cabin before dark.' Why did Mina use a headlamp?",
    options: ["To carry water", "To see in dim light", "To make music", "To cook dinner"],
    correctAnswer: "To see in dim light",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 3,
    topic: "k3_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-grammar-01",
    question: "Which sentence uses correct punctuation and capitalization?",
    options: [
      "After lunch we visited the museum and sketched artifacts.",
      "after lunch, We visited the museum and sketched artifacts.",
      "After lunch we visited the museum and sketched artifacts",
      "After lunch, we Visited the museum and sketched artifacts.",
    ],
    correctAnswer: "After lunch we visited the museum and sketched artifacts.",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 3,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-sentence-01",
    question: "Which sentence best combines the ideas clearly?",
    options: [
      "Mia studied the map because she did not want to miss the trail turn.",
      "Mia studied the map, the trail turn.",
      "Because Mia studied. The map missed the trail turn.",
      "Mia the map trail turn because studied.",
    ],
    correctAnswer: "Mia studied the map because she did not want to miss the trail turn.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 3,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-grammar-02",
    question: "Choose the sentence with the correct pronoun.",
    options: [
      "Him and Ava finished the poster first.",
      "He and Ava finished the poster first.",
      "Her and Ava finished the poster first.",
      "Ava and him finished the poster first.",
    ],
    correctAnswer: "He and Ava finished the poster first.",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 3,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-grammar-03",
    question: "Which sentence shows the clearest use of commas?",
    options: [
      "After the game, we packed the nets, folded the jerseys, and swept the bench area.",
      "After the game we packed, the nets folded, the jerseys and swept the bench area.",
      "After the game we packed the nets folded the jerseys, and swept the bench area.",
      "After the game, we packed the nets folded the jerseys and swept, the bench area.",
    ],
    correctAnswer: "After the game, we packed the nets, folded the jerseys, and swept the bench area.",
    questionType: EnglishQuestionType.GRAMMAR,
    difficulty: 4,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-sentence-02",
    question: "Which sentence has the strongest structure for a report?",
    options: [
      "The salmon return upstream each fall to spawn.",
      "The salmon upstream and fall.",
      "Upstream return because salmon fall.",
      "Each fall because upstream the salmon.",
    ],
    correctAnswer: "The salmon return upstream each fall to spawn.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 3,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-writing", {
    seedKey: "nb-ela-46-sentence-03",
    question: "Choose the sentence that best links the ideas with a clear conjunction.",
    options: [
      "The team practised hard, so they felt ready for the tournament.",
      "The team practised hard ready felt the tournament.",
      "The team so practised hard, they the tournament.",
      "Practised hard the team and tournament ready.",
    ],
    correctAnswer: "The team practised hard, so they felt ready for the tournament.",
    questionType: EnglishQuestionType.SENTENCE_STRUCTURE,
    difficulty: 4,
    topic: "4_6_writing_representing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-vocab-01",
    question: "What does 'reluctant' most nearly mean in this sentence: 'Jules was reluctant to step onstage until the curtain opened.'",
    options: ["Eager", "Unsure or unwilling", "Completely ready", "Very noisy"],
    correctAnswer: "Unsure or unwilling",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 3,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-reading-01",
    question:
      "Read: 'The article explains how beavers change the land by building dams that slow water, create ponds, and provide shelter for other species.' What is the main idea?",
    options: [
      "Beavers only help themselves.",
      "Beavers can change habitats in ways that affect many living things.",
      "Ponds are easy to build.",
      "All animals live near beavers.",
    ],
    correctAnswer: "Beavers can change habitats in ways that affect many living things.",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-reading-02",
    question:
      "Read: 'Nora reread the chart, checked the legend, and then changed her answer.' Which strategy helped Nora understand the text?",
    options: [
      "Ignoring the text features",
      "Using the chart and legend to verify information",
      "Skipping unknown words",
      "Guessing without rereading",
    ],
    correctAnswer: "Using the chart and legend to verify information",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-vocab-02",
    question: "Which word best shows precise, descriptive language?",
    options: ["Nice", "Said", "Marched", "Thing"],
    correctAnswer: "Marched",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-vocab-03",
    question: "In the sentence 'The valley was barren after the wildfire,' what does 'barren' most likely mean?",
    options: ["Full of crops", "Empty and bare", "Very crowded", "Wet and muddy"],
    correctAnswer: "Empty and bare",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-vocab-04",
    question: "Which word is the strongest replacement for 'walked' in the sentence about a tired hiker?",
    options: ["Moved", "Strolled", "Trudged", "Went"],
    correctAnswer: "Trudged",
    questionType: EnglishQuestionType.VOCABULARY,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-reading-03",
    question:
      "Read: 'Because the bridge deck was made of open steel grating, snow blew through it instead of building up on the road surface.' What is the author mainly explaining?",
    options: [
      "Why the bridge is difficult to cross",
      "How the bridge design helps reduce snow buildup",
      "Why snow is heavy",
      "How to build a bridge from wood",
    ],
    correctAnswer: "How the bridge design helps reduce snow buildup",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 5,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-reading-04",
    question:
      "Read: 'First, the class measured the garden beds. Next, they compared the amount of sunlight in each area. Finally, they matched plant types to the best locations.' What skill is the class using most?",
    options: [
      "Retelling events in order",
      "Sequencing steps to solve a problem",
      "Guessing without evidence",
      "Memorizing poetry",
    ],
    correctAnswer: "Sequencing steps to solve a problem",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 4,
    topic: "4_6_reading_viewing",
  }),
  withEnglishTemplate("nb-ela-4-6-reading", {
    seedKey: "nb-ela-46-reading-05",
    question:
      "Read: 'The editorial argues that the city should add more bike racks near schools because students have asked for safer places to lock their bikes.' Which detail best supports the writer's opinion?",
    options: [
      "The city has many roads.",
      "Students asked for safer places to lock their bikes.",
      "Some people like to walk.",
      "Bike racks can be painted different colours.",
    ],
    correctAnswer: "Students asked for safer places to lock their bikes.",
    questionType: EnglishQuestionType.READING_COMPREHENSION,
    difficulty: 5,
    topic: "4_6_reading_viewing",
  }),
];

export function filterCurriculumMathQuestions(input: {
  gradeLevel?: number | null;
  difficulty?: number | null;
  topic?: string | null;
  operation?: MathOperation | null;
}) {
  return curriculumMathQuestions.filter((question) => {
    const gradeMatch =
      typeof input.gradeLevel !== "number" ||
      (question.gradeMin <= input.gradeLevel && question.gradeMax >= input.gradeLevel);
    const difficultyMatch =
      typeof input.difficulty !== "number" || question.difficulty <= input.difficulty;
    const topicMatch = !input.topic || question.topic === input.topic;
    const operationMatch = !input.operation || question.operation === input.operation;

    return gradeMatch && difficultyMatch && topicMatch && operationMatch;
  });
}

export function filterCurriculumEnglishQuestions(input: {
  gradeLevel?: number | null;
  difficulty?: number | null;
  topic?: string | null;
  questionType?: EnglishQuestionType | null;
}) {
  return curriculumEnglishQuestions.filter((question) => {
    const gradeMatch =
      typeof input.gradeLevel !== "number" ||
      (question.gradeMin <= input.gradeLevel && question.gradeMax >= input.gradeLevel);
    const difficultyMatch =
      typeof input.difficulty !== "number" || question.difficulty <= input.difficulty;
    const topicMatch = !input.topic || question.topic === input.topic;
    const typeMatch = !input.questionType || question.questionType === input.questionType;

    return gradeMatch && difficultyMatch && topicMatch && typeMatch;
  });
}
