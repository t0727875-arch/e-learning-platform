import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

const getApiBaseUrl = (): string => {
  const expoConfig = Constants.expoConfig?.extra
    || (Constants.manifest as { extra?: Record<string, string> } | null)?.extra
    || (Constants.manifest2 as { extra?: Record<string, string> } | null)?.extra;
  
  console.log('Expo config extra:', expoConfig);
  
  if (expoConfig?.apiUrl) {
    console.log('Using configured API URL:', expoConfig.apiUrl);
    return expoConfig.apiUrl;
  }
  
  // For web, use the current host with port 3000 or same origin
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Use the same host as the current page but port 3000 for API
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const apiUrl = `${protocol}//${hostname}:3000`;
    console.log('Using web API URL:', apiUrl);
    return apiUrl;
  }
  
  if (__DEV__) {
    console.warn('API URL not configured. Using development fallback.');
    // For Android emulator, use 10.0.2.2 to access host machine
    // For iOS simulator and physical devices, use your local IP address
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // For iOS and physical devices, you need to set EXPO_PUBLIC_API_URL
    // to your computer's local IP (e.g., http://192.168.1.100:3000)
    return 'http://localhost:3000';
  }
  
  return '';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);

if (!API_BASE_URL && !__DEV__) {
  const errorMsg = 'CRITICAL: No API URL configured. Set EXPO_PUBLIC_API_URL environment variable or configure apiUrl in app.config.ts';
  console.error(errorMsg);
  if (Platform.OS !== 'web') {
    Alert.alert('Configuration Error', 'API URL not configured. Please contact support.');
  }
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem('authToken');
    }
    
    // Log connection errors for debugging
    if (!error.response) {
      console.error('API Connection Error:', {
        message: error.message,
        baseURL: API_BASE_URL,
        url: error.config?.url,
      });
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Connection Error',
          `Cannot connect to API server at ${API_BASE_URL}.\n\nPlease ensure:\n1. The API server is running\n2. Your device can reach the server\n3. EXPO_PUBLIC_API_URL is set correctly`,
          [{ text: 'OK' }]
        );
      }
    }
    
    return Promise.reject(error);
  }
);

export { storage };

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/local/login', { username, password });
    return response.data;
  },
  logout: async () => {
    await api.get('/logout');
  },
  getUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};

export const pathsApi = {
  getAll: async () => {
    const response = await api.get('/paths');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/paths/${id}`);
    return response.data;
  },
};

export const coursesApi = {
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  getByPath: async (pathId: string) => {
    const response = await api.get(`/courses?pathId=${pathId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
};

export const enrollmentsApi = {
  enroll: async (courseId: string) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
  },
  getMine: async () => {
    const response = await api.get('/enrollments');
    return response.data;
  },
  getByCourse: async (courseId: string) => {
    const response = await api.get('/enrollments');
    const enrollments = response.data || [];
    return enrollments.find((enrollment: any) => enrollment.courseId === courseId) || null;
  },
};

const normalizeContentNode = (node: any) => ({
  ...node,
  nodeType: node.nodeType === 'chapter_content' ? 'content' : node.nodeType,
  contentEn: node.articleContentEn ?? node.contentEn,
  contentAr: node.articleContentAr ?? node.contentAr,
  contentFr: node.articleContentFr ?? node.contentFr,
});

export const contentApi = {
  getByCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/content`);
    return (response.data || []).map(normalizeContentNode);
  },
  getById: async (id: string) => {
    const response = await api.get(`/content/${id}`);
    return normalizeContentNode(response.data);
  },
  getHierarchy: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/content/hierarchy`);
    return response.data;
  },
};

export const progressApi = {
  getMine: async () => {
    const response = await api.get('/progress');
    return response.data;
  },
  getByCourse: async (courseId: string) => {
    const [progressResponse, contentNodes] = await Promise.all([
      api.get('/progress'),
      contentApi.getByCourse(courseId),
    ]);
    const contentNodeIds = new Set((contentNodes || []).map((node: any) => node.id));
    return (progressResponse.data || []).filter((item: any) => contentNodeIds.has(item.contentNodeId));
  },
  markComplete: async (contentNodeId: string) => {
    const response = await api.post('/progress', { contentNodeId, completed: true });
    return response.data;
  },
};

export const quizzesApi = {
  getByLesson: async (lessonId: string) => {
    const response = await api.get(`/content/${lessonId}/quizzes`);
    return response.data?.[0] || null;
  },
  getByCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/quizzes`);
    return response.data?.[0] || null;
  },
  getLevel0: async () => {
    const response = await api.get('/quizzes/level/0');
    return response.data;
  },
  getLevelsByCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/quiz-levels`);
    return response.data;
  },
  getById: async (quizId: string) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },
  start: async (quizId: string) => {
    const response = await api.post(`/quizzes/${quizId}/start`);
    return response.data;
  },
  submit: async (attemptId: string, answers: { questionId: string; answerIndex: number }[]) => {
    const response = await api.post(`/quiz-attempts/${attemptId}/submit`, { answers });
    return response.data;
  },
};

export const certificatesApi = {
  getMine: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },
  getByCourse: async (courseId: string) => {
    const response = await api.get('/certificates');
    return (response.data || []).filter((certificate: any) => certificate.courseId === courseId);
  },
};

export const streakApi = {
  get: async () => {
    const response = await api.get('/streak');
    return response.data;
  },
  update: async () => {
    const response = await api.post('/streak/update');
    return response.data;
  },
};

export const leaderboardApi = {
  getGlobal: async (limit = 100) => {
    const response = await api.get(`/leaderboard/global?limit=${limit}`);
    return response.data;
  },
  getCountry: async () => {
    const response = await api.get('/leaderboard/country');
    return response.data;
  },
  getWeekly: async () => {
    const response = await api.get('/leaderboard/weekly');
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/leaderboard/notifications');
    return response.data;
  },
  markNotificationsSeen: async () => {
    const response = await api.post('/leaderboard/notifications/mark-seen');
    return response.data;
  },
};

export default api;
