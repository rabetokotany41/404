import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export const checkService = {
  checkContent: async (contentData) => {
    const response = await api.post('/check', contentData);
    return response.data;
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(`/check/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCheckById: async (checkId) => {
    const response = await api.get(`/check/${checkId}`);
    return response.data;
  },

  deleteCheck: async (checkId) => {
    const response = await api.delete(`/check/${checkId}`);
    return response.data;
  },

  getCachedResults: async () => {
    const response = await api.get('/check/cached');
    return response.data;
  },

  reportCheck: async (checkId, reportData) => {
    const response = await api.post(`/check/${checkId}/report`, reportData);
    return response.data;
  }
};

export const learningService = {
  getModules: async (category = null, difficulty = null) => {
    let url = '/learning/modules';
    const params = [];
    if (category) params.push(`category=${category}`);
    if (difficulty) params.push(`difficulty=${difficulty}`);
    if (params.length > 0) url += '?' + params.join('&');

    const response = await api.get(url);
    return response.data;
  },

  getModuleById: async (moduleId) => {
    const response = await api.get(`/learning/modules/${moduleId}`);
    return response.data;
  },

  startModule: async (moduleId) => {
    const response = await api.post(`/learning/modules/${moduleId}/start`);
    return response.data;
  },

  completeModule: async (moduleId, quizResults = null) => {
    const response = await api.post(`/learning/modules/${moduleId}/complete`, {
      quizResults
    });
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/learning/progress');
    return response.data;
  },

  getCertificates: async () => {
    const response = await api.get('/learning/certificates');
    return response.data;
  },

  updateProgress: async (moduleId, progressData) => {
    const response = await api.put(`/learning/modules/${moduleId}/progress`, progressData);
    return response.data;
  }
};

export const shareService = {
  shareContent: async (checkId, platform, shareData) => {
    const response = await api.post(`/share/${checkId}`, {
      platform,
      ...shareData
    });
    return response.data;
  },

  getShareHistory: async () => {
    const response = await api.get('/share/history');
    return response.data;
  },

  reportShare: async (shareId, feedback) => {
    const response = await api.post(`/share/${shareId}/feedback`, { feedback });
    return response.data;
  }
};

export const analyticsService = {
  getUserStats: async () => {
    const response = await api.get('/analytics/user');
    return response.data;
  },

  getGlobalStats: async () => {
    const response = await api.get('/analytics/global');
    return response.data;
  },

  getRegionStats: async (region) => {
    const response = await api.get(`/analytics/region/${region}`);
    return response.data;
  }
};

export const adminService = {
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    if (params.toString()) url += '&' + params.toString();

    const response = await api.get(url);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getChecks: async (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/checks?page=${page}&limit=${limit}`;
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    if (params.toString()) url += '&' + params.toString();

    const response = await api.get(url);
    return response.data;
  },

  getAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  updateMalagasyRules: async (rules) => {
    const response = await api.put('/admin/malagasy-rules', { rules });
    return response.data;
  },

  getFeedback: async (page = 1, limit = 20, status = null) => {
    let url = `/admin/feedback?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await api.get(url);
    return response.data;
  },

  respondToFeedback: async (feedbackId, response) => {
    const response_api = await api.post(`/admin/feedback/${feedbackId}/respond`, {
      response
    });
    return response_api.data;
  }
};

// Cache local pour le mode hors-ligne
export const cacheService = {
  CACHE_KEYS: {
    CHECK_HISTORY: 'check_history',
    LEARNING_MODULES: 'learning_modules',
    USER_STATS: 'user_stats',
    OFFLINE_CHECKS: 'offline_checks'
  },

  set: (key, data, expiryMinutes = 60) => {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000);
    const cacheData = {
      data,
      expiry,
      timestamp: Date.now()
    };
    localStorage.setItem(`mpanolotsaina_${key}`, JSON.stringify(cacheData));
  },

  get: (key) => {
    try {
      const cacheData = localStorage.getItem(`mpanolotsaina_${key}`);
      if (!cacheData) return null;

      const parsed = JSON.parse(cacheData);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(`mpanolotsaina_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Erreur de lecture du cache:', error);
      return null;
    }
  },

  clear: (key) => {
    localStorage.removeItem(`mpanolotsaina_${key}`);
  },

  clearAll: () => {
    Object.values(cacheService.CACHE_KEYS).forEach(key => {
      localStorage.removeItem(`mpanolotsaina_${key}`);
    });
  },

  // Cache pour les vérifications hors-ligne
  saveOfflineCheck: (content, result) => {
    const offlineChecks = cacheService.get(cacheService.CACHE_KEYS.OFFLINE_CHECKS) || [];
    offlineChecks.unshift({
      id: Date.now().toString(),
      content,
      result,
      timestamp: Date.now(),
      synced: false
    });

    // Garder seulement les 50 dernières vérifications
    if (offlineChecks.length > 50) {
      offlineChecks.splice(50);
    }

    cacheService.set(cacheService.CACHE_KEYS.OFFLINE_CHECKS, offlineChecks, 24 * 60); // 24h
  },

  getOfflineChecks: () => {
    return cacheService.get(cacheService.CACHE_KEYS.OFFLINE_CHECKS) || [];
  },

  markCheckSynced: (checkId) => {
    const offlineChecks = cacheService.get(cacheService.CACHE_KEYS.OFFLINE_CHECKS) || [];
    const checkIndex = offlineChecks.findIndex(check => check.id === checkId);
    if (checkIndex !== -1) {
      offlineChecks[checkIndex].synced = true;
      cacheService.set(cacheService.CACHE_KEYS.OFFLINE_CHECKS, offlineChecks, 24 * 60);
    }
  }
};

export default api;