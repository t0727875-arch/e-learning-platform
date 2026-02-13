import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replit_integrations/auth";
import { storage } from "../storage";
import { insertClassroomSchema } from "@shared/schema";
import { requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { strictRateLimit } from "../middleware/rate-limit";
import { asyncHandler, NotFoundError, ValidationError, ForbiddenError } from "../middleware/error-handler";

export function registerClassroomRoutes(app: Express): void {
  // Student classroom endpoints
  app.get("/api/classrooms", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const classrooms = await storage.getClassroomsByUserId(userId);
    const classroomsWithCounts = await Promise.all(
      classrooms.map(async (c) => {
        const members = await storage.getClassroomMembers(c.id);
        return { ...c, memberCount: members.length };
      })
    );
    res.json(classroomsWithCounts);
  }));

  const joinClassroomSchema = z.object({
    joinCode: z.string().min(1, "Join code is required"),
  });

  app.post("/api/classrooms/join", isAuthenticated, validate(joinClassroomSchema), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { joinCode } = req.body;

    const classroom = await storage.getClassroomByJoinCode(joinCode);
    if (!classroom) {
      throw new NotFoundError("Classroom");
    }

    const existingMembership = await storage.getClassroomMembership(classroom.id, userId);
    if (existingMembership) {
      throw new ValidationError("You are already a member of this classroom");
    }

    const member = await storage.addClassroomMember({
      classroomId: classroom.id,
      userId,
    });
    res.status(201).json({ classroom, member });
  }));

  // Teacher classroom endpoints
  app.get("/api/teacher/classrooms", isAuthenticated, requireRole("teacher", "admin"), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const classrooms = await storage.getClassroomsByTeacherId(userId);
    res.json(classrooms);
  }));

  const createClassroomSchema = insertClassroomSchema.omit({ teacherId: true });

  app.post("/api/teacher/classrooms", isAuthenticated, requireRole("teacher", "admin"), validate(createClassroomSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const classroom = await storage.createClassroom({ ...req.body, teacherId: userId });
    res.status(201).json(classroom);
  }));

  const addClassroomMemberSchema = z.object({
    userId: z.string(),
  });

  app.post("/api/teacher/classrooms/:classroomId/members", isAuthenticated, requireRole("teacher", "admin"), validate(addClassroomMemberSchema), strictRateLimit, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const userProfile = req.userProfile;
    const classroom = await storage.getClassroomById(req.params.classroomId);

    if (!classroom) {
      throw new NotFoundError("Classroom");
    }

    if (userProfile?.role !== "admin" && classroom.teacherId !== userId) {
      throw new ForbiddenError("You do not have permission to manage this classroom");
    }

    const member = await storage.addClassroomMember({
      classroomId: req.params.classroomId,
      userId: req.body.userId,
    });
    res.status(201).json(member);
  }));

  app.get("/api/teacher/classrooms/:classroomId/members", isAuthenticated, requireRole("teacher", "admin"), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const userProfile = req.userProfile;
    const classroom = await storage.getClassroomById(req.params.classroomId);

    if (!classroom) {
      throw new NotFoundError("Classroom");
    }

    if (userProfile?.role !== "admin" && classroom.teacherId !== userId) {
      throw new ForbiddenError("You do not have permission to view this classroom");
    }

    const members = await storage.getClassroomMembers(req.params.classroomId);
    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const memberProfile = await storage.getUserProfile(m.userId);
        return { ...m, profile: memberProfile };
      })
    );
    res.json(membersWithProfiles);
  }));

  app.get("/api/teacher/classrooms/:classroomId/leaderboard", isAuthenticated, requireRole("teacher", "admin"), asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const userProfile = req.userProfile;

    const classroom = await storage.getClassroomById(req.params.classroomId);
    if (!classroom) {
      throw new NotFoundError("Classroom");
    }

    if (userProfile?.role !== "admin" && classroom.teacherId !== userId) {
      throw new ForbiddenError("You do not have permission to view this classroom");
    }

    const members = await storage.getClassroomMembers(req.params.classroomId);
    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const memberProfile = await storage.getUserProfile(m.userId);
        return memberProfile;
      })
    );
    const validProfiles = membersWithProfiles.filter(p => p !== undefined);
    const sorted = validProfiles.sort((a, b) => (b.points || 0) - (a.points || 0));
    const leaderboard = sorted.map((p, index) => ({
      rank: index + 1,
      userId: p.userId,
      name: `Student ${index + 1}`,
      points: p.points || 0,
      country: p.country,
      isCurrentUser: p.userId === userId,
    }));
    res.json(leaderboard);
  }));
}
