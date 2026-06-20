import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gfp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept logout calls — let them fail silently
    if (originalRequest?.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // If 401 and not already retrying, try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('gfp_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (response.data.success) {
            const { token } = response.data.data;
            localStorage.setItem('gfp_token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('gfp_token');
          localStorage.removeItem('gfp_refresh_token');
          // Only redirect to login if currently on a protected page
          const publicPaths = ['/', '/login', '/register', '/about', '/services', '/pricing',
            '/transformations', '/blog', '/contact', '/faq', '/success-stories', '/resources', '/forgot-password'];
          const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/blog'));
          if (!isPublic) window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      localStorage.removeItem('gfp_token');
      localStorage.removeItem('gfp_refresh_token');
      // Only redirect to login if currently on a protected page
      const publicPaths = ['/', '/login', '/register', '/about', '/services', '/pricing',
        '/transformations', '/blog', '/contact', '/faq', '/success-stories', '/resources', '/forgot-password'];
      const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/blog'));
      if (!isPublic) window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

// --- Auth Service ---
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getMe: () => api.get('/auth/me'),
};

// --- User Service ---
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

// --- Workout Service ---
export const workoutService = {
  getPrograms: (params) => api.get('/workouts/programs', { params }),
  getProgramById: (id) => api.get(`/workouts/programs/${id}`),
  createProgram: (data) => api.post('/workouts/programs', data),
  updateProgram: (id, data) => api.put(`/workouts/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/workouts/programs/${id}`),
  getExercises: (params) => api.get('/workouts/exercises', { params }),
  createExercise: (data) => api.post('/workouts/exercises', data),
  assignProgram: (userId, programId) => api.post(`/workouts/assign`, { userId, programId }),
  logWorkout: (data) => api.post('/workouts/logs', data),
  getWorkoutHistory: (params) => api.get('/workouts/logs', { params }),
  deleteWorkoutLog: (id) => api.delete(`/workouts/logs/${id}`),
  getMyProgram: () => api.get('/workouts/my-program'),
  getSummary: (days) => api.get('/workouts/summary', { params: { days } }),
};

// --- Nutrition Service ---
export const nutritionService = {
  getPlans: (params) => api.get('/nutrition/plans', { params }),
  getPlanById: (id) => api.get(`/nutrition/plans/${id}`),
  createPlan: (data) => api.post('/nutrition/plans', data),
  updatePlan: (id, data) => api.put(`/nutrition/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/nutrition/plans/${id}`),
  assignPlan: (userId, planId) => api.post('/nutrition/assign', { userId, planId }),
  logMeal: (data) => api.post('/nutrition/log', data),
  getMyPlan: () => api.get('/nutrition/my-plan'),
  getDailyNutritionSummary: (params) => api.get('/nutrition/summary', { params }),
};

// --- Booking Service ---
export const bookingService = {
  getSlots: (date) => api.get('/bookings/slots', { params: { date } }),
  getAvailableSlots: (date) => api.get('/bookings/available-slots', { params: { date } }),
  createBooking: (data) => api.post('/bookings/appointments', data),
  cancelBooking: (id, reason) => api.post(`/bookings/appointments/${id}/cancel`, { reason }),
  rescheduleBooking: (id, data) => api.put(`/bookings/appointments/${id}/reschedule`, data),
  getMyBookings: (params) => api.get('/bookings/appointments', { params }),
  getAllBookings: (params) => api.get('/bookings/appointments', { params }),
  approveBooking: (id) => api.put(`/bookings/appointments/${id}/status`, { status: 'confirmed' }),
  rejectBooking: (id) => api.put(`/bookings/appointments/${id}/status`, { status: 'cancelled' }),
  manageSlots: (data) => api.post('/bookings/slots', data),
  payForBooking: (id, data) => api.post(`/bookings/appointments/${id}/pay`, data),
};

// --- Progress Service ---
export const progressService = {
  addEntry: (data) => api.post('/progress', data),
  getEntries: (params) => api.get('/progress', { params }),
  uploadPhoto: (formData) => api.post('/progress/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getChartData: (type, range) => api.get('/progress/chart', { params: { type, range } }),
  downloadReport: () => api.get('/progress/report', { responseType: 'blob' }),
};

// --- Blog Service ---
export const blogService = {
  getPosts: (params) => api.get('/blog', { params }),
  getPostBySlug: (slug) => api.get(`/blog/${slug}`),
  createPost: (data) => api.post('/blog', data),
  updatePost: (id, data) => api.put(`/blog/${id}`, data),
  deletePost: (id) => api.delete(`/blog/${id}`),
  getCategories: () => api.get('/blog/categories'),
};

// --- Gallery Service ---
export const galleryService = {
  getTransformations: (params) => api.get('/gallery/transformations', { params }),
  createTransformation: (formData) => api.post('/gallery/transformations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteTransformation: (id) => api.delete(`/gallery/transformations/${id}`),
  getTestimonials: (params) => api.get('/gallery/testimonials', { params }),
  createTestimonial: (data) => api.post('/gallery/testimonials', data),
  toggleFeatured: (id) => api.put(`/gallery/testimonials/${id}/toggle-featured`),
};

// --- Payment Service ---
export const paymentService = {
  getPlans: () => api.get('/payments/plans'),
  createOrder: (planKey, billingCycle = 'monthly') => api.post('/payments/orders', { plan_key: planKey, billing_cycle: billingCycle }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getMySubscription: () => api.get('/payments/subscription'),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getInvoice: (paymentId) => api.get(`/payments/${paymentId}/invoice`),
};

// --- Notification Service ---
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// --- Analytics Service ---
export const analyticsService = {
  getDashboard: () => api.get('/analytics/overview'),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getUserStats: (params) => api.get('/analytics/users', { params }),
  getBookingStats: (params) => api.get('/analytics/bookings', { params }),
};

// --- Community Service ---
export const communityService = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  getPostById: (id) => api.get(`/community/posts/${id}`),
  createReply: (postId, data) => api.post(`/community/posts/${postId}/replies`, data),
  getBadges: () => api.get('/community/badges'),
  getMyBadges: () => api.get('/community/my-badges'),
};

// --- AI Service ---
export const aiService = {
  chat: (message) => api.post('/ai/chat', { message }),
  getRecommendations: (type) => api.get('/ai/recommendations', { params: { type } }),
};

// --- Contact Service ---
export const contactService = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
};

// --- Chat Service ---
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getChatHistory: (userId) => api.get(`/chat/messages/${userId}`),
  sendMessage: (data) => api.post('/chat/messages', data), // { receiver_id, message }
  markAsRead: (userId) => api.put(`/chat/messages/${userId}/read`),
};
