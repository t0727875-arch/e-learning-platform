import { eq } from "drizzle-orm";
import { db } from "./db";
import { authStorage } from "./replit_integrations/auth";
import { seedContentData } from "./seed";
import {
  users,
  userProfiles,
  systemSettings,
  paths,
  courses,
  contentNodes,
  quizzes,
  questions,
  enrollments,
  progress,
  quizAttempts,
  certificates,
  classrooms,
  classroomMembers,
  friendships,
  weeklyTeams,
  weeklyTeamMembers,
  donations,
  userStreaks,
  leaderboardHistory,
} from "@shared/schema";

async function seedAll() {
  console.log("Starting full seed...");

  await db.delete(weeklyTeamMembers);
  await db.delete(weeklyTeams);
  await db.delete(leaderboardHistory);
  await db.delete(userStreaks);
  await db.delete(donations);
  await db.delete(friendships);
  await db.delete(classroomMembers);
  await db.delete(classrooms);
  await db.delete(certificates);
  await db.delete(quizAttempts);
  await db.delete(progress);
  await db.delete(enrollments);
  await db.delete(questions);
  await db.delete(quizzes);
  await db.delete(contentNodes);
  await db.delete(courses);
  await db.delete(paths);
  await db.delete(systemSettings);
  await db.delete(userProfiles);
  await db.delete(users);

  const adminUser = await authStorage.createLocalUser(
    "admin",
    "admin",
    "Admin",
    "User",
    "admin@local.nooracademy.test"
  );

  const teacherUser = await authStorage.createLocalUser(
    "teacher_ayesha",
    "teacher123",
    "Ayesha",
    "Khan",
    "ayesha.teacher@local.nooracademy.test"
  );

  const studentAli = await authStorage.createLocalUser(
    "student_ali",
    "student123",
    "Ali",
    "Rahman",
    "ali.student@local.nooracademy.test"
  );

  const studentSara = await authStorage.createLocalUser(
    "student_sara",
    "student123",
    "Sara",
    "Nour",
    "sara.student@local.nooracademy.test"
  );

  const studentYusuf = await authStorage.createLocalUser(
    "student_yusuf",
    "student123",
    "Yusuf",
    "Hadi",
    "yusuf.student@local.nooracademy.test"
  );

  await db.insert(userProfiles).values([
    {
      userId: adminUser.id,
      role: "admin",
      preferredLanguage: "en",
      country: "US",
      points: 250,
    },
    {
      userId: teacherUser.id,
      role: "teacher",
      preferredLanguage: "en",
      country: "GB",
      points: 120,
    },
    {
      userId: studentAli.id,
      role: "student",
      preferredLanguage: "en",
      country: "US",
      points: 85,
    },
    {
      userId: studentSara.id,
      role: "student",
      preferredLanguage: "fr",
      country: "FR",
      points: 95,
    },
    {
      userId: studentYusuf.id,
      role: "student",
      preferredLanguage: "ar",
      country: "EG",
      points: 45,
    },
  ]);

  await db.insert(systemSettings).values({
    hierarchyDepth: 4,
    difficultyLevelsCount: 5,
    questionsPerLevel: 10,
    defaultPassingScore: 70,
    quizTimerEnabled: true,
    quizTimerMinutes: 25,
  });

  await seedContentData(adminUser.id);

  const lessonQuizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, "quiz-lesson-1"));
  const servedQuestions = lessonQuizQuestions.slice(0, 2);
  const servedQuestionIds = servedQuestions.map((q) => q.id);

  await db.insert(enrollments).values([
    {
      userId: studentAli.id,
      pathId: "path-1",
      courseId: "course-1",
    },
    {
      userId: studentSara.id,
      pathId: "path-1",
      courseId: "course-1",
    },
    {
      userId: studentYusuf.id,
      pathId: "path-2",
      courseId: "course-2",
    },
  ]);

  await db.insert(progress).values([
    {
      userId: studentAli.id,
      contentNodeId: "content-1-1-1",
      summaryViewed: true,
      completed: true,
      completedAt: new Date(),
    },
    {
      userId: studentAli.id,
      contentNodeId: "content-1-1-2",
      summaryViewed: false,
      completed: false,
    },
    {
      userId: studentSara.id,
      contentNodeId: "content-1-2-1",
      summaryViewed: true,
      completed: true,
      completedAt: new Date(),
    },
  ]);

  await db.insert(quizAttempts).values([
    {
      userId: studentAli.id,
      quizId: "quiz-lesson-1",
      seed: "seed-ali-lesson-1",
      currentLevel: 1,
      score: 1,
      passed: false,
      pointsEarned: 0,
      questionsAnswered: {
        servedIds: servedQuestionIds,
        answers: servedQuestions.map((question, index) => ({
          questionId: question.id,
          answerIndex: index === 0 ? question.correctAnswerIndex : 0,
        })),
      },
      completedAt: new Date(),
    },
    {
      userId: studentSara.id,
      quizId: "quiz-lesson-2",
      seed: "seed-sara-lesson-2",
      currentLevel: 1,
      score: 2,
      passed: true,
      pointsEarned: 20,
      questionsAnswered: {
        servedIds: [],
        answers: [],
      },
      completedAt: new Date(),
    },
  ]);

  await db.insert(certificates).values([
    {
      uniqueCode: "CERT-ALPHA-001",
      userId: studentSara.id,
      pathId: "path-1",
      courseId: "course-1",
      studentName: "Sara Nour",
      titleEn: "Five Pillars Completion",
      titleAr: "Five Pillars Completion",
      titleFr: "Five Pillars Completion",
      issuedAt: new Date(),
      pdfUrl: "https://example.test/certificates/CERT-ALPHA-001.pdf",
    },
  ]);

  const [createdClassroom] = await db
    .insert(classrooms)
    .values({
      teacherId: teacherUser.id,
      name: "Foundations 101 - Group A",
      description: "Intro group for new students.",
      joinCode: "FOUND-A1",
    })
    .returning();

  await db.insert(classroomMembers).values([
    {
      classroomId: createdClassroom.id,
      userId: studentAli.id,
      role: "student",
    },
    {
      classroomId: createdClassroom.id,
      userId: studentSara.id,
      role: "student",
    },
    {
      classroomId: createdClassroom.id,
      userId: studentYusuf.id,
      role: "student",
    },
  ]);

  await db.insert(friendships).values([
    {
      userId: studentAli.id,
      friendId: studentSara.id,
      status: "accepted",
    },
    {
      userId: studentSara.id,
      friendId: studentYusuf.id,
      status: "pending",
    },
  ]);

  const weekStart = new Date("2025-01-06T00:00:00Z");
  const weekEnd = new Date("2025-01-12T23:59:59Z");
  const [team] = await db
    .insert(weeklyTeams)
    .values({
      weekStart,
      weekEnd,
      teamName: "Team Crescent",
      totalPoints: 190,
    })
    .returning();

  await db.insert(weeklyTeamMembers).values([
    {
      teamId: team.id,
      userId: studentAli.id,
      pointsContributed: 60,
    },
    {
      teamId: team.id,
      userId: studentSara.id,
      pointsContributed: 90,
    },
    {
      teamId: team.id,
      userId: studentYusuf.id,
      pointsContributed: 40,
    },
  ]);

  await db.insert(donations).values([
    {
      donorName: "Layla Hassan",
      donorEmail: "layla.hassan@example.test",
      amount: 25,
      currency: "USD",
      donationType: "sadaqah",
      message: "Keep up the great work.",
      isAnonymous: false,
    },
    {
      donorName: "Anonymous Donor",
      donorEmail: "anonymous@example.test",
      amount: 100,
      currency: "USD",
      donationType: "zakat",
      message: "For new student scholarships.",
      isAnonymous: true,
    },
  ]);

  await db.insert(userStreaks).values([
    {
      userId: studentAli.id,
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: new Date(),
      streakFreezeCount: 0,
    },
    {
      userId: studentSara.id,
      currentStreak: 5,
      longestStreak: 8,
      lastActivityDate: new Date(),
      streakFreezeCount: 1,
    },
  ]);

  await db.insert(leaderboardHistory).values([
    {
      userId: studentAli.id,
      previousRank: 10,
      currentRank: 7,
      notified: false,
    },
  ]);

  console.log("Seed completed.");
}

seedAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
