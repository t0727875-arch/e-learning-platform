import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replit_integrations/auth";
import { storage } from "../storage";
import { insertUserProfileSchema } from "@shared/schema";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/error-handler";

export function registerUserRoutes(app: Express): void {
  app.get("/api/user/profile", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    let profile = await storage.getUserProfile(userId);
    if (!profile) {
      // Admin bootstrap: check if this is the first user OR if user matches ADMIN_BOOTSTRAP_USER_ID
      const profileCount = await storage.countUserProfiles();
      const isFirstUser = profileCount === 0;
      const adminBootstrapUserId = process.env.ADMIN_BOOTSTRAP_USER_ID;
      const shouldBeAdmin = isFirstUser || (adminBootstrapUserId && userId === adminBootstrapUserId);

      profile = await storage.createUserProfile({
        userId,
        role: shouldBeAdmin ? "admin" : "student",
        preferredLanguage: "en",
        points: 0,
      });

      if (shouldBeAdmin) {
        console.log(`[Admin Bootstrap] User ${userId} promoted to admin (${isFirstUser ? 'first user' : 'bootstrap ID match'})`);
      }
    }
    res.json(profile);
  }));

  const updateProfileSchema = insertUserProfileSchema.partial().omit({ userId: true });

  app.patch("/api/user/profile", isAuthenticated, validate(updateProfileSchema), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.updateUserProfile(userId, req.body);
    res.json(profile);
  }));

  app.get("/api/enrollments", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const enrollments = await storage.getEnrollmentsByUserId(userId);
    res.json(enrollments);
  }));

  const createEnrollmentSchema = z.object({
    courseId: z.string().min(1),
  });

  app.post("/api/enrollments", isAuthenticated, validate(createEnrollmentSchema), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const enrollment = await storage.createEnrollment({ ...req.body, userId });
    res.status(201).json(enrollment);
  }));

  app.get("/api/certificates", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const certificates = await storage.getCertificatesByUserId(userId);
    res.json(certificates);
  }));

  app.get("/api/certificates/verify/:code", asyncHandler(async (req, res) => {
    const certificate = await storage.getCertificateByCode(req.params.code);
    if (!certificate) {
      throw new NotFoundError("Certificate");
    }
    res.json(certificate);
  }));

  app.get("/api/leaderboard/global", asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
    const profiles = await storage.getLeaderboardGlobal(limit);
    const leaderboardEntries = profiles.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      name: `Student ${index + 1}`,
      points: profile.points || 0,
      country: profile.country,
      isCurrentUser: false,
    }));
    res.json(leaderboardEntries);
  }));

  app.get("/api/leaderboard/country", asyncHandler(async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.json([]);
    }
    const profile = await storage.getUserProfile(userId);
    if (!profile?.country) {
      return res.json([]);
    }
    const profiles = await storage.getLeaderboardByCountry(profile.country, 100);
    res.json(profiles);
  }));

  app.get("/api/leaderboard/classroom", isAuthenticated, asyncHandler(async (req: any, res) => {
    res.json([]);
  }));

  app.get("/api/leaderboard/friends", isAuthenticated, asyncHandler(async (req: any, res) => {
    res.json([]);
  }));

  app.get("/api/leaderboard/weekly", asyncHandler(async (req: any, res) => {
    res.json([]);
  }));

  app.get("/api/progress", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const progressList = await storage.getProgressByUserId(userId);
    res.json(progressList);
  }));

  const updateProgressSchema = z.object({
    contentNodeId: z.string().min(1),
    completed: z.boolean(),
    completedAt: z.string().datetime().optional().nullable(),
  });

  app.post("/api/progress", isAuthenticated, validate(updateProgressSchema), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { contentNodeId, completed, completedAt } = req.body;

    let existingProgress = await storage.getProgressByUserAndNode(userId, contentNodeId);

    let wasAlreadyCompleted = existingProgress?.completed || false;

    // Set completedAt to current timestamp if completed is true and completedAt is not provided
    const finalCompletedAt = completed && !completedAt ? new Date() : completedAt;

    if (existingProgress) {
      existingProgress = await storage.updateProgress(existingProgress.id, { completed, completedAt: finalCompletedAt });
      res.json(existingProgress);
    } else {
      const newProgress = await storage.createProgress({
        userId,
        contentNodeId,
        completed,
        completedAt: finalCompletedAt,
      });
      res.json(newProgress);
    }

    if (completed && !wasAlreadyCompleted) {
      await storage.updateStreak(userId);

      const profile = await storage.getUserProfile(userId);
      if (profile) {
        const pointsForContent = 5;
        await storage.updateUserProfile(userId, {
          points: (profile.points || 0) + pointsForContent,
        });
      }
    }
  }));

  app.get("/api/streak", asyncHandler(async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.json({ currentStreak: 0, longestStreak: 0, lastActivityDate: null });
    }
    const streak = await storage.getUserStreak(userId);
    res.json(streak || { currentStreak: 0, longestStreak: 0, lastActivityDate: null });
  }));

  app.post("/api/streak/update", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const streak = await storage.updateStreak(userId);
    res.json(streak);
  }));

  app.get("/api/leaderboard/notifications", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const notifications = await storage.getLeaderboardNotifications(userId);
    res.json(notifications);
  }));

  app.post("/api/leaderboard/notifications/mark-seen", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.markLeaderboardNotificationsSeen(userId);
    res.json({ success: true });
  }));
}
