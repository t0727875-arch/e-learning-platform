import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userRoleEnum = ["admin", "teacher", "student"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  country: varchar("country", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  points: integer("points").default(0),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_country").on(table.country),
  index("idx_user_profiles_points").on(table.points),
]);

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hierarchyDepth: integer("hierarchy_depth").default(5),
  difficultyLevelsCount: integer("difficulty_levels_count").default(5),
  questionsPerLevel: integer("questions_per_level").default(20),
  defaultPassingScore: integer("default_passing_score").default(70),
  quizTimerEnabled: boolean("quiz_timer_enabled").default(false),
  quizTimerMinutes: integer("quiz_timer_minutes").default(30),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;

export const paths = pgTable("paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdBy: varchar("created_by").notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleFr: varchar("title_fr", { length: 255 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  descriptionFr: text("description_fr"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isPublished: boolean("is_published").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPathSchema = createInsertSchema(paths).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPath = z.infer<typeof insertPathSchema>;
export type Path = typeof paths.$inferSelect;

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pathId: varchar("path_id").notNull().references(() => paths.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleFr: varchar("title_fr", { length: 255 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  descriptionFr: text("description_fr"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isPublished: boolean("is_published").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_courses_path").on(table.pathId),
  index("idx_courses_published").on(table.isPublished),
]);

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export const contentNodeTypes = ["lesson", "chapter", "chapter_content"] as const;
export type ContentNodeType = (typeof contentNodeTypes)[number];

export const contentNodes = pgTable("content_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id").references(() => contentNodes.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull(),
  nodeType: varchar("node_type", { length: 50 }).notNull(),
  depth: integer("depth").default(0),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleFr: varchar("title_fr", { length: 255 }),
  contentType: varchar("content_type", { length: 20 }),
  videoUrl: varchar("video_url", { length: 500 }),
  articleContentEn: text("article_content_en"),
  articleContentAr: text("article_content_ar"),
  articleContentFr: text("article_content_fr"),
  contentJson: jsonb("content_json"),
  summaryEn: text("summary_en"),
  summaryAr: text("summary_ar"),
  summaryFr: text("summary_fr"),
  hasQuiz: boolean("has_quiz").default(false),
  isPublished: boolean("is_published").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_content_nodes_course").on(table.courseId),
  index("idx_content_nodes_parent").on(table.parentId),
]);

export const insertContentNodeSchema = createInsertSchema(contentNodes)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    parentId: z.string().nullable().optional(),
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
  });
export type InsertContentNode = z.infer<typeof insertContentNodeSchema>;
export type ContentNode = typeof contentNodes.$inferSelect;

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentNodeId: varchar("content_node_id"),
  courseId: varchar("course_id"),
  pathId: varchar("path_id"),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleFr: varchar("title_fr", { length: 255 }),
  passingScore: integer("passing_score").default(70),
  timerEnabled: boolean("timer_enabled").default(false),
  timerMinutes: integer("timer_minutes").default(30),
  quizLevel: integer("quiz_level").default(1),
  isLevel0: boolean("is_level_0").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_quizzes_content_node").on(table.contentNodeId),
  index("idx_quizzes_course").on(table.courseId),
  index("idx_quizzes_level").on(table.quizLevel),
]);

export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  difficultyLevel: integer("difficulty_level").default(1),
  questionTextEn: text("question_text_en").notNull(),
  questionTextAr: text("question_text_ar"),
  questionTextFr: text("question_text_fr"),
  optionsEn: jsonb("options_en").notNull(),
  optionsAr: jsonb("options_ar"),
  optionsFr: jsonb("options_fr"),
  correctAnswerIndex: integer("correct_answer_index").notNull(),
  explanationEn: text("explanation_en"),
  explanationAr: text("explanation_ar"),
  explanationFr: text("explanation_fr"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_questions_quiz").on(table.quizId),
  index("idx_questions_difficulty").on(table.difficultyLevel),
]);

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pathId: varchar("path_id").references(() => paths.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_enrollments_user").on(table.userId),
]);

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  contentNodeId: varchar("content_node_id").notNull().references(() => contentNodes.id, { onDelete: "cascade" }),
  summaryViewed: boolean("summary_viewed").default(false),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_progress_user").on(table.userId),
  index("idx_progress_node").on(table.contentNodeId),
]);

export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, createdAt: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  seed: varchar("seed", { length: 100 }).notNull(),
  currentLevel: integer("current_level").default(1),
  score: real("score"),
  passed: boolean("passed").default(false),
  pointsEarned: integer("points_earned").default(0),
  questionsAnswered: jsonb("questions_answered"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_quiz_attempts_user").on(table.userId),
  index("idx_quiz_attempts_quiz").on(table.quizId),
]);

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, startedAt: true });
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uniqueCode: varchar("unique_code", { length: 50 }).notNull().unique(),
  userId: varchar("user_id").notNull(),
  pathId: varchar("path_id"),
  courseId: varchar("course_id"),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleFr: varchar("title_fr", { length: 255 }),
  issuedAt: timestamp("issued_at").defaultNow(),
  pdfUrl: varchar("pdf_url", { length: 500 }),
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, issuedAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export const classrooms = pgTable("classrooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  joinCode: varchar("join_code", { length: 20 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_classrooms_teacher").on(table.teacherId),
  index("idx_classrooms_join_code").on(table.joinCode),
]);

export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;
export type Classroom = typeof classrooms.$inferSelect;

export const classroomMembers = pgTable("classroom_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classroomId: varchar("classroom_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").notNull().default("student"),
});


export const insertClassroomMemberSchema = createInsertSchema(classroomMembers).omit({ id: true, joinedAt: true });
export type InsertClassroomMember = z.infer<typeof insertClassroomMemberSchema>;
export type ClassroomMember = typeof classroomMembers.$inferSelect;

export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  friendId: varchar("friend_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_friendships_user").on(table.userId),
  index("idx_friendships_friend").on(table.friendId),
]);

export const insertFriendshipSchema = createInsertSchema(friendships).omit({ id: true, createdAt: true });
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;

export const weeklyTeams = pgTable("weekly_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  teamName: varchar("team_name", { length: 100 }).notNull(),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeeklyTeamSchema = createInsertSchema(weeklyTeams).omit({ id: true, createdAt: true });
export type InsertWeeklyTeam = z.infer<typeof insertWeeklyTeamSchema>;
export type WeeklyTeam = typeof weeklyTeams.$inferSelect;

export const weeklyTeamMembers = pgTable("weekly_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  userId: varchar("user_id").notNull(),
  pointsContributed: integer("points_contributed").default(0),
}, (table) => [
  index("idx_weekly_team_members_team").on(table.teamId),
  index("idx_weekly_team_members_user").on(table.userId),
]);

export const insertWeeklyTeamMemberSchema = createInsertSchema(weeklyTeamMembers).omit({ id: true });
export type InsertWeeklyTeamMember = z.infer<typeof insertWeeklyTeamMemberSchema>;
export type WeeklyTeamMember = typeof weeklyTeamMembers.$inferSelect;

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorName: varchar("donor_name", { length: 255 }),
  donorEmail: varchar("donor_email", { length: 255 }),
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  donationType: varchar("donation_type", { length: 50 }).default("sadaqah"),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export const userStreaks = pgTable("user_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  streakFreezeCount: integer("streak_freeze_count").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_streaks_user").on(table.userId),
]);

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({ id: true, updatedAt: true });
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;

export const leaderboardHistory = pgTable("leaderboard_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  previousRank: integer("previous_rank"),
  currentRank: integer("current_rank"),
  notified: boolean("notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_leaderboard_history_user").on(table.userId),
]);

export const insertLeaderboardHistorySchema = createInsertSchema(leaderboardHistory).omit({ id: true, createdAt: true });
export type InsertLeaderboardHistory = z.infer<typeof insertLeaderboardHistorySchema>;
export type LeaderboardHistory = typeof leaderboardHistory.$inferSelect;

export const pathsRelations = relations(paths, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  path: one(paths, { fields: [courses.pathId], references: [paths.id] }),
  contentNodes: many(contentNodes),
}));

export const contentNodesRelations = relations(contentNodes, ({ one, many }) => ({
  course: one(courses, { fields: [contentNodes.courseId], references: [courses.id] }),
  parent: one(contentNodes, { fields: [contentNodes.parentId], references: [contentNodes.id], relationName: "parentChild" }),
  children: many(contentNodes, { relationName: "parentChild" }),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  contentNode: one(contentNodes, { fields: [quizzes.contentNodeId], references: [contentNodes.id] }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
}));

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  members: many(classroomMembers),
}));

export const classroomMembersRelations = relations(classroomMembers, ({ one }) => ({
  classroom: one(classrooms, { fields: [classroomMembers.classroomId], references: [classrooms.id] }),
}));
