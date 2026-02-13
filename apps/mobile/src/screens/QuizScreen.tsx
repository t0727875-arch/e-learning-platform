import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { quizzesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { QuizResult } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'Quiz'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function QuizScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { quizId, lessonId, courseId, type } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const { data: quizSession, isLoading } = useQuery({
    queryKey: ['quizSession', quizId],
    queryFn: async () => {
      const session = await quizzesApi.start(quizId);
      setAttemptId(session?.attempt?.id || null);
      return session;
    },
  });

  const questions = useMemo(() => {
    return quizSession?.questions || [];
  }, [quizSession]);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!attemptId) {
        throw new Error('Quiz not loaded');
      }
      const answerList = Object.entries(answers).map(([questionId, answerIndex]) => ({
        questionId,
        answerIndex,
      }));
      return quizzesApi.submit(attemptId, answerList);
    },
    onSuccess: (data: any) => {
      const mapped: QuizResult = {
        passed: data.passed,
        score: Math.round(data.percentage || 0),
        totalQuestions: data.maxScore || 0,
        correctAnswers: data.score || 0,
      };
      setResult(mapped);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit quiz');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!quizSession || questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Quiz not available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    submitMutation.mutate();
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResult(null);
  };

  if (showResults && result) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultsContainer}>
          <View style={[
            styles.resultIcon,
            result.passed ? styles.resultIconPass : styles.resultIconFail
          ]}>
            <Text style={styles.resultEmoji}>
              {result.passed ? '🎉' : '📚'}
            </Text>
          </View>
          
          <Text style={styles.resultTitle}>
            {result.passed ? 'Congratulations!' : 'Keep Learning'}
          </Text>
          
          <Text style={styles.resultSubtitle}>
            {result.passed 
              ? 'You passed the quiz!' 
              : 'You didn\'t pass this time. Review the material and try again.'}
          </Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={[
              styles.scoreValue,
              result.passed ? styles.scoreValuePass : styles.scoreValueFail
            ]}>
              {result.score}%
            </Text>
            <Text style={styles.scoreDetails}>
              {result.correctAnswers} of {result.totalQuestions} correct
            </Text>
            <Text style={styles.passingScore}>
              Passing score: {quizSession.passingScore}%
            </Text>
          </View>

          <View style={styles.resultActions}>
            {!result.passed && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.continueButton, !result.passed && styles.secondaryButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[
                styles.continueButtonText,
                !result.passed && styles.secondaryButtonText
              ]}>
                {result.passed ? 'Continue Learning' : 'Review Material'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.quizTitle}>
          {getLocalizedText(quizSession, language) || (type === 'lesson' ? 'Lesson Quiz' : 'Course Quiz')}
        </Text>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} />
          </View>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {getLocalizedText(currentQuestion, language, 'question')}
        </Text>

        <View style={styles.optionsContainer}>
          {(currentQuestion.optionsEn || []).map((optionText: string, index: number) => {
            const option = {
              id: String(index),
              textEn: optionText,
              textAr: currentQuestion.optionsAr?.[index],
              textFr: currentQuestion.optionsFr?.[index],
            };
            const isSelected = answers[currentQuestion.id] === index;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectAnswer(currentQuestion.id, index)}
              >
                <View style={[
                  styles.optionRadio,
                  isSelected && styles.optionRadioSelected,
                ]}>
                  {isSelected && <View style={styles.optionRadioInner} />}
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                  {getLocalizedText(option, language, 'text')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[styles.submitButton, submitMutation.isPending && styles.submitButtonLoading]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.questionDots}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentQuestionIndex && styles.dotCurrent,
              answers[questions[index].id] && styles.dotAnswered,
            ]}
            onPress={() => setCurrentQuestionIndex(index)}
          />
        ))}
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
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#0f766e',
    padding: 24,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  progressIndicator: {},
  progressText: {
    fontSize: 14,
    color: '#99f6e4',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  questionContainer: {
    padding: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionButtonSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: '#0f766e',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f766e',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#0f766e',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 0,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0f766e',
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  questionDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
  },
  dotCurrent: {
    backgroundColor: '#0f766e',
  },
  dotAnswered: {
    backgroundColor: '#99f6e4',
  },
  resultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconPass: {
    backgroundColor: '#dcfce7',
  },
  resultIconFail: {
    backgroundColor: '#fef3c7',
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreValuePass: {
    color: '#16a34a',
  },
  scoreValueFail: {
    color: '#dc2626',
  },
  scoreDetails: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  passingScore: {
    fontSize: 14,
    color: '#94a3b8',
  },
  resultActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#0f766e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#0f766e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#475569',
  },
});
