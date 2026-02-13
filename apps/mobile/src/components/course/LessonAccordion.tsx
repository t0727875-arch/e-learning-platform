import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage, getLocalizedText } from '../../contexts/LanguageContext';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { LessonWithChapters, ChapterWithContent, ContentNode, Progress } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LessonAccordionProps {
  lessons: LessonWithChapters[];
  courseId: string;
  progress: Progress[];
  isEnrolled: boolean;
}

export default function LessonAccordion({ lessons, courseId, progress, isEnrolled }: LessonAccordionProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const isContentCompleted = (contentId: string): boolean => {
    return progress.some(p => p.contentNodeId === contentId && p.completed);
  };

  const getLessonProgress = (lesson: LessonWithChapters): number => {
    let totalContents = 0;
    let completedContents = 0;
    
    lesson.chapters.forEach(chapter => {
      chapter.contents.forEach(content => {
        totalContents++;
        if (isContentCompleted(content.id)) {
          completedContents++;
        }
      });
    });
    
    return totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
  };

  const getLessonStatus = (lesson: LessonWithChapters): 'not_started' | 'in_progress' | 'completed' => {
    const progressPercent = getLessonProgress(lesson);
    if (progressPercent === 0) return 'not_started';
    if (progressPercent === 100) return 'completed';
    return 'in_progress';
  };

  const handleContentPress = (content: ContentNode, chapter: ChapterWithContent, lesson: LessonWithChapters) => {
    if (!isEnrolled) {
      return;
    }
    navigation.navigate('ChapterViewer', {
      contentId: content.id,
      courseId,
      chapterId: chapter.id,
      lessonId: lesson.id,
    });
  };

  return (
    <View style={styles.container}>
      {lessons.map((lesson, lessonIndex) => {
        const isLessonExpanded = expandedLessons.has(lesson.id);
        const lessonStatus = getLessonStatus(lesson);
        const lessonProgress = getLessonProgress(lesson);

        return (
          <View key={lesson.id} style={styles.lessonContainer}>
            <TouchableOpacity
              style={styles.lessonHeader}
              onPress={() => toggleLesson(lesson.id)}
            >
              <View style={styles.lessonInfo}>
                <View style={[
                  styles.statusIndicator,
                  lessonStatus === 'completed' && styles.statusCompleted,
                  lessonStatus === 'in_progress' && styles.statusInProgress,
                ]}>
                  {lessonStatus === 'completed' ? (
                    <Text style={styles.statusIcon}>✓</Text>
                  ) : (
                    <Text style={styles.lessonNumber}>{lessonIndex + 1}</Text>
                  )}
                </View>
                <View style={styles.lessonTitleContainer}>
                  <Text style={styles.lessonTitle}>
                    {getLocalizedText(lesson, language)}
                  </Text>
                  <Text style={styles.lessonMeta}>
                    {lesson.chapters.length} Chapters • {lessonProgress}% Complete
                  </Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>{isLessonExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {isLessonExpanded && (
              <View style={styles.lessonContent}>
                {lesson.chapters.map((chapter, chapterIndex) => {
                  const isChapterExpanded = expandedChapters.has(chapter.id);

                  return (
                    <View key={chapter.id} style={styles.chapterContainer}>
                      <TouchableOpacity
                        style={styles.chapterHeader}
                        onPress={() => toggleChapter(chapter.id)}
                      >
                        <View style={styles.chapterInfo}>
                          <Text style={styles.chapterNumber}>
                            {lessonIndex + 1}.{chapterIndex + 1}
                          </Text>
                          <Text style={styles.chapterTitle}>
                            {getLocalizedText(chapter, language)}
                          </Text>
                        </View>
                        <Text style={styles.expandIcon}>
                          {isChapterExpanded ? '▼' : '▶'}
                        </Text>
                      </TouchableOpacity>

                      {isChapterExpanded && (
                        <View style={styles.chapterContent}>
                          {chapter.contents.map((content) => {
                            const isCompleted = isContentCompleted(content.id);

                            return (
                              <TouchableOpacity
                                key={content.id}
                                style={[
                                  styles.contentItem,
                                  !isEnrolled && styles.contentLocked,
                                ]}
                                onPress={() => handleContentPress(content, chapter, lesson)}
                                disabled={!isEnrolled}
                              >
                                <View style={[
                                  styles.contentStatus,
                                  isCompleted && styles.contentStatusCompleted,
                                ]}>
                                  {isCompleted ? (
                                    <Text style={styles.contentStatusIcon}>✓</Text>
                                  ) : !isEnrolled ? (
                                    <Text style={styles.contentStatusIcon}>🔒</Text>
                                  ) : (
                                    <Text style={styles.contentStatusIcon}>○</Text>
                                  )}
                                </View>
                                <View style={styles.contentInfo}>
                                  <Text style={[
                                    styles.contentTitle,
                                    isCompleted && styles.contentTitleCompleted,
                                  ]}>
                                    {getLocalizedText(content, language)}
                                  </Text>
                                  <Text style={styles.contentType}>
                                    {content.contentType === 'video' ? '🎥 Video' : '📄 Text'}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  lessonContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusInProgress: {
    backgroundColor: '#fef3c7',
  },
  statusIcon: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  lessonNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  lessonTitleContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  lessonMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  expandIcon: {
    fontSize: 12,
    color: '#64748b',
  },
  lessonContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chapterContainer: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  chapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterNumber: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
    marginRight: 8,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  chapterContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contentLocked: {
    opacity: 0.6,
  },
  contentStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentStatusCompleted: {
    backgroundColor: '#dcfce7',
  },
  contentStatusIcon: {
    fontSize: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  contentTitleCompleted: {
    color: '#16a34a',
  },
  contentType: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
