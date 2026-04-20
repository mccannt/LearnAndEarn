import { PrismaClient, Subject, MathOperation, EnglishQuestionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
  }

  // Seed initial unlocked items for the child
  const unlockedCount = await prisma.unlockedItem.count({ where: { childId: child.id } });
  if (unlockedCount === 0) {
    await prisma.unlockedItem.createMany({
      data: [
        { childId: child.id, itemId: "hair1", itemType: "hair_style" },
        { childId: child.id, itemId: "shirt1", itemType: "shirt" },
        { childId: child.id, itemId: "pants1", itemType: "pants" },
        { childId: child.id, itemId: "shoes1", itemType: "shoes" },
        { childId: child.id, itemId: "bg1", itemType: "background" },
        { childId: child.id, itemId: "hair2", itemType: "hair_style" }, // Unlock Curly Locks
        { childId: child.id, itemId: "shirt2", itemType: "shirt" },     // Unlock Pink Shirt
        { childId: child.id, itemId: "acc1", itemType: "accessory" },   // Unlock Cool Glasses
      ],
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
  const mathCount = await prisma.mathQuestion.count();
  if (mathCount === 0) {
    await prisma.mathQuestion.createMany({
      data: [
        { question: "3 × 4 = ?", answer: 12, operation: MathOperation.MULTIPLICATION, difficulty: 1, topic: "multiplication" },
        { question: "6 × 7 = ?", answer: 42, operation: MathOperation.MULTIPLICATION, difficulty: 2, topic: "multiplication" },
        { question: "56 ÷ 7 = ?", answer: 8, operation: MathOperation.DIVISION, difficulty: 2, topic: "division" },
        { question: "81 ÷ 9 = ?", answer: 9, operation: MathOperation.DIVISION, difficulty: 2, topic: "division" },
      ],
    });
  }

  const engCount = await prisma.englishQuestion.count();
  if (engCount === 0) {
    await prisma.englishQuestion.createMany({
      data: [
        { question: "Which sentence is correct?", options: JSON.stringify(["Me and my friend went to the park.", "My friend and I went to the park.", "My friend and me went to the park.", "I and my friend went to the park."]), correctAnswer: "My friend and I went to the park.", questionType: EnglishQuestionType.GRAMMAR, difficulty: 1, topic: "grammar" },
        { question: "Choose the correct verb: 'She ___ to school every day.'", options: JSON.stringify(["go", "goes", "going", "gone"]) , correctAnswer: "goes", questionType: EnglishQuestionType.GRAMMAR, difficulty: 1, topic: "grammar" },
        { question: "What does 'enormous' mean?", options: JSON.stringify(["Very small", "Very large", "Very fast", "Very slow"]) , correctAnswer: "Very large", questionType: EnglishQuestionType.VOCABULARY, difficulty: 1, topic: "vocabulary" },
      ],
    });
  }
  console.log("Seed complete");
}

main().finally(async () => {
  await prisma.$disconnect();
}); 