export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'teacher' | 'student';
  profileImageUrl?: string;
  isGuest?: boolean;
}

export interface Path {
  id: string;
  titleEn: string;
  titleAr?: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  imageUrl?: string;
  isPublished: boolean;
  order: number;
}

export interface Course {
  id: string;
  pathId: string;
  titleEn: string;
  titleAr?: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  imageUrl?: string;
  videoUrl?: string;
  objectives?: string[];
  isPublished: boolean;
  order: number;
}

export interface ContentNode {
  id: string;
  courseId: string;
  parentId?: string;
  nodeType: 'lesson' | 'chapter' | 'content';
  titleEn: string;
  titleAr?: string;
  titleFr?: string;
  contentEn?: string;
  contentAr?: string;
  contentFr?: string;
  contentType?: 'text' | 'video' | 'image';
  videoUrl?: string;
  isPublished: boolean;
  order: number;
}

export interface LessonWithChapters extends ContentNode {
  chapters: ChapterWithContent[];
}

export interface ChapterWithContent extends ContentNode {
  contents: ContentNode[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
}

export interface Progress {
  id: string;
  userId: string;
  contentNodeId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Quiz {
  id: string;
  lessonId?: string;
  courseId?: string;
  titleEn: string;
  titleAr?: string;
  titleFr?: string;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionEn: string;
  questionAr?: string;
  questionFr?: string;
  titleEn?: string;
  titleAr?: string;
  titleFr?: string;
  options: QuestionOption[];
  correctAnswer: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  textEn: string;
  textAr?: string;
  textFr?: string;
  titleEn?: string;
  titleAr?: string;
  titleFr?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  certificateUrl?: string;
}

export interface QuizResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}
