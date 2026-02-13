import { eq, desc, and, sql, count, lt, gt } from "drizzle-orm";
import { db } from "./db";
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
  type User,
  type UserProfile,
  type InsertUserProfile,
  type SystemSettings,
  type InsertSystemSettings,
  type Path,
  type InsertPath,
  type Course,
  type InsertCourse,
  type ContentNode,
  type InsertContentNode,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type Enrollment,
  type InsertEnrollment,
  type Progress,
  type InsertProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Certificate,
  type InsertCertificate,
  type Classroom,
  type InsertClassroom,
  type ClassroomMember,
  type InsertClassroomMember,
  type Donation,
  type InsertDonation,
  type UserStreak,
  type InsertUserStreak,
  type LeaderboardHistory,
  type InsertLeaderboardHistory,
} from "@shared/schema";

export interface IStorage {
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  updateUser(userId: string, data: { firstName?: string; lastName?: string }): Promise<User | undefined>;
  
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(data: Partial<InsertSystemSettings>): Promise<SystemSettings>;
  
  getPaths(published?: boolean): Promise<Path[]>;
  getPathById(id: string): Promise<Path | undefined>;
  createPath(path: InsertPath): Promise<Path>;
  updatePath(id: string, data: Partial<InsertPath>): Promise<Path | undefined>;
  deletePathById(id: string): Promise<void>;
  
  getCourses(published?: boolean): Promise<Course[]>;
  getCoursesByPathId(pathId: string): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourseById(id: string): Promise<void>;
  
  getContentNodes(courseId: string): Promise<ContentNode[]>;
  getContentNodeById(id: string): Promise<ContentNode | undefined>;
  createContentNode(node: InsertContentNode): Promise<ContentNode>;
  updateContentNode(id: string, data: Partial<InsertContentNode>): Promise<ContentNode | undefined>;
  deleteContentNodeById(id: string): Promise<void>;
  
  getAllQuizzes(): Promise<Quiz[]>;
  getQuizzesByContentNodeId(contentNodeId: string): Promise<Quiz[]>;
  getQuizzesByCourseId(courseId: string): Promise<Quiz[]>;
  getQuizzesByPathId(pathId: string): Promise<Quiz[]>;
  getQuizById(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, data: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<void>;
  
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, data: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<void>;
  
  getEnrollmentsByUserId(userId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  
  getProgressByUserId(userId: string): Promise<Progress[]>;
  getProgressByUserAndNode(userId: string, contentNodeId: string): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: string, data: Partial<InsertProgress>): Promise<Progress | undefined>;
  
  getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: string, data: Partial<InsertQuizAttempt>): Promise<QuizAttempt | undefined>;
  
  getCertificatesByUserId(userId: string): Promise<Certificate[]>;
  getCertificateByCode(code: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  getAllClassrooms(): Promise<Classroom[]>;
  getClassroomsByTeacherId(teacherId: string): Promise<Classroom[]>;
  getClassroomsByUserId(userId: string): Promise<Classroom[]>;
  getClassroomById(id: string): Promise<Classroom | undefined>;
  getClassroomByJoinCode(joinCode: string): Promise<Classroom | undefined>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;
  updateClassroom(id: string, data: Partial<InsertClassroom>): Promise<Classroom | undefined>;
  deleteClassroom(id: string): Promise<void>;
  getClassroomMembers(classroomId: string): Promise<ClassroomMember[]>;
  getClassroomMembership(classroomId: string, userId: string): Promise<ClassroomMember | undefined>;
  addClassroomMember(member: InsertClassroomMember): Promise<ClassroomMember>;
  removeClassroomMember(classroomId: string, userId: string): Promise<void>;
  
  createDonation(donation: InsertDonation): Promise<Donation>;
  
  getAllUsers(): Promise<User[]>;
  countUserProfiles(): Promise<number>;
  getLeaderboardGlobal(limit?: number): Promise<UserProfile[]>;
  getLeaderboardByCountry(country: string, limit?: number): Promise<UserProfile[]>;
  
  getPlatformStats(): Promise<{ totalUsers: number; totalCourses: number; totalEnrollments: number; totalCertificates: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles).set({ ...data, updatedAt: new Date() }).where(eq(userProfiles.userId, userId)).returning();
    return updated;
  }

  async updateUser(userId: string, data: { firstName?: string; lastName?: string }): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    return settings;
  }

  async updateSystemSettings(data: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const existing = await this.getSystemSettings();
    if (existing) {
      const [updated] = await db.update(systemSettings).set({ ...data, updatedAt: new Date() }).where(eq(systemSettings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(systemSettings).values(data).returning();
      return created;
    }
  }

  async getPaths(published?: boolean): Promise<Path[]> {
    if (published !== undefined) {
      return db.select().from(paths).where(eq(paths.isPublished, published)).orderBy(paths.order);
    }
    return db.select().from(paths).orderBy(paths.order);
  }

  async getPathById(id: string): Promise<Path | undefined> {
    const [path] = await db.select().from(paths).where(eq(paths.id, id));
    return path;
  }

  async createPath(path: InsertPath): Promise<Path> {
    const [created] = await db.insert(paths).values(path).returning();
    return created;
  }

  async updatePath(id: string, data: Partial<InsertPath>): Promise<Path | undefined> {
    const [updated] = await db.update(paths).set({ ...data, updatedAt: new Date() }).where(eq(paths.id, id)).returning();
    return updated;
  }

  async deletePathById(id: string): Promise<void> {
    await db.delete(paths).where(eq(paths.id, id));
  }

  async getCourses(published?: boolean): Promise<Course[]> {
    if (published !== undefined) {
      return db.select().from(courses).where(eq(courses.isPublished, published)).orderBy(courses.order);
    }
    return db.select().from(courses).orderBy(courses.order);
  }

  async getCoursesByPathId(pathId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.pathId, pathId)).orderBy(courses.order);
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    return updated;
  }

  async deleteCourseById(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getContentNodes(courseId: string): Promise<ContentNode[]> {
    return db.select().from(contentNodes).where(eq(contentNodes.courseId, courseId)).orderBy(contentNodes.order);
  }

  async getContentNodeById(id: string): Promise<ContentNode | undefined> {
    const [node] = await db.select().from(contentNodes).where(eq(contentNodes.id, id));
    return node;
  }

  async createContentNode(node: InsertContentNode): Promise<ContentNode> {
    const [created] = await db.insert(contentNodes).values(node).returning();
    return created;
  }

  async updateContentNode(id: string, data: Partial<InsertContentNode>): Promise<ContentNode | undefined> {
    const [updated] = await db.update(contentNodes).set({ ...data, updatedAt: new Date() }).where(eq(contentNodes.id, id)).returning();
    return updated;
  }

  async deleteContentNodeById(id: string): Promise<void> {
    await db.delete(contentNodes).where(eq(contentNodes.id, id));
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return db.select().from(quizzes);
  }

  async getQuizzesByContentNodeId(contentNodeId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.contentNodeId, contentNodeId));
  }

  async getQuizById(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [created] = await db.insert(quizzes).values(quiz).returning();
    return created;
  }

  async updateQuiz(id: string, data: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const [updated] = await db.update(quizzes).set({ ...data, updatedAt: new Date() }).where(eq(quizzes.id, id)).returning();
    return updated;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.quizId, id));
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  async getQuizzesByCourseId(courseId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.courseId, courseId));
  }

  async getQuizzesByPathId(pathId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.pathId, pathId));
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.quizId, quizId)).orderBy(questions.order);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  async updateQuestion(id: string, data: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updated] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async getEnrollmentsByUserId(userId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [created] = await db.insert(enrollments).values(enrollment).returning();
    return created;
  }

  async getProgressByUserId(userId: string): Promise<Progress[]> {
    return db.select().from(progress).where(eq(progress.userId, userId));
  }

  async getProgressByUserAndNode(userId: string, contentNodeId: string): Promise<Progress | undefined> {
    const [prog] = await db.select().from(progress).where(and(eq(progress.userId, userId), eq(progress.contentNodeId, contentNodeId)));
    return prog;
  }

  async createProgress(prog: InsertProgress): Promise<Progress> {
    const [created] = await db.insert(progress).values(prog).returning();
    return created;
  }

  async updateProgress(id: string, data: Partial<InsertProgress>): Promise<Progress | undefined> {
    const [updated] = await db.update(progress).set(data).where(eq(progress.id, id)).returning();
    return updated;
  }

  async getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [created] = await db.insert(quizAttempts).values(attempt).returning();
    return created;
  }

  async updateQuizAttempt(id: string, data: Partial<InsertQuizAttempt>): Promise<QuizAttempt | undefined> {
    const [updated] = await db.update(quizAttempts).set(data).where(eq(quizAttempts.id, id)).returning();
    return updated;
  }

  async getCertificatesByUserId(userId: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.userId, userId));
  }

  async getCertificateByCode(code: string): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.uniqueCode, code));
    return cert;
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [created] = await db.insert(certificates).values(certificate).returning();
    return created;
  }

  async getAllClassrooms(): Promise<Classroom[]> {
    return db.select().from(classrooms);
  }

  async getClassroomsByTeacherId(teacherId: string): Promise<Classroom[]> {
    return db.select().from(classrooms).where(eq(classrooms.teacherId, teacherId));
  }

  async getClassroomsByUserId(userId: string): Promise<Classroom[]> {
    const memberships = await db.select().from(classroomMembers).where(eq(classroomMembers.userId, userId));
    if (memberships.length === 0) return [];
    const classroomIds = memberships.map(m => m.classroomId);
    return db.select().from(classrooms).where(sql`${classrooms.id} = ANY(${classroomIds})`);
  }

  async getClassroomById(id: string): Promise<Classroom | undefined> {
    const [classroom] = await db.select().from(classrooms).where(eq(classrooms.id, id));
    return classroom;
  }

  async getClassroomByJoinCode(joinCode: string): Promise<Classroom | undefined> {
    const [classroom] = await db.select().from(classrooms).where(eq(classrooms.joinCode, joinCode));
    return classroom;
  }

  async createClassroom(classroom: InsertClassroom): Promise<Classroom> {
    const [created] = await db.insert(classrooms).values(classroom).returning();
    return created;
  }

  async updateClassroom(id: string, data: Partial<InsertClassroom>): Promise<Classroom | undefined> {
    const [updated] = await db.update(classrooms).set({ ...data, updatedAt: new Date() }).where(eq(classrooms.id, id)).returning();
    return updated;
  }

  async deleteClassroom(id: string): Promise<void> {
    await db.delete(classroomMembers).where(eq(classroomMembers.classroomId, id));
    await db.delete(classrooms).where(eq(classrooms.id, id));
  }

  async getClassroomMembers(classroomId: string): Promise<ClassroomMember[]> {
    return db.select().from(classroomMembers).where(eq(classroomMembers.classroomId, classroomId));
  }

  async getClassroomMembership(classroomId: string, userId: string): Promise<ClassroomMember | undefined> {
    const [membership] = await db.select().from(classroomMembers).where(
      and(eq(classroomMembers.classroomId, classroomId), eq(classroomMembers.userId, userId))
    );
    return membership;
  }

  async addClassroomMember(member: InsertClassroomMember): Promise<ClassroomMember> {
    const [created] = await db.insert(classroomMembers).values(member).returning();
    return created;
  }

  async removeClassroomMember(classroomId: string, userId: string): Promise<void> {
    await db.delete(classroomMembers).where(
      and(eq(classroomMembers.classroomId, classroomId), eq(classroomMembers.userId, userId))
    );
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [created] = await db.insert(donations).values(donation).returning();
    return created;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async countUserProfiles(): Promise<number> {
    const result = await db.select({ count: count() }).from(userProfiles);
    return Number(result[0]?.count ?? 0);
  }

  async getLeaderboardGlobal(limit = 100): Promise<UserProfile[]> {
    return db.select().from(userProfiles).orderBy(desc(userProfiles.points)).limit(limit);
  }

  async getLeaderboardByCountry(country: string, limit = 100): Promise<UserProfile[]> {
    return db.select().from(userProfiles).where(eq(userProfiles.country, country)).orderBy(desc(userProfiles.points)).limit(limit);
  }

  async getPlatformStats(): Promise<{ totalUsers: number; totalCourses: number; totalEnrollments: number; totalCertificates: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
    const [certificateCount] = await db.select({ count: sql<number>`count(*)` }).from(certificates);
    
    return {
      totalUsers: Number(userCount?.count || 0),
      totalCourses: Number(courseCount?.count || 0),
      totalEnrollments: Number(enrollmentCount?.count || 0),
      totalCertificates: Number(certificateCount?.count || 0),
    };
  }

  async getUserStreak(userId: string): Promise<UserStreak | undefined> {
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    return streak;
  }

  async updateStreak(userId: string): Promise<UserStreak> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const existing = await this.getUserStreak(userId);
    
    if (existing) {
      const lastActivity = existing.lastActivityDate ? new Date(existing.lastActivityDate) : null;
      const lastActivityDate = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null;
      
      if (lastActivityDate && lastActivityDate.getTime() === today.getTime()) {
        return existing;
      }
      
      let newStreak = 1;
      if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
        newStreak = (existing.currentStreak || 0) + 1;
      }
      
      const longestStreak = Math.max(newStreak, existing.longestStreak || 0);
      
      const [updated] = await db.update(userStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak,
          lastActivityDate: now,
          updatedAt: now,
        })
        .where(eq(userStreaks.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userStreaks)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: now,
          streakFreezeCount: 0,
        })
        .returning();
      return created;
    }
  }

  async getLeaderboardNotifications(userId: string): Promise<LeaderboardHistory[]> {
    return db.select()
      .from(leaderboardHistory)
      .where(and(eq(leaderboardHistory.userId, userId), eq(leaderboardHistory.notified, false)))
      .orderBy(desc(leaderboardHistory.createdAt));
  }

  async markLeaderboardNotificationsSeen(userId: string): Promise<void> {
    await db.update(leaderboardHistory)
      .set({ notified: true })
      .where(eq(leaderboardHistory.userId, userId));
  }

  async recordLeaderboardChange(userId: string, previousRank: number, currentRank: number): Promise<LeaderboardHistory> {
    const [created] = await db.insert(leaderboardHistory)
      .values({ userId, previousRank, currentRank, notified: false })
      .returning();
    return created;
  }

  async getLevel0Quizzes(): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.isLevel0, true));
  }

  async getQuizLevelsByCourse(courseId: string): Promise<Quiz[]> {
    return db.select().from(quizzes)
      .where(eq(quizzes.courseId, courseId))
      .orderBy(quizzes.quizLevel);
  }
}

export const storage = new DatabaseStorage();
