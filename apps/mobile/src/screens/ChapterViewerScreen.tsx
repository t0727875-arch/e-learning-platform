import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { contentApi, progressApi, quizzesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { ContentNode } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'ChapterViewer'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChapterViewerScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { contentId, courseId, chapterId: passedChapterId, lessonId: passedLessonId } = route.params;

  const { data: allContent, isLoading } = useQuery({
    queryKey: ['content', courseId],
    queryFn: () => contentApi.getByCourse(courseId),
  });

  const currentContent = allContent?.find((n: ContentNode) => n.id === contentId);
  const chapterId = passedChapterId || currentContent?.parentId;
  const chapter = allContent?.find((n: ContentNode) => n.id === chapterId);
  const lessonId = passedLessonId || chapter?.parentId;

  const { data: lessonQuiz } = useQuery({
    queryKey: ['lessonQuiz', lessonId],
    queryFn: () => quizzesApi.getByLesson(lessonId!),
    enabled: !!lessonId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: (contentNodeId: string) => progressApi.markComplete(contentNodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const lesson = allContent?.find((n: ContentNode) => n.id === lessonId);
  const chapterContents = allContent?.filter((n: ContentNode) => n.parentId === chapterId && n.nodeType === 'content')
    .sort((a: ContentNode, b: ContentNode) => a.order - b.order) || [];
  
  const allChaptersInLesson = allContent?.filter((n: ContentNode) => n.parentId === lessonId && n.nodeType === 'chapter')
    .sort((a: ContentNode, b: ContentNode) => a.order - b.order) || [];
  
  const currentChapterIndex = allChaptersInLesson.findIndex((c: ContentNode) => c.id === chapterId);
  const nextChapter = allChaptersInLesson[currentChapterIndex + 1];
  const isLastChapter = currentChapterIndex === allChaptersInLesson.length - 1;

  const markChapterComplete = () => {
    chapterContents.forEach((content: ContentNode) => {
      markCompleteMutation.mutate(content.id);
    });
  };

  const handleNextChapter = () => {
    markChapterComplete();
    if (nextChapter) {
      const nextContents = allContent?.filter((n: ContentNode) => n.parentId === nextChapter.id && n.nodeType === 'content')
        .sort((a: ContentNode, b: ContentNode) => a.order - b.order) || [];
      const firstContent = nextContents[0];
      navigation.replace('ChapterViewer', {
        contentId: firstContent?.id || nextChapter.id,
        courseId,
        chapterId: nextChapter.id,
        lessonId,
      });
    }
  };

  const handleTakeLessonQuiz = () => {
    markChapterComplete();
    if (lessonQuiz) {
      navigation.navigate('Quiz', {
        quizId: lessonQuiz.id,
        lessonId,
        type: 'lesson',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Chapter not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lessonName}>
          {getLocalizedText(lesson, language)}
        </Text>
        <Text style={styles.chapterTitle}>
          {getLocalizedText(chapter, language)}
        </Text>
        <Text style={styles.chapterProgress}>
          Chapter {currentChapterIndex + 1} of {allChaptersInLesson.length}
        </Text>
      </View>

      <View style={styles.contentSection}>
        {chapterContents.map((content: ContentNode) => (
          <View key={content.id} style={styles.contentBlock}>
            {content.contentType === 'video' && content.videoUrl && (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoIcon}>🎥</Text>
                <Text style={styles.videoText}>Video Content</Text>
                <Text style={styles.videoUrl}>{content.videoUrl}</Text>
              </View>
            )}
            {content.contentType === 'text' && (
              <View style={styles.textContent}>
                <Text style={styles.contentTitle}>
                  {getLocalizedText(content, language)}
                </Text>
                <Text style={styles.contentText}>
                  {getLocalizedText(content, language, 'content')}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Chapter Summary</Text>
        <Text style={styles.summaryText}>
          You've completed this chapter. {isLastChapter 
            ? 'This is the last chapter in this lesson.'
            : 'Continue to the next chapter to progress further.'}
        </Text>
      </View>

      <View style={styles.navigationSection}>
        {!isLastChapter && nextChapter && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextChapter}
          >
            <Text style={styles.nextButtonText}>Continue to Next Chapter</Text>
            <Text style={styles.nextButtonArrow}>→</Text>
          </TouchableOpacity>
        )}

        {isLastChapter && lessonQuiz && (
          <TouchableOpacity
            style={styles.quizButton}
            onPress={handleTakeLessonQuiz}
          >
            <Text style={styles.quizButtonText}>Take Lesson Quiz</Text>
            <Text style={styles.quizButtonArrow}>📝</Text>
          </TouchableOpacity>
        )}

        {isLastChapter && !lessonQuiz && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              markChapterComplete();
              navigation.goBack();
            }}
          >
            <Text style={styles.completeButtonText}>Lesson Complete!</Text>
            <Text style={styles.completeButtonIcon}>✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#0f766e',
    padding: 24,
  },
  lessonName: {
    fontSize: 14,
    color: '#99f6e4',
    marginBottom: 8,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  chapterProgress: {
    fontSize: 14,
    color: '#99f6e4',
  },
  contentSection: {
    padding: 16,
  },
  contentBlock: {
    marginBottom: 16,
  },
  videoPlaceholder: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    color: '#94a3b8',
  },
  textContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  summarySection: {
    backgroundColor: '#f0fdfa',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#0f766e',
    lineHeight: 22,
  },
  navigationSection: {
    padding: 16,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: '#0f766e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonArrow: {
    color: '#fff',
    fontSize: 20,
  },
  quizButton: {
    backgroundColor: '#d97706',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizButtonArrow: {
    fontSize: 20,
  },
  completeButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonIcon: {
    color: '#fff',
    fontSize: 20,
  },
});
