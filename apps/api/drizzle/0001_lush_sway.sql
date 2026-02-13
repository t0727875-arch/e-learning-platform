CREATE TABLE "certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unique_code" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"path_id" varchar,
	"course_id" varchar,
	"student_name" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"title_fr" varchar(255),
	"issued_at" timestamp DEFAULT now(),
	"pdf_url" varchar(500),
	CONSTRAINT "certificates_unique_code_unique" UNIQUE("unique_code")
);
--> statement-breakpoint
CREATE TABLE "classroom_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classroom_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'student' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"join_code" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "classrooms_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "content_nodes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"parent_id" varchar,
	"created_by" varchar NOT NULL,
	"node_type" varchar(50) NOT NULL,
	"depth" integer DEFAULT 0,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"title_fr" varchar(255),
	"content_type" varchar(20),
	"video_url" varchar(500),
	"article_content_en" text,
	"article_content_ar" text,
	"article_content_fr" text,
	"content_json" jsonb,
	"summary_en" text,
	"summary_ar" text,
	"summary_fr" text,
	"has_quiz" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"title_fr" varchar(255),
	"description_en" text,
	"description_ar" text,
	"description_fr" text,
	"thumbnail_url" varchar(500),
	"is_published" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_name" varchar(255),
	"donor_email" varchar(255),
	"amount" real NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"donation_type" varchar(50) DEFAULT 'sadaqah',
	"message" text,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"path_id" varchar,
	"course_id" varchar,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"friend_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"previous_rank" integer,
	"current_rank" integer,
	"notified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "paths" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" varchar NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"title_fr" varchar(255),
	"description_en" text,
	"description_ar" text,
	"description_fr" text,
	"thumbnail_url" varchar(500),
	"is_published" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content_node_id" varchar NOT NULL,
	"summary_viewed" boolean DEFAULT false,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" varchar NOT NULL,
	"difficulty_level" integer DEFAULT 1,
	"question_text_en" text NOT NULL,
	"question_text_ar" text,
	"question_text_fr" text,
	"options_en" jsonb NOT NULL,
	"options_ar" jsonb,
	"options_fr" jsonb,
	"correct_answer_index" integer NOT NULL,
	"explanation_en" text,
	"explanation_ar" text,
	"explanation_fr" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"quiz_id" varchar NOT NULL,
	"seed" varchar(100) NOT NULL,
	"current_level" integer DEFAULT 1,
	"score" real,
	"passed" boolean DEFAULT false,
	"points_earned" integer DEFAULT 0,
	"questions_answered" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_node_id" varchar,
	"course_id" varchar,
	"path_id" varchar,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"title_fr" varchar(255),
	"passing_score" integer DEFAULT 70,
	"timer_enabled" boolean DEFAULT false,
	"timer_minutes" integer DEFAULT 30,
	"quiz_level" integer DEFAULT 1,
	"is_level_0" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hierarchy_depth" integer DEFAULT 5,
	"difficulty_levels_count" integer DEFAULT 5,
	"questions_per_level" integer DEFAULT 20,
	"default_passing_score" integer DEFAULT 70,
	"quiz_timer_enabled" boolean DEFAULT false,
	"quiz_timer_minutes" integer DEFAULT 30,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(20) DEFAULT 'student' NOT NULL,
	"country" varchar(100),
	"preferred_language" varchar(10) DEFAULT 'en',
	"points" integer DEFAULT 0,
	"is_blocked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"streak_freeze_count" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "weekly_team_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"points_contributed" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "weekly_teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" timestamp NOT NULL,
	"week_end" timestamp NOT NULL,
	"team_name" varchar(100) NOT NULL,
	"total_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_classrooms_teacher" ON "classrooms" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_classrooms_join_code" ON "classrooms" USING btree ("join_code");--> statement-breakpoint
CREATE INDEX "idx_content_nodes_course" ON "content_nodes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_content_nodes_parent" ON "content_nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_courses_path" ON "courses" USING btree ("path_id");--> statement-breakpoint
CREATE INDEX "idx_courses_published" ON "courses" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_friendships_user" ON "friendships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_friendships_friend" ON "friendships" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_history_user" ON "leaderboard_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_progress_user" ON "progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_progress_node" ON "progress" USING btree ("content_node_id");--> statement-breakpoint
CREATE INDEX "idx_questions_quiz" ON "questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_questions_difficulty" ON "questions" USING btree ("difficulty_level");--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_user" ON "quiz_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_quiz" ON "quiz_attempts" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_quizzes_content_node" ON "quizzes" USING btree ("content_node_id");--> statement-breakpoint
CREATE INDEX "idx_quizzes_course" ON "quizzes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_quizzes_level" ON "quizzes" USING btree ("quiz_level");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_country" ON "user_profiles" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_points" ON "user_profiles" USING btree ("points");--> statement-breakpoint
CREATE INDEX "idx_user_streaks_user" ON "user_streaks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_weekly_team_members_team" ON "weekly_team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_weekly_team_members_user" ON "weekly_team_members" USING btree ("user_id");