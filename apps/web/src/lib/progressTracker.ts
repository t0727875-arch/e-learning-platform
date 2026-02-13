import type { ContentNode, Progress, Enrollment, QuizAttempt, Certificate, Quiz } from "@shared/schema";

export type LearningState = "NOT_STARTED" | "IN_PROGRESS" | "QUIZ_REQUIRED" | "COMPLETED";

export interface ContentWithDetails extends ContentNode {
  contents?: ContentNode[];
}

export interface LessonWithChapters extends ContentNode {
  chapters: ContentWithDetails[];
}

export interface LessonState {
  lessonId: string;
  state: LearningState;
  progress: number;
  contentCompleted: number;
  contentTotal: number;
  quizPassed: boolean;
  quizRequired: boolean;
  isLocked: boolean;
}

export interface CourseState {
  courseId: string;
  state: LearningState;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  finalQuizPassed: boolean;
  finalQuizRequired: boolean;
  hasCertificate: boolean;
}

export interface ResumePoint {
  type: "content" | "quiz" | "course_quiz";
  lessonId?: string;
  chapterId?: string;
  contentId?: string;
  quizId?: string;
  courseId?: string;
}

export class ProgressTracker {
  private hierarchy: LessonWithChapters[];
  private progress: Progress[];
  private enrollment: Enrollment | null;
  private quizAttempts: QuizAttempt[];
  private certificates: Certificate[];
  private lessonQuizzes: Map<string, Quiz[]>;
  private courseQuiz: Quiz | null;
  private courseId: string;

  constructor(
    courseId: string,
    hierarchy: LessonWithChapters[],
    progress: Progress[],
    enrollment: Enrollment | null,
    quizAttempts: QuizAttempt[],
    certificates: Certificate[],
    lessonQuizzes: Map<string, Quiz[]> = new Map(),
    courseQuiz: Quiz | null = null
  ) {
    this.courseId = courseId;
    this.hierarchy = hierarchy || [];
    this.progress = progress || [];
    this.enrollment = enrollment || null;
    this.quizAttempts = quizAttempts || [];
    this.certificates = certificates || [];
    this.lessonQuizzes = lessonQuizzes;
    this.courseQuiz = courseQuiz;
  }

  isContentCompleted(contentId: string): boolean {
    return this.progress.some((p) => p.contentNodeId === contentId && p.completed);
  }

  isQuizPassed(quizId: string): boolean {
    return this.quizAttempts.some((a) => a.quizId === quizId && a.passed);
  }

  hasCertificateForCourse(): boolean {
    return this.certificates.some((c) => c.courseId === this.courseId);
  }

  getAllContentsForLesson(lesson: LessonWithChapters): ContentNode[] {
    const contents: ContentNode[] = [];
    lesson.chapters?.forEach((chapter) => {
      chapter.contents?.forEach((content) => {
        contents.push(content);
      });
    });
    return contents;
  }

  getLessonState(lesson: LessonWithChapters, lessonIndex: number): LessonState {
    const contents = this.getAllContentsForLesson(lesson);
    const completedCount = contents.filter((c) => this.isContentCompleted(c.id)).length;
    const totalCount = contents.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const lessonQuizList = this.lessonQuizzes.get(lesson.id) || [];
    const hasQuiz = lesson.hasQuiz || lessonQuizList.length > 0;
    const quizPassed = lessonQuizList.some((q) => this.isQuizPassed(q.id));

    const previousLessonsCompleted = this.arePreviousLessonsCompleted(lessonIndex);
    const isLocked = !this.enrollment || (lessonIndex > 0 && !previousLessonsCompleted);

    let state: LearningState;
    if (completedCount === 0) {
      state = "NOT_STARTED";
    } else if (completedCount === totalCount) {
      if (hasQuiz && !quizPassed) {
        state = "QUIZ_REQUIRED";
      } else {
        state = "COMPLETED";
      }
    } else {
      state = "IN_PROGRESS";
    }

    return {
      lessonId: lesson.id,
      state,
      progress: progressPercent,
      contentCompleted: completedCount,
      contentTotal: totalCount,
      quizPassed,
      quizRequired: hasQuiz,
      isLocked,
    };
  }

  private arePreviousLessonsCompleted(lessonIndex: number): boolean {
    for (let i = 0; i < lessonIndex; i++) {
      const lesson = this.hierarchy[i];
      const lessonState = this.getLessonStateByIndex(i);
      if (lessonState.state !== "COMPLETED") {
        return false;
      }
    }
    return true;
  }

  private getLessonStateByIndex(index: number): LessonState {
    const lesson = this.hierarchy[index];
    const contents = this.getAllContentsForLesson(lesson);
    const completedCount = contents.filter((c) => this.isContentCompleted(c.id)).length;
    const totalCount = contents.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const lessonQuizList = this.lessonQuizzes.get(lesson.id) || [];
    const hasQuiz = lesson.hasQuiz || lessonQuizList.length > 0;
    const quizPassed = lessonQuizList.some((q) => this.isQuizPassed(q.id));

    let state: LearningState;
    if (completedCount === 0) {
      state = "NOT_STARTED";
    } else if (completedCount === totalCount) {
      if (hasQuiz && !quizPassed) {
        state = "QUIZ_REQUIRED";
      } else {
        state = "COMPLETED";
      }
    } else {
      state = "IN_PROGRESS";
    }

    return {
      lessonId: lesson.id,
      state,
      progress: progressPercent,
      contentCompleted: completedCount,
      contentTotal: totalCount,
      quizPassed,
      quizRequired: hasQuiz,
      isLocked: false,
    };
  }

  getCourseState(): CourseState {
    if (!this.enrollment) {
      return {
        courseId: this.courseId,
        state: "NOT_STARTED",
        progress: 0,
        lessonsCompleted: 0,
        lessonsTotal: this.hierarchy.length,
        finalQuizPassed: false,
        finalQuizRequired: !!this.courseQuiz,
        hasCertificate: false,
      };
    }

    const lessonStates = this.hierarchy.map((lesson, index) => this.getLessonState(lesson, index));
    const completedLessons = lessonStates.filter((ls) => ls.state === "COMPLETED").length;
    const totalLessons = this.hierarchy.length;

    const allContents: string[] = [];
    this.hierarchy.forEach((lesson) => {
      this.getAllContentsForLesson(lesson).forEach((content) => {
        allContents.push(content.id);
      });
    });
    const completedContents = allContents.filter((id) => this.isContentCompleted(id)).length;
    const progressPercent = allContents.length > 0 ? Math.round((completedContents / allContents.length) * 100) : 0;

    const finalQuizRequired = !!this.courseQuiz;
    const finalQuizPassed = this.courseQuiz ? this.isQuizPassed(this.courseQuiz.id) : true;
    const hasCertificate = this.hasCertificateForCourse();

    let state: LearningState;
    if (completedContents === 0) {
      state = "NOT_STARTED";
    } else if (completedLessons === totalLessons) {
      if (finalQuizRequired && !finalQuizPassed) {
        state = "QUIZ_REQUIRED";
      } else if (hasCertificate || (completedLessons === totalLessons && (!finalQuizRequired || finalQuizPassed))) {
        state = "COMPLETED";
      } else {
        state = "QUIZ_REQUIRED";
      }
    } else {
      state = "IN_PROGRESS";
    }

    return {
      courseId: this.courseId,
      state,
      progress: progressPercent,
      lessonsCompleted: completedLessons,
      lessonsTotal: totalLessons,
      finalQuizPassed,
      finalQuizRequired,
      hasCertificate,
    };
  }

  getResumePoint(): ResumePoint | null {
    if (!this.enrollment) return null;

    for (let lessonIndex = 0; lessonIndex < this.hierarchy.length; lessonIndex++) {
      const lesson = this.hierarchy[lessonIndex];
      const lessonState = this.getLessonState(lesson, lessonIndex);

      if (lessonState.isLocked) continue;

      if (lessonState.state === "QUIZ_REQUIRED") {
        const lessonQuizList = this.lessonQuizzes.get(lesson.id) || [];
        if (lessonQuizList.length > 0) {
          return {
            type: "quiz",
            lessonId: lesson.id,
            quizId: lessonQuizList[0].id,
            courseId: this.courseId,
          };
        }
      }

      if (lessonState.state === "NOT_STARTED" || lessonState.state === "IN_PROGRESS") {
        for (const chapter of lesson.chapters || []) {
          for (const content of chapter.contents || []) {
            if (!this.isContentCompleted(content.id)) {
              return {
                type: "content",
                lessonId: lesson.id,
                chapterId: chapter.id,
                contentId: content.id,
                courseId: this.courseId,
              };
            }
          }
        }
      }
    }

    const courseState = this.getCourseState();
    if (courseState.state === "QUIZ_REQUIRED" && this.courseQuiz) {
      return {
        type: "course_quiz",
        quizId: this.courseQuiz.id,
        courseId: this.courseId,
      };
    }

    return null;
  }

  getFirstContent(): ContentNode | null {
    if (this.hierarchy.length === 0) return null;
    const firstLesson = this.hierarchy[0];
    if (firstLesson.chapters && firstLesson.chapters.length > 0) {
      const firstChapter = firstLesson.chapters[0];
      if (firstChapter.contents && firstChapter.contents.length > 0) {
        return firstChapter.contents[0];
      }
    }
    return null;
  }

  getNextContent(currentContentId: string): ContentNode | null {
    let foundCurrent = false;
    for (const lesson of this.hierarchy) {
      for (const chapter of lesson.chapters || []) {
        for (const content of chapter.contents || []) {
          if (foundCurrent) return content;
          if (content.id === currentContentId) foundCurrent = true;
        }
      }
    }
    return null;
  }

  getPreviousContent(currentContentId: string): ContentNode | null {
    let previousContent: ContentNode | null = null;
    for (const lesson of this.hierarchy) {
      for (const chapter of lesson.chapters || []) {
        for (const content of chapter.contents || []) {
          if (content.id === currentContentId) return previousContent;
          previousContent = content;
        }
      }
    }
    return null;
  }

  getContentPosition(contentId: string): { current: number; total: number; lessonIndex: number; chapterIndex: number } | null {
    let position = 0;
    let totalContents = 0;
    
    for (const lesson of this.hierarchy) {
      for (const chapter of lesson.chapters || []) {
        totalContents += chapter.contents?.length || 0;
      }
    }

    for (let lessonIndex = 0; lessonIndex < this.hierarchy.length; lessonIndex++) {
      const lesson = this.hierarchy[lessonIndex];
      for (let chapterIndex = 0; chapterIndex < (lesson.chapters?.length || 0); chapterIndex++) {
        const chapter = lesson.chapters[chapterIndex];
        for (const content of chapter.contents || []) {
          position++;
          if (content.id === contentId) {
            return { current: position, total: totalContents, lessonIndex, chapterIndex };
          }
        }
      }
    }
    return null;
  }

  getContentInfo(contentId: string): { lesson: LessonWithChapters; chapter: ContentWithDetails; content: ContentNode } | null {
    for (const lesson of this.hierarchy) {
      for (const chapter of lesson.chapters || []) {
        for (const content of chapter.contents || []) {
          if (content.id === contentId) {
            return { lesson, chapter, content };
          }
        }
      }
    }
    return null;
  }

  isEnrolled(): boolean {
    return !!this.enrollment;
  }
}

export function createProgressTracker(
  courseId: string,
  hierarchy: LessonWithChapters[],
  progress: Progress[],
  enrollment: Enrollment | null,
  quizAttempts: QuizAttempt[],
  certificates: Certificate[],
  lessonQuizzes?: Map<string, Quiz[]>,
  courseQuiz?: Quiz | null
): ProgressTracker {
  return new ProgressTracker(
    courseId,
    hierarchy,
    progress,
    enrollment,
    quizAttempts,
    certificates,
    lessonQuizzes,
    courseQuiz
  );
}
