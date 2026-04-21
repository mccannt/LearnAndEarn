import { PrismaClient, Subject, MathOperation, EnglishQuestionType } from "@prisma/client";

import { avatarCatalogSeed, rewardCatalogSeed } from "./catalog-data";
import { curriculumEnglishQuestions, curriculumMathQuestions } from "../src/lib/curriculum-question-bank";

const prisma = new PrismaClient();

async function main() {
  for (const item of avatarCatalogSeed) {
    await prisma.avatarItemCatalog.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  for (const reward of rewardCatalogSeed) {
    await prisma.rewardCatalog.upsert({
      where: { id: reward.id },
      update: reward,
      create: reward,
    });
  }

  // Create parent if not exists
  let parent = await prisma.parent.findFirst();
  if (!parent) {
    parent = await prisma.parent.create({
      data: {
        name: "Demo Parent",
        email: "parent@example.com",
        password: "parent123",
      },
    });
  }

  // Create settings if not exists
  const settingsCount = await prisma.settings.count({ where: { parentId: parent.id } });
  if (settingsCount === 0) {
    await prisma.settings.create({
      data: {
        parentId: parent.id,
        maxDailySessionTime: 60,
        maxWeeklySessionTime: 300,
        pointsPerScreenTime: 10,
        pointsPerRobux: 100,
        sessionDifficulty: "medium",
        passwordProtected: true,
        parentPassword: "parent123",
      },
    });
  }

  // Create child if not exists
  let child = await prisma.child.findFirst({ where: { parentId: parent.id } });
  if (!child) {
    child = await prisma.child.create({
      data: {
        name: "Emma",
        age: 9,
        gradeLevel: 4,
        parentId: parent.id,
        totalPoints: 150,
        currentStreak: 5,
        longestStreak: 12,
        equippedHairStyle: "hair1",
        equippedShirt: "shirt1",
        equippedPants: "pants1",
        equippedShoes: "shoes1",
        equippedAccessory: "none",
        equippedBackground: "bg1",
      },
    });
  } else {
    child = await prisma.child.update({
      where: { id: child.id },
      data: {
        gradeLevel: child.gradeLevel ?? 4,
        equippedHairStyle: child.equippedHairStyle === "default" ? "hair1" : (child.equippedHairStyle ?? "hair1"),
        equippedShirt: child.equippedShirt === "blue_tee" ? "shirt1" : (child.equippedShirt ?? "shirt1"),
        equippedPants: child.equippedPants === "jeans" ? "pants1" : (child.equippedPants ?? "pants1"),
        equippedShoes: child.equippedShoes === "sneakers" ? "shoes1" : (child.equippedShoes ?? "shoes1"),
        equippedAccessory: child.equippedAccessory ?? "none",
        equippedBackground: child.equippedBackground === "default" ? "bg1" : (child.equippedBackground ?? "bg1"),
      },
    });
  }

  // Seed initial unlocked items for the child
  const unlockedCount = await prisma.unlockedItem.count({ where: { childId: child.id } });
  if (unlockedCount === 0) {
    await prisma.unlockedItem.createMany({
      data: [
        { childId: child.id, itemId: "hair1" },
        { childId: child.id, itemId: "shirt1" },
        { childId: child.id, itemId: "pants1" },
        { childId: child.id, itemId: "shoes1" },
        { childId: child.id, itemId: "none" },
        { childId: child.id, itemId: "bg1" },
        { childId: child.id, itemId: "hair2" },
        { childId: child.id, itemId: "shirt2" },
        { childId: child.id, itemId: "acc1" },
      ],
    });
  }

  for (const defaultItemId of ["hair1", "shirt1", "pants1", "shoes1", "none", "bg1"]) {
    await prisma.unlockedItem.upsert({
      where: {
        childId_itemId: {
          childId: child.id,
          itemId: defaultItemId,
        },
      },
      update: {},
      create: {
        childId: child.id,
        itemId: defaultItemId,
      },
    });
  }

  // Seed a couple of sessions for charts if none exist
  const sessionCount = await prisma.learningSession.count({ where: { childId: child.id } });
  if (sessionCount === 0) {
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

    await prisma.learningSession.createMany({
      data: [
        { childId: child.id, subject: Subject.MATH, topic: "multiplication", duration: 15, questionsAsked: 10, questionsCorrect: 8, pointsEarned: 85, completedAt: daysAgo(1) },
        { childId: child.id, subject: Subject.ENGLISH, topic: "grammar", duration: 20, questionsAsked: 8, questionsCorrect: 6, pointsEarned: 90, completedAt: daysAgo(2) },
        { childId: child.id, subject: Subject.MATH, topic: "division", duration: 12, questionsAsked: 8, questionsCorrect: 7, pointsEarned: 75, completedAt: daysAgo(3) },
      ],
    });

    // Simple progress upserts
    await prisma.progress.upsert({
      where: { childId_subject_topic: { childId: child.id, subject: Subject.MATH, topic: "multiplication" } },
      update: { totalQuestions: { increment: 10 }, correctAnswers: { increment: 8 }, accuracy: 0.8, level: 2, lastPracticed: daysAgo(1) },
      create: { childId: child.id, subject: Subject.MATH, topic: "multiplication", totalQuestions: 10, correctAnswers: 8, accuracy: 0.8, level: 2 },
    });
    await prisma.progress.upsert({
      where: { childId_subject_topic: { childId: child.id, subject: Subject.ENGLISH, topic: "grammar" } },
      update: { totalQuestions: { increment: 8 }, correctAnswers: { increment: 6 }, accuracy: 0.75, level: 2, lastPracticed: daysAgo(2) },
      create: { childId: child.id, subject: Subject.ENGLISH, topic: "grammar", totalQuestions: 8, correctAnswers: 6, accuracy: 0.75, level: 2 },
    });
  }

  // Seed question banks
  for (const question of curriculumMathQuestions) {
    await prisma.mathQuestion.upsert({
      where: { seedKey: question.seedKey },
      update: {
        question: question.question,
        answer: question.answer,
        remainder: question.remainder ?? null,
        operation: question.operation,
        difficulty: question.difficulty,
        topic: question.topic,
        gradeMin: question.gradeMin,
        gradeMax: question.gradeMax,
        curriculumCode: question.curriculumCode,
        curriculumOutcome: question.curriculumOutcome,
        curriculumSourceUrl: question.curriculumSourceUrl,
      },
      create: {
        seedKey: question.seedKey,
        question: question.question,
        answer: question.answer,
        remainder: question.remainder ?? null,
        operation: question.operation,
        difficulty: question.difficulty,
        topic: question.topic,
        gradeMin: question.gradeMin,
        gradeMax: question.gradeMax,
        curriculumCode: question.curriculumCode,
        curriculumOutcome: question.curriculumOutcome,
        curriculumSourceUrl: question.curriculumSourceUrl,
      },
    });
  }

  for (const question of curriculumEnglishQuestions) {
    await prisma.englishQuestion.upsert({
      where: { seedKey: question.seedKey },
      update: {
        question: question.question,
        options: JSON.stringify(question.options),
        correctAnswer: question.correctAnswer,
        questionType: question.questionType,
        difficulty: question.difficulty,
        topic: question.topic,
        gradeMin: question.gradeMin,
        gradeMax: question.gradeMax,
        curriculumCode: question.curriculumCode,
        curriculumOutcome: question.curriculumOutcome,
        curriculumSourceUrl: question.curriculumSourceUrl,
      },
      create: {
        seedKey: question.seedKey,
        question: question.question,
        options: JSON.stringify(question.options),
        correctAnswer: question.correctAnswer,
        questionType: question.questionType,
        difficulty: question.difficulty,
        topic: question.topic,
        gradeMin: question.gradeMin,
        gradeMax: question.gradeMax,
        curriculumCode: question.curriculumCode,
        curriculumOutcome: question.curriculumOutcome,
        curriculumSourceUrl: question.curriculumSourceUrl,
      },
    });
  }
  console.log("Seed complete");
}

main().finally(async () => {
  await prisma.$disconnect();
}); 
