import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replit_integrations/auth";
import { storage } from "../storage";
import { insertPathSchema, insertCourseSchema, insertQuizSchema, insertQuestionSchema, insertClassroomSchema, insertDonationSchema } from "@shared/schema";
import { requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { strictRateLimit } from "../middleware/rate-limit";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";

export function registerAdminRoutes(app: Express): void {
  // Donations (public with strict rate limiting)
  app.post("/api/donations", validate(insertDonationSchema), strictRateLimit, asyncHandler(async (req, res) => {
    const donation = await storage.createDonation(req.body);
    res.status(201).json(donation);
  }));

  // Admin system settings
  app.get("/api/admin/settings", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    let settings = await storage.getSystemSettings();
    if (!settings) {
      settings = await storage.updateSystemSettings({
        hierarchyDepth: 5,
        difficultyLevelsCount: 5,
        questionsPerLevel: 20,
        defaultPassingScore: 70,
        quizTimerEnabled: false,
        quizTimerMinutes: 30,
      });
    }
    res.json(settings);
  }));

  const updateSettingsSchema = z.object({
    hierarchyDepth: z.number().int().min(1).max(10).optional(),
    difficultyLevelsCount: z.number().int().min(1).max(10).optional(),
    questionsPerLevel: z.number().int().min(1).max(100).optional(),
    defaultPassingScore: z.number().int().min(0).max(100).optional(),
    quizTimerEnabled: z.boolean().optional(),
    quizTimerMinutes: z.number().int().min(1).max(180).optional(),
  });

  app.patch("/api/admin/settings", isAuthenticated, requireRole("admin"), validate(updateSettingsSchema), asyncHandler(async (req: any, res) => {
    const settings = await storage.updateSystemSettings(req.body);
    res.json(settings);
  }));

  // Admin platform stats
  app.get("/api/admin/stats", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const stats = await storage.getPlatformStats();
    res.json(stats);
  }));

  // Admin user management
  app.get("/api/admin/users", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const users = await storage.getAllUsers();
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const userProfile = await storage.getUserProfile(user.id);
        const { password, ...safeUser } = user;
        return { ...safeUser, profile: userProfile };
      })
    );
    res.json(usersWithProfiles);
  }));

  const updateRoleSchema = z.object({
    role: z.enum(["student", "teacher", "admin"]),
  });

  app.patch("/api/admin/users/:userId/role", isAuthenticated, requireRole("admin"), validate(updateRoleSchema), asyncHandler(async (req: any, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    let profile = await storage.getUserProfile(userId);
    if (!profile) {
      profile = await storage.createUserProfile({
        userId,
        role,
        preferredLanguage: "en",
        points: 0,
      });
    } else {
      profile = await storage.updateUserProfile(userId, { role });
    }
    res.json(profile);
  }));

  const blockUserSchema = z.object({
    isBlocked: z.boolean(),
  });

  app.patch("/api/admin/users/:userId/block", isAuthenticated, requireRole("admin"), validate(blockUserSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { userId } = req.params;
    const { isBlocked } = req.body;
    let profile = await storage.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundError("User profile");
    }
    profile = await storage.updateUserProfile(userId, { isBlocked });
    res.json(profile);
  }));

  const updateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });

  app.patch("/api/admin/users/:userId", isAuthenticated, requireRole("admin"), validate(updateUserSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { userId } = req.params;
    const { firstName, lastName } = req.body;
    const user = await storage.updateUser(userId, { firstName, lastName });
    if (!user) {
      throw new NotFoundError("User");
    }
    res.json(user);
  }));

  // Admin path management
  app.get("/api/admin/paths", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const paths = await storage.getPaths(); // Get all paths including unpublished
    res.json(paths);
  }));

  const adminCreatePathSchema = insertPathSchema.omit({ createdBy: true });

  app.post("/api/admin/paths", isAuthenticated, requireRole("admin"),
      // To fix the validation later
      // validate(adminCreatePathSchema),
      strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const path = await storage.createPath({ ...req.body, createdBy: userId });
    res.status(201).json(path);
  }));

  const updatePathSchema = z.object({
    isPublished: z.boolean().optional(),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    titleFr: z.string().optional(),
    descriptionEn: z.string().optional(),
    descriptionAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    order: z.number().int().optional(),
  });

  app.patch("/api/admin/paths/:pathId", isAuthenticated, requireRole("admin"), validate(updatePathSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { pathId } = req.params;
    const path = await storage.getPathById(pathId);
    if (!path) {
      throw new NotFoundError("Path");
    }
    const updated = await storage.updatePath(pathId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/paths/:pathId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { pathId } = req.params;
    const path = await storage.getPathById(pathId);
    if (!path) {
      throw new NotFoundError("Path");
    }
    const courses = await storage.getCoursesByPathId(pathId);
    if (courses.length > 0) {
      throw new ValidationError("Cannot delete path with existing courses. Delete courses first.");
    }
    await storage.deletePathById(pathId);
    res.status(204).send();
  }));

  // Admin course management
  app.get("/api/admin/courses", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const allCourses = await storage.getCourses(); // Get all courses including unpublished
    res.json(allCourses);
  }));

  const adminCreateCourseSchema = insertCourseSchema.omit({ createdBy: true });

  app.post("/api/admin/courses", isAuthenticated, requireRole("admin"), validate(adminCreateCourseSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const course = await storage.createCourse({ ...req.body, createdBy: userId });
    res.status(201).json(course);
  }));

  const updateCourseSchema = z.object({
    isPublished: z.boolean().optional(),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    titleFr: z.string().optional(),
  });

  app.patch("/api/admin/courses/:courseId", isAuthenticated, requireRole("admin"), validate(updateCourseSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { courseId } = req.params;
    const course = await storage.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }
    const updated = await storage.updateCourse(courseId, req.body);
    res.json(updated);
  }));

  const adminUpdateCourseSchema = z.object({
    pathId: z.string().optional(),
    isPublished: z.boolean().optional(),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    titleFr: z.string().optional(),
    descriptionEn: z.string().optional(),
    descriptionAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    order: z.number().int().optional(),
  });

  app.put("/api/admin/courses/:courseId", isAuthenticated, requireRole("admin"), validate(adminUpdateCourseSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { courseId } = req.params;
    const course = await storage.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }
    const updated = await storage.updateCourse(courseId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/courses/:courseId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { courseId } = req.params;
    const course = await storage.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }
    const contentNodes = await storage.getContentNodes(courseId);
    if (contentNodes.length > 0) {
      throw new ValidationError("Cannot delete course with existing content. Delete content first.");
    }
    await storage.deleteCourseById(courseId);
    res.status(204).send();
  }));

  // Admin content management
  app.get("/api/admin/content", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const { courseId } = req.query;
    if (courseId) {
      const nodes = await storage.getContentNodes(courseId as string);
      res.json(nodes);
    } else {
      res.json([]);
    }
  }));

  const adminCreateContentSchema =
      /*z.object({
    /*courseId: z.string(),
    parentId: z.string().nullable().optional(),
    nodeType: z.string(),
    depth: z.number().int().optional().default(0),
    titleEn: z.string(),
    titleAr: z.string().nullable().optional(),
    titleFr: z.string().nullable().optional(),
    contentType: z.string().nullable().optional(),
    videoUrl: z.string().nullable().optional(),
    articleContentEn: z.string().nullable().optional(),
    articleContentAr: z.string().nullable().optional(),
    articleContentFr: z.string().nullable().optional(),
    contentJson: z.record(z.unknown()).nullable().optional(),
    summaryEn: z.string().nullable().optional(),
    summaryAr: z.string().nullable().optional(),
    summaryFr: z.string().nullable().optional(),
    hasQuiz: z.boolean().optional().default(false),
    isPublished: z.boolean().optional().default(false),
    order: z.number().int().optional().default(0),*/
    z.object({
      courseId: z.string().uuid(),
      parentId: z.string().uuid().nullable(),

      nodeType: z.enum([
        'lesson',
        'chapter',
        'chapter_content',
      ]),

      titleEn: z.string().nullable(),
      titleAr: z.string().nullable(),
      titleFr: z.string().nullable(),

      contentType: z.enum(['text', 'video']).nullable(),

      videoUrl: z.string().nullable(),

      articleContentEn: z.string().nullable(),
      articleContentAr: z.string().nullable(),
      articleContentFr: z.string().nullable(),

      contentJson: z.any().nullable(),

      isPublished: z.boolean().optional(),
 summaryEn: z.string().optional(),
      summaryAr: z.string().optional(),
      summaryFr: z.string().optional(),
      hasQuiz: z.boolean().optional(),
      order: z.number().int().optional(),
  });

  app.post("/api/admin/content", isAuthenticated, requireRole("admin"),
      // Validation should fix later
      // validate(adminCreateContentSchema),
      strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    console.log("[Content Creation] Creating content node:", {
      ...req.body,
      createdBy: userId
    });
    const node = await storage.createContentNode({ ...req.body, createdBy: userId });
    console.log("[Content Creation] Successfully created:", node.id);
    res.status(201).json(node);
  }));

  const adminUpdateContentSchema = z.object({
    parentId: z.string().nullable().optional(),
    nodeType: z.string().optional(),
    depth: z.number().int().optional(),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    titleFr: z.string().optional(),
    contentType: z.string().optional(),
    videoUrl: z.string().optional(),
    articleContentEn: z.string().optional(),
    articleContentAr: z.string().optional(),
    articleContentFr: z.string().optional(),
    contentJson: z.record(z.unknown()).nullable().optional(),
    summaryEn: z.string().optional(),
    summaryAr: z.string().optional(),
    summaryFr: z.string().optional(),
    hasQuiz: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    order: z.number().int().optional(),
  });

  app.put("/api/admin/content/:contentId", isAuthenticated, requireRole("admin"), validate(adminUpdateContentSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { contentId } = req.params;
    const node = await storage.getContentNodeById(contentId);
    if (!node) {
      throw new NotFoundError("Content");
    }
    const updated = await storage.updateContentNode(contentId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/content/:contentId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { contentId } = req.params;
    const node = await storage.getContentNodeById(contentId);
    if (!node) {
      throw new NotFoundError("Content");
    }
    await storage.deleteContentNodeById(contentId);
    res.status(204).send();
  }));

  // Admin classroom management
  app.get("/api/admin/classrooms", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const allClassrooms = await storage.getAllClassrooms();
    const classroomsWithDetails = await Promise.all(
      allClassrooms.map(async (c) => {
        const members = await storage.getClassroomMembers(c.id);
        const teacherProfile = await storage.getUserProfile(c.teacherId);
        return { ...c, memberCount: members.length, teacherProfile };
      })
    );
    res.json(classroomsWithDetails);
  }));

  app.get("/api/admin/classrooms/:classroomId", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const classroom = await storage.getClassroomById(req.params.classroomId);
    if (!classroom) {
      throw new NotFoundError("Classroom");
    }
    const members = await storage.getClassroomMembers(classroom.id);
    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const memberProfile = await storage.getUserProfile(m.userId);
        return { ...m, profile: memberProfile };
      })
    );
    res.json({ ...classroom, members: membersWithProfiles });
  }));

  const adminCreateClassroomSchema = insertClassroomSchema.omit({ teacherId: true });

  app.post("/api/admin/classrooms", isAuthenticated, requireRole("admin"), validate(adminCreateClassroomSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const classroom = await storage.createClassroom({ ...req.body, teacherId: req.body.teacherId || userId });
    res.status(201).json(classroom);
  }));

  const adminUpdateClassroomSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().optional(),
    joinCode: z.string().min(4, "Join code must be at least 4 characters").optional(),
    teacherId: z.string().min(1, "Teacher ID cannot be empty").optional(),
  });

  app.put("/api/admin/classrooms/:classroomId", isAuthenticated, requireRole("admin"), validate(adminUpdateClassroomSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { classroomId } = req.params;
    const classroom = await storage.getClassroomById(classroomId);
    if (!classroom) {
      throw new NotFoundError("Classroom");
    }
    const updated = await storage.updateClassroom(classroomId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/classrooms/:classroomId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { classroomId } = req.params;
    const classroom = await storage.getClassroomById(classroomId);
    if (!classroom) {
      throw new NotFoundError("Classroom");
    }
    await storage.deleteClassroom(classroomId);
    res.status(204).send();
  }));

  app.delete("/api/admin/classrooms/:classroomId/members/:userId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { classroomId, userId } = req.params;
    await storage.removeClassroomMember(classroomId, userId);
    res.status(204).send();
  }));

  app.post("/api/admin/classrooms/:classroomId/members", isAuthenticated, requireRole("admin"), validate(z.object({ userId: z.string() })), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { classroomId } = req.params;
    const { userId } = req.body;
    const existingMembership = await storage.getClassroomMembership(classroomId, userId);
    if (existingMembership) {
      throw new ValidationError("User is already a member of this classroom");
    }
    const member = await storage.addClassroomMember({ classroomId, userId });
    res.status(201).json(member);
  }));

  // Admin quiz management
  app.get("/api/admin/quizzes", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const allQuizzes = await storage.getAllQuizzes();
    const quizzesWithDetails = await Promise.all(
      allQuizzes.map(async (q) => {
        const questions = await storage.getQuestionsByQuizId(q.id);
        return { ...q, questionCount: questions.length };
      })
    );
    res.json(quizzesWithDetails);
  }));

  app.get("/api/admin/quizzes/:quizId", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const quiz = await storage.getQuizById(req.params.quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    const questions = await storage.getQuestionsByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  }));

  app.post("/api/admin/quizzes", isAuthenticated, requireRole("admin"), validate(insertQuizSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const quiz = await storage.createQuiz(req.body);
    res.status(201).json(quiz);
  }));

  const adminUpdateQuizSchema = z.object({
    contentNodeId: z.string().nullable().optional(),
    courseId: z.string().nullable().optional(),
    pathId: z.string().nullable().optional(),
    titleEn: z.string().min(1, "Title cannot be empty").optional(),
    titleAr: z.string().optional(),
    titleFr: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timerEnabled: z.boolean().optional(),
    timerMinutes: z.number().int().min(1).max(180).optional(),
  }).refine(
    (data) => !data.timerEnabled || (data.timerMinutes && data.timerMinutes > 0),
    { message: "Timer minutes required when timer is enabled", path: ["timerMinutes"] }
  );

  app.put("/api/admin/quizzes/:quizId", isAuthenticated, requireRole("admin"), validate(adminUpdateQuizSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { quizId } = req.params;
    const quiz = await storage.getQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    const updated = await storage.updateQuiz(quizId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/quizzes/:quizId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { quizId } = req.params;
    const quiz = await storage.getQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    await storage.deleteQuiz(quizId);
    res.status(204).send();
  }));

  // Admin question management
  app.get("/api/admin/quizzes/:quizId/questions", isAuthenticated, requireRole("admin"), asyncHandler(async (req: any, res) => {
    const questions = await storage.getQuestionsByQuizId(req.params.quizId);
    res.json(questions);
  }));

  app.post("/api/admin/questions", isAuthenticated, requireRole("admin"), validate(insertQuestionSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const question = await storage.createQuestion(req.body);
    res.status(201).json(question);
  }));

  const adminUpdateQuestionSchema = z.object({
    questionTextEn: z.string().min(1, "Question text cannot be empty").optional(),
    questionTextAr: z.string().optional(),
    questionTextFr: z.string().optional(),
    optionsEn: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options required").optional(),
    optionsAr: z.array(z.string()).optional(),
    optionsFr: z.array(z.string()).optional(),
    correctAnswerIndex: z.number().int().min(0).optional(),
    difficultyLevel: z.number().int().min(1).max(5).optional(),
    explanationEn: z.string().optional(),
    explanationAr: z.string().optional(),
    explanationFr: z.string().optional(),
    order: z.number().int().optional(),
  }).refine(
    (data) => {
      // Only validate if both optionsEn and correctAnswerIndex are provided
      if (data.optionsEn !== undefined && data.correctAnswerIndex !== undefined) {
        return data.correctAnswerIndex < data.optionsEn.length;
      }
      return true;
    },
    { message: "Correct answer index must be within options range", path: ["correctAnswerIndex"] }
  );

  app.put("/api/admin/questions/:questionId", isAuthenticated, requireRole("admin"), validate(adminUpdateQuestionSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { questionId } = req.params;
    const question = await storage.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundError("Question");
    }
    const updated = await storage.updateQuestion(questionId, req.body);
    res.json(updated);
  }));

  app.delete("/api/admin/questions/:questionId", isAuthenticated, requireRole("admin"), strictRateLimit, asyncHandler(async (req: any, res) => {
    const { questionId } = req.params;
    const question = await storage.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundError("Question");
    }
    await storage.deleteQuestion(questionId);
    res.status(204).send();
  }));
}
