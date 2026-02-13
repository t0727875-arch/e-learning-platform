import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replit_integrations/auth";
import { storage } from "../storage";
import { insertPathSchema, insertCourseSchema, insertContentNodeSchema } from "@shared/schema";
import { requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { strictRateLimit } from "../middleware/rate-limit";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";

export function registerContentRoutes(app: Express): void {
  // Public paths endpoints
  app.get("/api/paths", asyncHandler(async (req, res) => {
    const paths = await storage.getPaths(true);
    res.json(paths);
  }));

  app.get("/api/paths/:id", asyncHandler(async (req, res) => {
    const path = await storage.getPathById(req.params.id);
    if (!path) {
      throw new NotFoundError("Path");
    }
    res.json(path);
  }));

  // Public courses endpoints
  app.get("/api/courses", asyncHandler(async (req, res) => {
    const { pathId } = req.query;
    if (pathId && typeof pathId === 'string') {
      const courses = await storage.getCoursesByPathId(pathId);
      const publishedCourses = courses.filter(c => c.isPublished);
      res.json(publishedCourses);
    } else {
      const courses = await storage.getCourses(true);
      res.json(courses);
    }
  }));

  app.get("/api/courses/:id", asyncHandler(async (req, res) => {
    const course = await storage.getCourseById(req.params.id);
    if (!course) {
      throw new NotFoundError("Course");
    }
    res.json(course);
  }));

  // Public content endpoints
  app.get("/api/courses/:courseId/content", asyncHandler(async (req, res) => {
    const nodes = await storage.getContentNodes(req.params.courseId);
    res.json(nodes);
  }));

  app.get("/api/courses/:courseId/content/hierarchy", asyncHandler(async (req, res) => {
    const allNodes = await storage.getContentNodes(req.params.courseId);

    const lessons = allNodes.filter(n => n.nodeType === "lesson");
    const chapters = allNodes.filter(n => n.nodeType === "chapter");
    const chapterContents = allNodes.filter(n => n.nodeType === "chapter_content");

    const hierarchy = lessons.map(lesson => ({
      ...lesson,
      chapters: chapters
        .filter(ch => ch.parentId === lesson.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(chapter => ({
          ...chapter,
          contents: chapterContents
            .filter(cc => cc.parentId === chapter.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        }))
    })).sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json(hierarchy);
  }));

  app.get("/api/content/:id", asyncHandler(async (req, res) => {
    const node = await storage.getContentNodeById(req.params.id);
    if (!node) {
      throw new NotFoundError("Content");
    }
    res.json(node);
  }));

  // Teacher endpoints for paths
  app.get("/api/teacher/paths", isAuthenticated, requireRole("teacher", "admin"), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const paths = await storage.getPaths();
    const teacherPaths = paths.filter(p => p.createdBy === userId);
    res.json(teacherPaths);
  }));

  const createPathSchema = insertPathSchema.omit({ createdBy: true });

  app.post("/api/teacher/paths", isAuthenticated, requireRole("teacher", "admin"), validate(createPathSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const path = await storage.createPath({ ...req.body, createdBy: userId });
    res.status(201).json(path);
  }));

  // Teacher endpoints for courses
  app.get("/api/teacher/courses", isAuthenticated, requireRole("teacher", "admin"), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const courses = await storage.getCourses();
    const teacherCourses = courses.filter(c => c.createdBy === userId);
    res.json(teacherCourses);
  }));

  const createCourseSchema = insertCourseSchema.omit({ createdBy: true });

  app.post("/api/teacher/courses", isAuthenticated, requireRole("teacher", "admin"), validate(createCourseSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const course = await storage.createCourse({ ...req.body, createdBy: userId });
    res.status(201).json(course);
  }));

  // Teacher endpoints for content
  const createContentNodeSchema = z.object({
    courseId: z.string(),
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
    order: z.number().int().optional().default(0),
  });

  app.post("/api/teacher/content", isAuthenticated, requireRole("teacher", "admin"), validate(createContentNodeSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const node = await storage.createContentNode({ ...req.body, createdBy: userId });
    res.status(201).json(node);
  }));
}
