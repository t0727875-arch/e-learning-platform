import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replit_integrations/auth";
import { storage } from "../storage";
import { insertQuizSchema, insertQuestionSchema } from "@shared/schema";
import { requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { quizRateLimit, strictRateLimit } from "../middleware/rate-limit";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";

export function registerQuizRoutes(app: Express): void {
  // Public quiz endpoints
  app.get("/api/content/:contentNodeId/quizzes", asyncHandler(async (req, res) => {
    const quizzesList = await storage.getQuizzesByContentNodeId(req.params.contentNodeId);
    res.json(quizzesList);
  }));

  app.get("/api/quizzes", asyncHandler(async (req, res) => {
    const quizzesList = await storage.getAllQuizzes();
    res.json(quizzesList);
  }));

  app.get("/api/courses/:courseId/quizzes", asyncHandler(async (req, res) => {
    const courseQuizzes = await storage.getQuizzesByCourseId(req.params.courseId);
    res.json(courseQuizzes);
  }));

  app.get("/api/quizzes/level/0", asyncHandler(async (req, res) => {
    const level0Quizzes = await storage.getLevel0Quizzes();
    res.json(level0Quizzes);
  }));

  app.get("/api/courses/:courseId/quiz-levels", asyncHandler(async (req, res) => {
    const quizLevels = await storage.getQuizLevelsByCourse(req.params.courseId);
    res.json(quizLevels);
  }));

  app.get("/api/quizzes/:id", asyncHandler(async (req, res) => {
    const quiz = await storage.getQuizById(req.params.id);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    res.json(quiz);
  }));

  // Quiz attempt endpoints
  app.post("/api/quizzes/:id/start", isAuthenticated, quizRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const quiz = await storage.getQuizById(req.params.id);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }

    const allQuestions = await storage.getQuestionsByQuizId(quiz.id);
    const seed = Math.random().toString(36).substring(2, 15);
    const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    const questionsToUse = shuffledQuestions.slice(0, 10);

    const servedQuestionIds = questionsToUse.map(q => q.id);

    const attempt = await storage.createQuizAttempt({
      userId,
      quizId: quiz.id,
      seed,
      currentLevel: 1,
      score: 0,
      passed: false,
      pointsEarned: 0,
      questionsAnswered: { servedIds: servedQuestionIds, answers: [] },
    });

    const questionsForClient = questionsToUse.map(q => ({
      id: q.id,
      questionEn: q.questionTextEn,
      questionAr: q.questionTextAr,
      questionFr: q.questionTextFr,
      optionsEn: q.optionsEn,
      optionsAr: q.optionsAr,
      optionsFr: q.optionsFr,
      difficulty: q.difficultyLevel,
    }));

    res.json({
      attempt: {
        id: attempt.id,
        quizId: attempt.quizId,
        startedAt: attempt.startedAt,
      },
      questions: questionsForClient,
      timeLimit: quiz.timerEnabled ? quiz.timerMinutes : null,
      passingScore: quiz.passingScore,
    });
  }));

  const submitQuizSchema = z.object({
    answers: z.array(z.object({
      questionId: z.string(),
      answerIndex: z.number().int().min(0),
    })),
  });

  app.post("/api/quiz-attempts/:attemptId/submit", isAuthenticated, validate(submitQuizSchema), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { attemptId } = req.params;
    const { answers } = req.body;

    const attempts = await storage.getQuizAttemptsByUserId(userId);
    const attempt = attempts.find(a => a.id === attemptId);
    if (!attempt) {
      throw new NotFoundError("Quiz attempt");
    }

    if (attempt.completedAt) {
      throw new ValidationError("Quiz already submitted");
    }

    const quiz = await storage.getQuizById(attempt.quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }

    const attemptData = attempt.questionsAnswered as { servedIds: string[]; answers: unknown[] } | null;
    const servedQuestionIds = attemptData?.servedIds;
    if (!servedQuestionIds || !Array.isArray(servedQuestionIds)) {
      throw new ValidationError("Invalid attempt state");
    }

    const allQuestions = await storage.getQuestionsByQuizId(quiz.id);
    const servedQuestions = allQuestions.filter(q => servedQuestionIds.includes(q.id));

    let correctCount = 0;
    const results: { questionId: string; correct: boolean; correctAnswer: number }[] = [];

    for (const answer of answers) {
      if (!servedQuestionIds.includes(answer.questionId)) {
        continue;
      }
      const question = servedQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = answer.answerIndex === question.correctAnswerIndex;
        if (isCorrect) {
          correctCount++;
        }
        results.push({
          questionId: question.id,
          correct: isCorrect,
          correctAnswer: question.correctAnswerIndex,
        });
      }
    }

    const maxScore = servedQuestions.length;
    const percentage = maxScore > 0 ? (correctCount / maxScore) * 100 : 0;
    const passed = percentage >= (quiz.passingScore || 70);
    const pointsEarned = passed ? correctCount * 10 : 0;

    await storage.updateQuizAttempt(attemptId, {
      questionsAnswered: { servedIds: servedQuestionIds, answers },
      score: correctCount,
      passed,
      pointsEarned,
      completedAt: new Date(),
    });

    if (passed) {
      const profile = await storage.getUserProfile(userId);
      if (profile) {
        await storage.updateUserProfile(userId, {
          points: (profile.points || 0) + pointsEarned,
        });
      }
    }

    res.json({
      score: correctCount,
      maxScore,
      percentage,
      passed,
      pointsEarned,
      results,
    });
  }));

  app.get("/api/quiz-attempts", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const attempts = await storage.getQuizAttemptsByUserId(userId);
    res.json(attempts);
  }));

  // Teacher quiz endpoints
  app.post("/api/teacher/quizzes", isAuthenticated, requireRole("teacher", "admin"), validate(insertQuizSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const quiz = await storage.createQuiz(req.body);
    res.status(201).json(quiz);
  }));

  app.post("/api/teacher/questions", isAuthenticated, requireRole("teacher", "admin"), validate(insertQuestionSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const question = await storage.createQuestion(req.body);
    res.status(201).json(question);
  }));
}
